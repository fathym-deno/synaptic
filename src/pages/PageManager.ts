export type PageLayout = {
  Columns: number;

  RowHeight?: number;
};

export type PageLayoutSlot = {
  ColumnSpan?: number;

  PageBlockLookup: string;

  RowSpan?: number;
};

export type Page = {
  Lookup: string;

  Layout: string;

  Name: string;

  Slots: PageLayoutSlot[];
};

export class PageManager {
  constructor(protected kv: Deno.Kv, protected pagesRoot = ["Pages"]) {}

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

  public Layouts(): PageLayout[] {
    return loadLayouts();
  }

  public async Save(page: Page): Promise<void> {
    await this.kv.set([...this.pagesRoot, page.Lookup], page);
  }
}

export function loadLayouts(): PageLayout[] {
  return [basicLayout()];
}

export function basicLayout(): PageLayout {
  return {
    Columns: 3,
  };
}
