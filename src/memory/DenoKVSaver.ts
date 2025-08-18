import {
  Checkpoint,
  CheckpointListOptions,
  CheckpointMetadata,
  CheckpointPendingWrite,
  CheckpointTuple,
  PendingWrite,
  SerializerProtocol,
} from "../src.deps.ts";
import {
  BaseCheckpointSaver,
  Buffer,
  RunnableConfig,
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

  // ---------------------------
  // required abstract methods
  // ---------------------------

  public async getTuple(
    config: RunnableConfig,
  ): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointNamespace = config.configurable?.checkpoint_ns;
    const checkpointId = config.configurable?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to get checkpoint. RunnableConfig missing configurable.thread_id.`,
      );
    }
    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to get checkpoint. RunnableConfig missing configurable.checkpoint_ns.`,
      );
    }

    if (checkpointId) {
      const checkpointData = await this.readCheckpoint(
        threadId,
        checkpointNamespace,
        checkpointId,
      );

      if (checkpointData) {
        const [pendingWrites, parentCheckpointId] = await Promise.all([
          this.readPendingWrites(threadId, checkpointNamespace, checkpointId),
          this.denoKv.get<string>([
            ...this.buildCheckpointKey(
              threadId,
              checkpointNamespace,
              checkpointId,
            ),
            "Mark",
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
      this.buildCheckpointKey(threadId, checkpointNamespace, "Latest"),
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
    options?: CheckpointListOptions,
  ): AsyncGenerator<CheckpointTuple> {
    const threadId = config.configurable?.thread_id;
    const checkpointNamespace = config.configurable?.checkpoint_ns;

    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to list checkpoints. RunnableConfig missing configurable.checkpoint_ns.`,
      );
    }

    const threadIds: Set<string> = new Set();

    if (threadId) {
      threadIds.add(threadId);
    } else {
      const threadsKey = [...this.rootKey, "Thread"];
      const threadMarks = await this.denoKv.list<string>({
        prefix: threadsKey,
        end: ["CheckpointNamespace", checkpointNamespace, "Mark"],
      });

      for await (const tm of threadMarks) {
        const tid = tm.key.slice(threadsKey.length)[0] as string;
        threadIds.add(tid);
      }
    }

    const theadCheckpoints = (
      await Promise.all(
        [...threadIds].map(async (tid) => {
          const checkpointsKey = [
            ...this.buildCheckpointNSKey(tid, checkpointNamespace),
            "Checkpoint",
          ];
          const checkpointMarks = await this.denoKv.list<string>({
            prefix: checkpointsKey,
            end: ["Mark"],
          });

          const checkpoints: [
            string, // threadId
            string, // checkpointId
            Checkpoint,
            CheckpointMetadata,
            string, // parentCheckpointId (from Mark value)
          ][] = [];

          for await (const tm of checkpointMarks) {
            const cpId = tm.key.slice(checkpointsKey.length)[0] as string;
            const checkpoint = await this.readCheckpoint(
              tid,
              checkpointNamespace,
              cpId,
            );
            if (checkpoint) {
              checkpoints.push([
                tid,
                cpId,
                checkpoint.Checkpoint,
                checkpoint.Metadata,
                tm.value,
              ]);
            }
          }
          return checkpoints;
        }),
      )
    ).flatMap((tc) => tc);

    const finalTheadCheckpoints = theadCheckpoints
      .filter(([_, cpId]) =>
        options?.before && options.before.configurable?.checkpoint_id
          ? cpId < options.before.configurable?.checkpoint_id
          : true
      )
      .sort(([_a, cpIdA], [_b, cpIdB]) => cpIdB.localeCompare(cpIdA))
      .slice(0, options?.limit ?? theadCheckpoints.length);

    for await (
      const [
        tid,
        checkpointId,
        checkpoint,
        metadata,
        parentCheckpointId,
      ] of finalTheadCheckpoints
    ) {
      const pendingWrites = await this.readPendingWrites(
        tid,
        checkpointNamespace,
        checkpointId,
      );

      yield {
        config: {
          configurable: {
            thread_id: tid, // fix: was "thead_id"
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
                thread_id: tid,
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
    metadata: CheckpointMetadata,
    _newVersions?: Record<string, string | number>, // keep signature compatible
  ): Promise<RunnableConfig> {
    const threadId: string | undefined = config.configurable?.thread_id;
    const checkpointNamespace: string | undefined = config.configurable
      ?.checkpoint_ns;
    const parentCheckpointId: string | undefined = config.configurable
      ?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to put checkpoint. RunnableConfig missing configurable.thread_id.`,
      );
    }
    if (checkpointNamespace === undefined) {
      throw new Error(
        `Failed to put checkpoint. RunnableConfig missing configurable.checkpoint_ns.`,
      );
    }

    await this.writeCheckpoint(
      threadId,
      checkpointNamespace,
      checkpoint,
      metadata,
      parentCheckpointId,
    );

    return {
      configurable: {
        thread_id: threadId, // fix: key name
        checkpoint_ns: checkpointNamespace,
        checkpoint_id: checkpoint.id,
      },
    };
  }

  public async putWrites(
    config: RunnableConfig,
    writes: PendingWrite[],
    taskId: string,
  ): Promise<void> {
    const threadId = config.configurable?.thread_id;
    const checkpointNamespace = config.configurable?.checkpoint_ns;
    const checkpointId = config.configurable?.checkpoint_id;

    if (threadId === undefined) {
      throw new Error(
        `Failed to put writes. RunnableConfig missing configurable.thread_id`,
      );
    }
    if (checkpointId === undefined) {
      throw new Error(
        `Failed to put writes. RunnableConfig missing configurable.checkpoint_id.`,
      );
    }

    await this.writePendingWrites(
      threadId,
      checkpointNamespace,
      checkpointId,
      taskId,
      writes,
    );
  }

  /** NEW: required by BaseCheckpointSaver */
  public async deleteThread(threadId: string): Promise<void> {
    // Delete everything under: [...rootKey, "Thread", threadId, ...]
    const threadPrefix = [...this.rootKey, "Thread", threadId];

    // Utility: bulk delete for a given prefix
    const deletePrefix = async (prefix: Deno.KvKey) => {
      const iter = this.denoKv.list({ prefix });
      for await (const entry of iter) {
        await this.denoKv.delete(entry.key);
      }
    };

    // Enumerate all checkpoint namespaces for this thread and delete their content
    const nsIter = this.denoKv.list<string>({
      prefix: threadPrefix,
      end: ["CheckpointNamespace", "ZZZ"], // range end guard
    });

    // Collect namespaces we’ve seen (keys look like [..., "CheckpointNamespace", ns, ...])
    const namespaces = new Set<string>();
    for await (const item of nsIter) {
      const idx = item.key.findIndex((k) => k === "CheckpointNamespace");
      if (idx >= 0 && item.key.length > idx + 1) {
        namespaces.add(item.key[idx + 1] as string);
      }
    }

    // For each namespace, delete all:
    // - Latest pointer
    // - Mark at namespace level
    // - Every Checkpoint subtree: CP/Chunks, Metadata/Chunks, PendingWrites/Chunks, Mark
    for (const ns of namespaces) {
      const nsPrefix = this.buildCheckpointNSKey(threadId, ns);

      // delete the "Latest" value if present
      await deletePrefix([...nsPrefix, "Checkpoint", "Latest"]);

      // delete namespace-level mark (if any)
      await this.denoKv.delete([...nsPrefix, "Mark"]).catch(() => {});

      // delete all checkpoints under this ns
      const cpPrefix = [...nsPrefix, "Checkpoint"];
      const cpMarks = this.denoKv.list<string>({
        prefix: cpPrefix,
        end: ["Mark"],
      });

      for await (const entry of cpMarks) {
        const cpId = entry.key.slice(cpPrefix.length)[0] as string;
        const cpKey = this.buildCheckpointKey(threadId, ns, cpId);

        // delete chunks and marks beneath the checkpoint
        await deletePrefix([...cpKey, "CP"]);
        await deletePrefix([...cpKey, "Metadata"]);
        await deletePrefix([...cpKey, "PendingWrites"]);
        await this.denoKv.delete([...cpKey, "Mark"]).catch(() => {});
      }
    }

    // Finally, delete the thread subtree root (any leftovers)
    await deletePrefix(threadPrefix);
  }

  // ---------------------------
  // helpers
  // ---------------------------

  protected buildCheckpointKey(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string,
  ): Deno.KvKey {
    return [
      ...this.buildCheckpointNSKey(threadId, checkpointNamespace),
      "Checkpoint",
      checkpointId,
    ];
  }

  protected buildCheckpointNSKey(
    threadId: string,
    checkpointNamespace: string,
  ): Deno.KvKey {
    return [
      ...this.rootKey,
      "Thread",
      threadId,
      "CheckpointNamespace",
      checkpointNamespace,
    ];
  }

  protected async readCheckpoint(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string,
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
      checkpointId,
    );

    let checkpointBlob = new Blob([""]);
    let metadataBlob = new Blob([""]);

    const readCheckpoint = async () => {
      const checkpointChunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, "CP", "Chunks"],
      });
      for await (const cpChunk of checkpointChunks) {
        checkpointBlob = new Blob([checkpointBlob, cpChunk.value]);
      }
    };

    const readMetadata = async () => {
      const metadataChunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, "Metadata", "Chunks"],
      });
      for await (const mdChunk of metadataChunks) {
        metadataBlob = new Blob([metadataBlob, mdChunk.value]);
      }
    };

    await Promise.all([readCheckpoint, readMetadata].map((s) => s()));

    const checkpoint = await checkpointBlob.text();
    if (!checkpoint) return undefined;

    const metadata = await metadataBlob.text();

    return {
      Checkpoint:
        (await this.serde.loadsTyped("json", checkpoint)) as Checkpoint,
      Metadata:
        (await this.serde.loadsTyped("json", metadata)) as CheckpointMetadata,
    };
  }

  protected async readPendingWrites(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string,
  ): Promise<CheckpointPendingWrite[]> {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpointId,
    );

    let writesBlob = new Blob([""]);
    const readPendingWrites = async () => {
      const chunks = await this.denoKv.list<Uint8Array>({
        prefix: [...checkpointKey, "PendingWrites", "Chunks"],
      });
      for await (const cpChunk of chunks) {
        writesBlob = new Blob([writesBlob, cpChunk.value]);
      }
    };

    await Promise.all([readPendingWrites].map((s) => s()));

    const text = (await writesBlob.text()) || "[]";
    const parsed: CheckpointPendingWrite[] = await this.serde.loadsTyped(
      "json",
      text,
    );
    return parsed;
  }

  protected async writeCheckpoint(
    threadId: string,
    checkpointNamespace: string,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    parentCheckpointId?: string,
  ) {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpoint.id,
    );

    const [, serializedCheckpoint] = await this.serde.dumpsTyped(checkpoint);
    const [, serializedMetadata] = await this.serde.dumpsTyped(metadata);

    const checkpointBlob = toReadableStream(new Buffer(serializedCheckpoint));
    const metadataBlob = toReadableStream(new Buffer(serializedMetadata));

    const writeLatestCheckpoint = async () => {
      const latest = await this.denoKv.get<string>(
        this.buildCheckpointKey(threadId, checkpointNamespace, "Latest"),
      );
      const newLatest = latest.value
        ? [checkpoint.id, latest.value].sort((a, b) => b.localeCompare(a))[0]
        : checkpoint.id;

      await this.denoKv.set(
        this.buildCheckpointKey(threadId, checkpointNamespace, "Latest"),
        newLatest,
        { expireIn: this.checkpointTtl },
      );
    };

    const writeThreadMark = async () => {
      await this.denoKv.set(
        [...this.buildCheckpointNSKey(threadId, checkpointNamespace), "Mark"],
        true,
        { expireIn: this.checkpointTtl },
      );
    };

    const writeCheckpointMark = async () => {
      await this.denoKv.set(
        [...checkpointKey, "Mark"],
        parentCheckpointId ?? "",
        { expireIn: this.checkpointTtl },
      );
    };

    const writeCheckpointChunks = async () => {
      let cpChunkCount = 0;
      for await (const cpChunk of checkpointBlob) {
        const chunkKey = [...checkpointKey, "CP", "Chunks", cpChunkCount++];
        await this.denoKv.set(chunkKey, cpChunk, {
          expireIn: this.checkpointTtl,
        });
      }
    };

    const writeMetadataChunks = async () => {
      let mdChunkCount = 0;
      for await (const cpChunk of metadataBlob) {
        const chunkKey = [
          ...checkpointKey,
          "Metadata",
          "Chunks",
          mdChunkCount++,
        ];
        await this.denoKv.set(chunkKey, cpChunk, {
          expireIn: this.checkpointTtl,
        });
      }
    };

    await Promise.all(
      [
        writeLatestCheckpoint,
        writeThreadMark,
        writeCheckpointMark,
        writeCheckpointChunks,
        writeMetadataChunks,
      ].map((s) => s()),
    );
  }

  protected async writePendingWrites(
    threadId: string,
    checkpointNamespace: string,
    checkpointId: string,
    taskId: string,
    writes: PendingWrite[],
  ) {
    const checkpointKey = this.buildCheckpointKey(
      threadId,
      checkpointNamespace,
      checkpointId,
    );

    const pendingWrites: CheckpointPendingWrite[] = await Promise.all(
      (writes ?? []).map(async ([channel, value]) => {
        const [, serializedValue] = await this.serde.dumpsTyped(value);
        return [taskId, channel, serializedValue];
      }),
    );

    const [, serializedWrites] = await this.serde.dumpsTyped(pendingWrites);
    const writesBlob = toReadableStream(new Buffer(serializedWrites));

    let cpChunkCount = 0;
    for await (const cpChunk of writesBlob) {
      const chunkKey = [
        ...checkpointKey,
        "PendingWrites",
        "Chunks",
        cpChunkCount++,
      ];
      await this.denoKv.set(chunkKey, cpChunk, {
        expireIn: this.checkpointTtl,
      });
    }
  }
}
