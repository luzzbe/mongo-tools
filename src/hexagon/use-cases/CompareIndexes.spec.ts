import { CompareIndexes } from "./CompareIndexes"
import { MongoDatabaseProviderStub } from "../../adapters/secondary/gateways/mongo-database/MongoDatabaseProviderStub"
import { MongoIndex } from "../models/MongoIndex"
import { buildIndex } from "../../../test/helpers/buildIndex.test"

describe("CompareIndexes", () => {
  let mongoDatabaseProvider1: MongoDatabaseProviderStub
  let mongoDatabaseProvider2: MongoDatabaseProviderStub

  beforeEach(() => {
    mongoDatabaseProvider1 = new MongoDatabaseProviderStub()
    mongoDatabaseProvider2 = new MongoDatabaseProviderStub()
    mongoDatabaseProvider1.databaseName = "database1"
    mongoDatabaseProvider2.databaseName = "database2"
  })

  it("should return nothing if there is no index", async () => {
    mongoDatabaseProvider1.indexes = {}
    mongoDatabaseProvider2.indexes = {}
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([])
  })

  it("should return nothing if the index is present in both databases", async () => {
    const indexes1 = [buildIndex({ field1: 1, field2: 1 })]
    const indexes2 = [buildIndex({ field1: 1, field2: 1 })]
    mongoDatabaseProvider1.indexes = { collection: indexes1 }
    mongoDatabaseProvider2.indexes = { collection: indexes2 }
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([])
  })

  it("should return the index with MISSING if the index is present in the first database but not in the second", async () => {
    const indexes1: Array<MongoIndex> = [buildIndex({ field1: 1, field2: 1 })]
    const indexes2: Array<MongoIndex> = []
    mongoDatabaseProvider1.indexes = { collection: indexes1 }
    mongoDatabaseProvider2.indexes = { collection: indexes2 }
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([
      {
        names: ["field1_1_field2_1"],
        collection: "collection",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database1"],
        status: "MISSING",
        message: "Index is missing in database2",
      },
    ])
  })

  it("should return the index with MISSING if the index is present in the second database but not in the first", async () => {
    const indexes1: Array<MongoIndex> = []
    const indexes2: Array<MongoIndex> = [buildIndex({ field1: 1, field2: 1 })]
    mongoDatabaseProvider1.indexes = { collection: indexes1 }
    mongoDatabaseProvider2.indexes = { collection: indexes2 }
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([
      {
        names: ["field1_1_field2_1"],
        collection: "collection",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database2"],
        status: "MISSING",
        message: "Index is missing in database1",
      },
    ])
  })

  it("should return the index with DIFFERENT if the index is present in both databases but with different names", async () => {
    const indexes1: Array<MongoIndex> = [
      buildIndex({ field1: 1, field2: 1 }, "collection1"),
    ]
    const indexes2: Array<MongoIndex> = [
      buildIndex({ field1: 1, field2: 1 }, "collection1", "wrong_name"),
    ]
    mongoDatabaseProvider1.indexes = { collection1: indexes1 }
    mongoDatabaseProvider2.indexes = { collection2: indexes2 }
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([
      {
        names: ["field1_1_field2_1", "wrong_name"],
        collection: "collection1",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database1", "database2"],
        status: "DIFFERENT",
        message: "Index is different in database1 and database2",
      },
    ])
  })

  it("should return two indexes if there are same but in different collections", async () => {
    const indexes1: Array<MongoIndex> = [
      buildIndex({ field1: 1, field2: 1 }, "collection1"),
    ]
    const indexes2: Array<MongoIndex> = [
      buildIndex({ field1: 1, field2: 1 }, "collection2"),
    ]
    mongoDatabaseProvider1.indexes = { collection1: indexes1 }
    mongoDatabaseProvider2.indexes = { collection2: indexes2 }
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    const result = await compareIndexes.execute()
    expect(result).toEqual([
      {
        names: ["field1_1_field2_1"],
        collection: "collection1",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database1"],
        status: "MISSING",
        message: "Index is missing in database2",
      },
      {
        names: ["field1_1_field2_1"],
        collection: "collection2",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database2"],
        status: "MISSING",
        message: "Index is missing in database1",
      },
    ])
  })

  it("should connect and disconnect after run", async () => {
    mongoDatabaseProvider1.indexes = {}
    mongoDatabaseProvider2.indexes = {}
    const compareIndexes = new CompareIndexes(
      mongoDatabaseProvider1,
      mongoDatabaseProvider2,
    )
    await compareIndexes.execute()
    expect(mongoDatabaseProvider1.calls).toEqual(["connect", "disconnect"])
    expect(mongoDatabaseProvider2.calls).toEqual(["connect", "disconnect"])
  })
})
