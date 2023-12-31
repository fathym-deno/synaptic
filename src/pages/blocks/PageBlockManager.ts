// deno-lint-ignore-file no-explicit-any
import { FunctionConfig } from "./FunctionConfig.ts";

export type PageBlock = {
  Lookup: string;

  Name: string;

  Type: string;

  Details: any;
};

export class PageBlockManager {
  constructor(
    protected kv: Deno.Kv,
    protected functions: FunctionConfig[],
    protected pageBlocksRoot = ["PageBlocks"],
  ) {}

  public async Delete(pageBlockLookup: string): Promise<void> {
    await this.kv.delete([...this.pageBlocksRoot, pageBlockLookup]);
  }

  public async Get(pageBlockLookup: string): Promise<PageBlock> {
    const { value } = await this.kv.get([
      ...this.pageBlocksRoot,
      pageBlockLookup,
    ]);

    return value as PageBlock;
  }

  public async List(): Promise<PageBlock[]> {
    const pageBlockList = await this.kv.list({
      prefix: this.pageBlocksRoot,
    });

    const pageBlocks: PageBlock[] = [];

    for await (const pageBlock of pageBlockList) {
      const { value } = pageBlock;

      pageBlocks.push(value as PageBlock);
    }

    return pageBlocks;
  }

  public Functions(): FunctionConfig[] {
    return this.functions;
  }

  public async Save(pageBlock: PageBlock): Promise<void> {
    await this.kv.set([...this.pageBlocksRoot, pageBlock.Lookup], pageBlock);
  }
}
