import {
  Checkpoint,
  CheckpointListOptions,
  CheckpointMetadata,
  CheckpointPendingWrite,
  CheckpointTuple,
  PendingWrite,
  SerializerProtocol,
} from '../src.deps.ts';
import {
  BaseCheckpointSaver,
  Buffer,
  RunnableConfig,
  toReadableStream,
} from '../src.deps.ts';

export class DenoKVSaver extends BaseCheckpointSaver {
  constructor(
    protected denoKv: Deno.Kv,
    protected rootKey: Deno.KvKey,
    protected checkpointTtl?: number,
    serde?: SerializerProtocol
  ) {
    super(serde);
  }

  public async getTuple(
    config: RunnableConfig
  ): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;

    const checkpointNamespace = config.configurable?.checkpoint_ns;

    const checkpointId = config.configurable?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to put checkpoint. The passed RunnableConfig is missing a required "thread_id" field in its "configurable" property.`
      );
    }

    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to put checkpoint. The passed RunnableConfig is missing a required "checkpoint_ns" field in its "configurable" property.`
      );
    }

    if (checkpointId) {
      const checkpointData = await this.readCheckpoint(
        threadId,
        checkpointNamespace,
        checkpointId
      );

      if (checkpointData) {
        const [pendingWrites, parentCheckpointId] = await Promise.all([
          this.readPendingWrites(threadId, checkpointNamespace, checkpointId),
          this.denoKv.get<string>([
            ...this.buildCheckpointKey(
              threadId,
              checkpointNamespace,
              checkpointId
            ),
            'Mark',
          ]),
        ]);

        return {
          config,
          checkpoint: checkpointData.Checkpoint,
          metadata: checkpointData.Metadata,
          pendingWrites: pendingWrites ?? [],
          ...(parentCheckpointId.value
            ? {
                parentConfig: {
                  configurable: {
                    thread_id: threadId,
                    checkpoint_ns: checkpointNamespace,
                    checkpoint_id: parentCheckpointId.value,
                  },
                },
              }
            : {}),
        };
      }
    }

    const latestCheckpoint = await this.denoKv.get<string>(
      this.buildCheckpointKey(threadId, checkpointNamespace, 'Latest')
    );

    if (latestCheckpoint.value) {
      config.configurable = {
        ...(config.configurable || {}),
        checkpoint_id: latestCheckpoint.value,
      };

      return await this.getTuple(config);
    }

    return undefined;
  }

  public async *list(
    config: RunnableConfig,
    options?: CheckpointListOptions
    // ): AsyncGenerator<CheckpointTuple<BaseCheckpointSaver['getTuple']>> {
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;

    const checkpointNamespace = config.configurable?.checkpoint_ns;

    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to put checkpoint. The passed RunnableConfig is missing a required "checkpoint_ns" field in its "configurable" property.`
      );
    }

    const threadIds: Set<string> = new Set();

    if (threadId) {
      threadIds.add(threadId);
    } else {
      const threadsKey = [...this.rootKey, 'Thread'];

      const threadMarks = await this.denoKv.list<string>({
        prefix: threadsKey,
        end: ['CheckpointNamespace', checkpointNamespace, 'Mark'],
      });

      for await (const tm of threadMarks) {
        const threadId = tm.key.slice(threadsKey.length)[0] as string;

        threadIds.add(threadId);
      }
    }

    const theadCheckpoints = (
      await Promise.all(
        [...threadIds].map(async (threadId) => {
          const checkpointsKey = [
            ...this.buildCheckpointNSKey(threadId, checkpointNamespace),
            'Checkpoint',
          ];

          const checkpointMarks = await this.denoKv.list<string>({
            prefix: checkpointsKey,
            end: ['Mark'],
          });

          const checkpoints: [
            string,
            string,
            Checkpoint,
            CheckpointMetadata,
            string
          ][] = [];

          for await (const tm of checkpointMarks) {
            const checkpointId = tm.key.slice(
              checkpointsKey.length
            )[0] as string;

            const checkpoint = await this.readCheckpoint(
              threadId,
              checkpointNamespace,
              checkpointId
            );

            if (checkpoint) {
              checkpoints.push([
                threadId,
                checkpointId,
                checkpoint.Checkpoint,
                checkpoint.Metadata,
                tm.value,
              ]);
            }
          }

          return checkpoints;
        })
      )
    ).flatMap((tc) => tc);

    const finalTheadCheckpoints = theadCheckpoints
      // Filter out records not before the before option
      .filter(([_, cpId]) =>
        options?.before && options.before.configurable?.checkpoint_id
          ? cpId < options.before.configurable?.checkpoint_id
          : true
      )
      // Sort in desc order
      .sort(([_a, cpIdA], [_b, cpIdB]) => cpIdB.localeCompare(cpIdA))
      // Limit results based on options
      .slice(0, options?.limit ?? theadCheckpoints.length);

    for await (const [
      threadId,
      checkpointId,
      checkpoint,
      metadata,
      parentCheckpointId,
    ] of finalTheadCheckpoints) {
      const pendingWrites = await this.readPendingWrites(
        threadId,
        checkpointNamespace,
        checkpointId
      );

      yield {
        config: {
          configurable: {
            thead_id: threadId,
            checkpoint_ns: checkpointNamespace,
            checkpoint_id: checkpointId,
          },
        },
        checkpoint,
        metadata,
        pendingWrites: pendingWrites ?? [],
        ...(parentCheckpointId
          ? {
              parentConfig: {
                configurable: {
                  thread_id: threadId,
                  checkpoint_ns: checkpointNamespace,
                  checkpoint_id: parentCheckpointId,
                },
              },
            }
          : {}),
      };
    }
  }

  public async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const threadId: string = config.configurable?.thread_id;

    const checkpointNamespace: string = config.configurable?.checkpoint_ns;

    const parentCheckpointId: string | undefined =
      config.configurable?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to put checkpoint. The passed RunnableConfig is missing a required "thread_id" field in its "configurable" property.`
      );
    }

    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to put checkpoint. The passed RunnableConfig is missing a required "checkpoint_ns" field in its "configurable" property.`
      );
    }

    await this.writeCheckpoint(
      threadId,
      checkpointNamespace,
      checkpoint,
      metadata,
      parentCheckpointId
    );

    return {
      configurable: {
        threadId,
        checkpoint_ns: checkpointNamespace,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  public async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string
  ): Promise<void> {
    const threadId = config.configurable?.thread_id;

    const checkpointNamespace = config.configurable?.checkpoint_ns;

    const checkpointId = config.configurable?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to put writes. The passed RunnableConfig is missing a required "thread_id" field in its "configurable" property`
      );
    }

    if (checkpointId === undefined) {
      throw new Error(
        `Failed to put writes. The passed RunnableConfig is missing a required "checkpoint_id" field in its "configurable" property.`
      );
    }

    await this.writePendingWrites(
      threadId,
      checkpointNamespace,
      checkpointId,
      taskId,
      writes
    );
  }

  protected buildCheckpointKey(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string
  ): Deno.KvKey {
    const checkpointKey = [
      ...this.buildCheckpointNSKey(threadId, checkpointNamespace),
      'Checkpoint',
      checkpointId,
    ];

    return checkpointKey;
  }

  protected buildCheckpointNSKey(
    threadId: string,
    checkpointNamespace: string
  ): Deno.KvKey {
    const checkpointKey = [
      ...this.rootKey,
      'Thread',
      threadId,
      'CheckpointNamespace',
      checkpointNamespace,
    ];

    return checkpointKey;
  }

  protected async readCheckpoint(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string
  ): Promise<
    | {
        Checkpoint: Checkpoint;
        Metadata: CheckpointMetadata;
      }
    | undefined
  > {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpointId
    );

    let checkpointBlob = new Blob(['']);

    let metadataBlob = new Blob(['']);

    const readCheckpoint = async () => {
      const checkpointChunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, 'CP', 'Chunks'],
      });

      for await (const cpChunk of checkpointChunks) {
        checkpointBlob = new Blob([checkpointBlob, cpChunk.value]);
      }
    };

    const readMetadata = async () => {
      const metadataChunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, 'Metadata', 'Chunks'],
      });

      for await (const mdChunk of metadataChunks) {
        metadataBlob = new Blob([metadataBlob, mdChunk.value]);
      }
    };

    await Promise.all([readCheckpoint, readMetadata].map((s) => s()));

    const checkpoint = await checkpointBlob.text();

    if (checkpoint) {
      const metadata = await metadataBlob.text();

      return {
        Checkpoint: (await this.serde.loadsTyped(
          'json',
          checkpoint
        )) as Checkpoint,
        Metadata: (await this.serde.loadsTyped(
          'json',
          metadata
        )) as CheckpointMetadata,
      };
    } else {
      return undefined;
    }
  }

  protected async readPendingWrites(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string
  ): Promise<CheckpointPendingWrite[]> {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpointId
    );

    let writesBlob = new Blob(['']);

    const readPendingWrites = async () => {
      const checkpointChunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, 'PendingWrites', 'Chunks'],
      });

      for await (const cpChunk of checkpointChunks) {
        writesBlob = new Blob([writesBlob, cpChunk.value]);
      }
    };

    await Promise.all([readPendingWrites].map((s) => s()));

    const checkpointWritesStr = (await writesBlob.text()) || '[]';

    const checkpointWrites: CheckpointPendingWrite[] =
      await this.serde.loadsTyped('json', checkpointWritesStr);

    return checkpointWrites;
  }

  protected async writeCheckpoint(
    threadId: string,
    checkpointNamespace: string,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    parentCheckpointId?: string
  ) {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpoint.id
    );

    const [, serializedCheckpoint] = await this.serde.dumpsTyped(checkpoint);
    const [, serializedMetadata] = await this.serde.dumpsTyped(metadata);

    const checkpointBlob = toReadableStream(new Buffer(serializedCheckpoint));

    const metadataBlob = toReadableStream(new Buffer(serializedMetadata));

    const writeLatestCheckpoint = async () => {
      const latest = await this.denoKv.get<string>(
        this.buildCheckpointKey(threadId, checkpointNamespace, 'Latest')
      );

      const newLatest = latest.value
        ? [checkpoint.id, latest.value].sort((a, b) => b.localeCompare(a))[0]
        : checkpoint.id;

      await this.denoKv.set(
        this.buildCheckpointKey(threadId, checkpointNamespace, 'Latest'),
        newLatest,
        {
          expireIn: this.checkpointTtl,
        }
      );
    };

    const writeThreadMark = async () => {
      await this.denoKv.set(
        [...this.buildCheckpointNSKey(threadId, checkpointNamespace), 'Mark'],
        true,
        {
          expireIn: this.checkpointTtl,
        }
      );
    };

    const writeCheckpointMark = async () => {
      await this.denoKv.set(
        [...checkpointKey, 'Mark'],
        parentCheckpointId ?? '',
        {
          expireIn: this.checkpointTtl,
        }
      );
    };

    const writeCheckpointChunks = async () => {
      let cpChunkCount = 0;

      for await (const cpChunk of checkpointBlob) {
        const chunkKey = [...checkpointKey, 'CP', 'Chunks', cpChunkCount];

        await this.denoKv.set(chunkKey, cpChunk, {
          expireIn: this.checkpointTtl,
        });

        cpChunkCount++;
      }
    };

    const writeMetadataChunks = async () => {
      let mdChunkCount = 0;

      for await (const cpChunk of metadataBlob) {
        const chunkKey = [...checkpointKey, 'Metadata', 'Chunks', mdChunkCount];

        await this.denoKv.set(chunkKey, cpChunk, {
          expireIn: this.checkpointTtl,
        });

        mdChunkCount++;
      }
    };

    await Promise.all(
      [
        writeLatestCheckpoint,
        writeThreadMark,
        writeCheckpointMark,
        writeCheckpointChunks,
        writeMetadataChunks,
      ].map((s) => s())
    );
  }

  protected async writePendingWrites(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string,
    taskId: string,
    writes: PendingWrite[]
  ) {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpointId
    );

    const pendingWrites: CheckpointPendingWrite[] = await Promise.all(
      (writes ?? []).map(async ([channel, value]) => {
        const [, serializedValue] = await this.serde.dumpsTyped(value);

        return [taskId, channel, serializedValue];
      })
    );

    const [, serializedWrites] = await this.serde.dumpsTyped(pendingWrites);

    const writesBlob = toReadableStream(new Buffer(serializedWrites));

    const writePendingChunks = async () => {
      let cpChunkCount = 0;

      for await (const cpChunk of writesBlob) {
        const chunkKey = [
          ...checkpointKey,
          'PendingWrites',
          'Chunks',
          cpChunkCount,
        ];

        await this.denoKv.set(chunkKey, cpChunk, {
          expireIn: this.checkpointTtl,
        });

        cpChunkCount++;
      }
    };

    await Promise.all([writePendingChunks].map((s) => s()));
  }
}
