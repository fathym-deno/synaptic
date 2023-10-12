// deno-lint-ignore-file no-explicit-any
import { PageLayoutConfig } from "./PageLayoutConfig.ts";

export type PageLayoutSlot = {
  Details: any;

  PageBlockLookup: string;
};

export type Page = {
  Details: any;

  LayoutLookup: string;

  Lookup: string;

  Name: string;

  Slots: PageLayoutSlot[];
};

export class PageManager {
  constructor(
    protected kv: Deno.Kv,
    protected pageLayouts: PageLayoutConfig[],
    protected pagesRoot = ["Pages"],
  ) {}

  public async Delete(pageLookup: string): Promise<void> {
    await this.kv.delete([...this.pagesRoot, pageLookup]);
  }

  public async Get(pageLookup: string): Promise<Page> {
    const { value } = await this.kv.get([...this.pagesRoot, pageLookup]);

    return value as Page;
  }

  public async List(): Promise<Page[]> {
    const pageList = await this.kv.list({ prefix: this.pagesRoot });

    const pages: Page[] = [];

    for await (const page of pageList) {
      const { value } = page;

      pages.push(value as Page);
    }

    return pages;
  }

  public Layouts(): Promise<PageLayoutConfig[]> {
    return Promise.resolve(this.pageLayouts);
  }

  public async Save(page: Page): Promise<void> {
    await this.kv.set([...this.pagesRoot, page.Lookup], page);
  }
}
