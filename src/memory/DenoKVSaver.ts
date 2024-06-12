import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
  RunnableConfig,
  SerializerProtocol,
} from "../src.deps.ts";

export class DenoKVSaver extends BaseCheckpointSaver {
  constructor(
    protected denoKv: Deno.Kv,
    protected rootKey: Deno.KvKey,
    protected checkpointTtl?: number,
    serde?: SerializerProtocol,
  ) {
    super(serde);
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const thread_id = config.configurable?.thread_id;
    const checkpoint_id = config.configurable?.checkpoint_id;

    if (checkpoint_id) {
      const checkpoint = await this.denoKv.get<[string, string]>([
        ...this.rootKey,
        "Thread",
        thread_id,
        "Checkpoint",
        checkpoint_id,
      ]);

      if (checkpoint.value) {
        const [cp, meta] = checkpoint.value;

        return {
          config,
          checkpoint: (await this.serde.parse(cp)) as Checkpoint,
          metadata: (await this.serde.parse(meta)) as CheckpointMetadata,
        };
      }
    } else {
      const checkpoints = await this.denoKv.list<[string, string]>({
        prefix: [...this.rootKey, "Thread", thread_id, "Checkpoint"],
      });

      let checkpoint: [string, string, string] | undefined;

      for await (const cp of checkpoints) {
        checkpoint = [cp.key.slice(-1)[0] as string, ...cp.value];
      }

      if (checkpoint) {
        const [id, cp, meta] = checkpoint;

        return {
          config: { configurable: { thread_id, checkpoint_id: id } },
          checkpoint: (await this.serde.parse(cp)) as Checkpoint,
          metadata: (await this.serde.parse(meta)) as CheckpointMetadata,
        };
      }
    }

    return undefined;
  }

  async *list(
    config: RunnableConfig,
    limit?: number,
    before?: RunnableConfig,
  ): AsyncGenerator<CheckpointTuple> {
    const thread_id = config.configurable?.thread_id;

    const checkpointsRes = await this.denoKv.list<[string, string]>({
      prefix: [...this.rootKey, "Thread", thread_id, "Checkpoint"],
    });

    const checkpoints: [string, string, string][] = [];

    for await (const cp of checkpointsRes) {
      checkpoints.push([cp.key.slice(-1)[0] as string, ...cp.value]);
    }

    // sort in desc order
    for await (
      const [id, cp, meta] of checkpoints
        .filter((c) =>
          before ? c[0] < before.configurable?.checkpoint_id : true
        )
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, limit)
    ) {
      yield {
        config: { configurable: { thread_id, checkpoint_id: id } },
        checkpoint: (await this.serde.parse(cp)) as Checkpoint,
        metadata: (await this.serde.parse(meta)) as CheckpointMetadata,
      };
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
  ): Promise<RunnableConfig> {
    const thread_id = config.configurable?.thread_id;

    await this.denoKv.set(
      [...this.rootKey, "Thread", thread_id, "Checkpoint", checkpoint.id],
      [this.serde.stringify(checkpoint), this.serde.stringify(metadata)],
      {
        expireIn: this.checkpointTtl,
      },
    );

    return {
      configurable: {
        thread_id,
        checkpoint_id: checkpoint.id,
      },
    };
  }
}
