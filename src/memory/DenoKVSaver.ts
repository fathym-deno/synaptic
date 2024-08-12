import {
  BaseCheckpointSaver,
  Buffer,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
  RunnableConfig,
  SerializerProtocol,
  toReadableStream,
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

  public async getTuple(
    config: RunnableConfig,
  ): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id ??
      config.configurable?.transferCheckpointId;

    if (checkpointId) {
      const checkpointData = await this.readCheckpoint(threadId, checkpointId);

      delete config.configurable?.transferCheckpointId;

      if (checkpointData) {
        return {
          config,
          checkpoint: checkpointData.Checkpoint,
          metadata: checkpointData.Metadata,
        };
      }
    } else {
      const latestCheckpoint = await this.denoKv.get<string>([
        ...this.rootKey,
        "Thread",
        threadId,
        "Checkpoint",
        "Latest",
      ]);

      if (latestCheckpoint.value) {
        config.configurable = {
          ...(config.configurable || {}),
          transferCheckpointId: latestCheckpoint.value,
        };

        return await this.getTuple(config);
      }
    }

    return undefined;
  }

  public async *list(
    config: RunnableConfig,
    limit?: number,
    before?: RunnableConfig,
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;

    const checkpointsRes = await this.denoKv.list<boolean>({
      prefix: [...this.rootKey, "Thread", threadId, "Checkpoint", "Mark"],
    });

    const checkpoints: [string, Checkpoint, CheckpointMetadata][] = [];

    for await (const cp of checkpointsRes) {
      const checkpointId = cp.key.slice(-1)[0] as string;

      const checkpointData = await this.readCheckpoint(threadId, checkpointId);

      if (checkpointData) {
        checkpoints.push([
          checkpointId,
          checkpointData.Checkpoint,
          checkpointData.Metadata,
        ]);
      }
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
        config: { configurable: { thead_id: threadId, checkpoint_id: id } },
        checkpoint: cp,
        metadata: meta,
      };
    }
  }

  public async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;

    await this.writeCheckpoint(threadId, checkpoint, metadata);

    return {
      configurable: {
        threadId,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  protected async readCheckpoint(
    threadId: string,
    checkpointId: string,
  ): Promise<
    | {
      Checkpoint: Checkpoint;
      Metadata: CheckpointMetadata;
    }
    | undefined
  > {
    const checkpointKey = [
      ...this.rootKey,
      "Thread",
      threadId,
      "Checkpoint",
      checkpointId,
    ];

    let checkpointBlob = new Blob([""]);

    let metadataBlob = new Blob([""]);

    await Promise.all(
      [
        async () => {
          const checkpointChunks = await this.denoKv.list<Uint8Array>({
            prefix: [...checkpointKey, "CP", "Chunks"],
          });

          for await (const cpChunk of checkpointChunks) {
            checkpointBlob = new Blob([checkpointBlob, cpChunk.value]);
          }
        },
        async () => {
          const metadataChunks = await this.denoKv.list<Uint8Array>({
            prefix: [...checkpointKey, "Metadata", "Chunks"],
          });

          for await (const mdChunk of metadataChunks) {
            metadataBlob = new Blob([metadataBlob, mdChunk.value]);
          }
        },
      ].map((s) => s()),
    );

    const checkpoint = await checkpointBlob.text();

    if (checkpoint) {
      const metadata = await metadataBlob.text();

      // console.log('checkpoint');
      // console.log(checkpoint);
      return {
        Checkpoint: (await this.serde.parse(checkpoint)) as Checkpoint,
        Metadata: (await this.serde.parse(metadata)) as CheckpointMetadata,
      };
    } else {
      return undefined;
    }
  }

  protected async writeCheckpoint(
    threadId: string,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
  ) {
    const checkpointKey = [
      ...this.rootKey,
      "Thread",
      threadId,
      "Checkpoint",
      checkpoint.id,
    ];

    const encoder = new TextEncoder();

    const checkpointBlob = toReadableStream(
      new Buffer(encoder.encode(this.serde.stringify(checkpoint))),
    );

    const metadataBlob = toReadableStream(
      new Buffer(encoder.encode(this.serde.stringify(metadata))),
    );

    await Promise.all(
      [
        async () => {
          const latest = await this.denoKv.get<string>([
            ...this.rootKey,
            "Thread",
            threadId,
            "Checkpoint",
            "Latest",
          ]);

          const newLatest = latest.value
            ? [checkpoint.id, latest.value].sort((a, b) =>
              b.localeCompare(a)
            )[0]
            : checkpoint.id;

          await this.denoKv.set(
            [...this.rootKey, "Thread", threadId, "Checkpoint", "Latest"],
            newLatest,
            {
              expireIn: this.checkpointTtl,
            },
          );
        },
        async () => {
          await this.denoKv.set(
            [
              ...this.rootKey,
              "Thread",
              threadId,
              "Checkpoint",
              "Mark",
              checkpoint.id,
            ],
            true,
            {
              expireIn: this.checkpointTtl,
            },
          );
        },
        async () => {
          let cpChunkCount = 0;

          for await (const cpChunk of checkpointBlob) {
            const chunkKey = [...checkpointKey, "CP", "Chunks", cpChunkCount];

            await this.denoKv.set(chunkKey, cpChunk, {
              expireIn: this.checkpointTtl,
            });

            cpChunkCount++;
          }
        },
        async () => {
          let mdChunkCount = 0;

          for await (const cpChunk of metadataBlob) {
            const chunkKey = [
              ...checkpointKey,
              "Metadata",
              "Chunks",
              mdChunkCount,
            ];

            await this.denoKv.set(chunkKey, cpChunk, {
              expireIn: this.checkpointTtl,
            });

            mdChunkCount++;
          }
        },
      ].map((s) => s()),
    );
  }
}
