type DatasetItem = {
  slug?: unknown;
  title?: unknown;
  summary?: unknown;
  tags?: unknown;
};

export function validateDataset<T extends DatasetItem>(
  datasetName: string,
  items: T[]
): T[] {
  const slugSet = new Set<string>();

  items.forEach((item, index) => {
    const slug = typeof item.slug === "string" ? item.slug.trim() : "";
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const summary = typeof item.summary === "string" ? item.summary.trim() : "";
    const tags = item.tags;

    if (!slug || !title || !summary) {
      throw new Error(
        `[data:${datasetName}] 必須項目不足 (index=${index}, slug="${slug}")`
      );
    }

    if (!Array.isArray(tags)) {
      throw new Error(
        `[data:${datasetName}] tags は配列である必要があります (index=${index}, slug="${slug}")`
      );
    }

    if (slugSet.has(slug)) {
      throw new Error(
        `[data:${datasetName}] slug が重複しています: "${slug}"`
      );
    }

    slugSet.add(slug);
  });

  return items;
}
