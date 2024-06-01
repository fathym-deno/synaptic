import {
  ListKeyOptions,
  RecordManagerInterface,
  UpdateOptions,
} from "../src.deps.ts";

export type DenoKVRecordManagerOptions = {
  KV: Deno.Kv;

  RootKey: Deno.KvKey;
};

export type DenoKVRecord = { updatedAt: number; groupId: string | null };

export class DenoKVRecordManager implements RecordManagerInterface {
  constructor(protected config: DenoKVRecordManagerOptions) {}

  public createSchema(): Promise<void> {
    return Promise.resolve();
  }

  public getTime(): Promise<number> {
    return Promise.resolve(Date.now());
  }

  public async update(
    keys: string[],
    updateOptions?: UpdateOptions,
  ): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    const updatedAt = await this.getTime();

    const { timeAtLeast, groupIds: _groupIds } = updateOptions ?? {};

    if (timeAtLeast && updatedAt < timeAtLeast) {
      throw new Error(
        `Time sync issue with database ${updatedAt} < ${timeAtLeast}`,
      );
    }

    const groupIds = _groupIds ?? keys.map(() => null);

    if (groupIds.length !== keys.length) {
      throw new Error(
        `Number of keys (${keys.length}) does not match number of group_ids ${groupIds.length})`,
      );
    }

    const keyChunks = chunkArray(keys, 750);

    const calls = keyChunks.map(async (ck) => {
      const op = this.config.KV.atomic();

      for (const [i, key] of ck.entries()) {
        const old = await this.config.KV.get<DenoKVRecord>(
          this.buildKey([key]),
        );

        old.value = {
          ...(old.value ?? {
            groupId: groupIds[i],
          }),
          updatedAt,
        };

        op.set(this.buildKey([key]), old.value);
      }

      await op.commit();
    });

    await Promise.all(calls);
  }

  public async exists(keys: string[]): Promise<boolean[]> {
    const kvKeys = chunkArray(keys.map((k) => [...this.config.RootKey, k]));

    const getCalls = kvKeys.map(async (kk) => {
      const vals = await this.config.KV.getMany(kk);

      return vals.map((v) => !!v.value);
    });

    const existChecks = await Promise.all(getCalls);

    return existChecks.flatMap((v) => v);
  }

  public async listKeys(options?: ListKeyOptions): Promise<string[]> {
    const { before, after, limit, groupIds } = options ?? {};

    const vals = await this.config.KV.list<DenoKVRecord>({
      prefix: this.config.RootKey,
    });

    const keys: string[] = [];

    for await (const val of vals) {
      const isBefore = !before || val.value.updatedAt <= before;

      const isAfter = !after || val.value.updatedAt >= after;

      const belongsToGroup = !groupIds || groupIds.includes(val.value.groupId);

      if (isBefore && isAfter && belongsToGroup) {
        keys.push(val.key.slice(this.config.RootKey.length)[0] as string);
      }

      if (limit && keys.length >= limit) {
        break;
      }
    }

    return keys.slice(0, limit ?? keys.length);
  }

  public async deleteKeys(keys: string[]): Promise<void> {
    const keyChunks = chunkArray(keys, 750);

    const calls = keyChunks.map(async (ck) => {
      let op = this.config.KV.atomic();

      for (const key of ck) {
        op = op.delete(this.buildKey([key]));
      }

      await op.commit();
    });

    await Promise.all(calls);
  }

  /**
   * Terminates the connection pool.
   * @returns {Promise<void>}
   */
  public async end(): Promise<void> {
    await this.config.KV.close();
  }

  protected buildKey(key: Deno.KvKey): Deno.KvKey {
    return [...this.config.RootKey, ...key];
  }
}

export function chunkArray<T>(arr: T[], chunkSize: number = 10): T[][] {
  return Array.from(
    { length: Math.ceil(arr.length / chunkSize) },
    (_, i) => arr.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
}
