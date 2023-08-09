import { RedundantIndexes } from "./RedundantIndexes"
import { MongoDatabaseProviderStub } from "../../adapters/secondary/gateways/mongo-database/MongoDatabaseProviderStub"
import { buildIndex } from "../../../test/helpers/buildIndex.test"

describe("RedundantIndexes", () => {
  let mongoDatabaseProvider: MongoDatabaseProviderStub

  beforeEach(() => {
    mongoDatabaseProvider = new MongoDatabaseProviderStub()
  })

  it("should return nothing if there are no indexes", async () => {
    mongoDatabaseProvider.indexes = {}
    const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
    const result = await redundantIndexes.execute()
    expect(result).toEqual([])
  })

  it("should return nothing if there is only one index", async () => {
    mongoDatabaseProvider.indexes = { collection: [buildIndex({ field1: 1 })] }
    const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
    const result = await redundantIndexes.execute()
    expect(result).toEqual([])
  })

  it("should return the index as redundant if there are two indexes with the same details", async () => {
    mongoDatabaseProvider.indexes = {
      collection: [
        buildIndex({ field1: 1 }, "collection", "field1_1"),
        buildIndex({ field1: 1 }, "collection", "field1_-1"),
      ],
    }
    const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
    const result = await redundantIndexes.execute()
    expect(result).toEqual([
      {
        name: "field1_1",
        collection: "collection",
        details: {
          key: { field1: 1 },
        },
        redundantWith: [buildIndex({ field1: 1 }, "collection", "field1_-1")],
      },
      {
        name: "field1_-1",
        collection: "collection",
        details: {
          key: { field1: 1 },
        },
        redundantWith: [buildIndex({ field1: 1 }, "collection", "field1_1")],
      },
    ])
  })

  it("should return the index as redundant if there are two indexes with the same details and one of them is a compound index", async () => {
    mongoDatabaseProvider.indexes = {
      collection: [
        buildIndex({ field1: 1, field2: 1 }),
        buildIndex({ field1: 1 }),
        buildIndex({ field1: 1, field2: 1, field: 1 }),
        buildIndex({ field1: 1, field2: -1 }),
        buildIndex({ field1: -1 }),
      ],
    }
    const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
    const result = await redundantIndexes.execute()
    expect(result).toEqual([
      {
        name: "field1_1_field2_1",
        collection: "collection",
        details: {
          key: { field1: 1, field2: 1 },
        },
        redundantWith: [buildIndex({ field1: 1, field2: 1, field: 1 })],
      },
      {
        name: "field1_1",
        collection: "collection",
        details: {
          key: { field1: 1 },
        },
        redundantWith: [
          buildIndex({ field1: 1, field2: 1 }),
          buildIndex({ field1: 1, field2: 1, field: 1 }),
          buildIndex({ field1: 1, field2: -1 }),
        ],
      },
    ])
  })

  it("should connect and disconnect after run", async () => {
    mongoDatabaseProvider.indexes = {}
    const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
    await redundantIndexes.execute()
    expect(mongoDatabaseProvider.calls).toEqual(["connect", "disconnect"])
  })
})
