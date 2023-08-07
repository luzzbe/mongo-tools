export const buildIndex = (
  key: Record<string, number>,
  collection?: string,
  name?: string,
) => ({
  name: name ?? Object.entries(key).flat().join("_"),
  collection: collection ?? "collection",
  details: {
    key,
  },
})
