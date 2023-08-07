import { MongoDatabaseProvider } from "./MongoDatabaseProvider"
import { MongoClient } from "mongodb"

describe("MongoDatabaseProvider", () => {
  const url = "mongodb://localhost:27017/test-db"
  const mongoClient = new MongoClient(url)
  const db = mongoClient.db()

  let mongoDatabaseProvider: MongoDatabaseProvider

  beforeAll(async () => {
    await mongoClient.connect()
    mongoDatabaseProvider = new MongoDatabaseProvider(url)
    await mongoDatabaseProvider.connect()
  })

  beforeEach(async () => {
    await db.dropDatabase()
  })

  afterAll(async () => {
    await mongoClient.close()
    await mongoDatabaseProvider.close()
  })

  it("should return the database name", async () => {
    expect(mongoDatabaseProvider.getDatabaseName()).toEqual("test-db")
  })

  it("should return the indexes", async () => {
    await db
      .collection("collection1")
      .createIndex({ field1: 1, field2: 1 }, { name: "field1_1_field2_1" })
    await db
      .collection("collection2")
      .createIndex({ field3: 1, field4: 1 }, { name: "field3_1_field4_1" })

    const indexes = await mongoDatabaseProvider.getIndexes()
    expect(indexes).toContainEqual({
      name: "_id_",
      collection: "collection1",
      details: {
        key: {
          _id: 1,
        },
      },
    })

    expect(indexes).toContainEqual({
      name: "field1_1_field2_1",
      collection: "collection1",
      details: {
        key: {
          field1: 1,
          field2: 1,
        },
      },
    })

    expect(indexes).toContainEqual({
      name: "_id_",
      collection: "collection2",
      details: {
        key: {
          _id: 1,
        },
      },
    })

    expect(indexes).toContainEqual({
      name: "field3_1_field4_1",
      collection: "collection2",
      details: {
        key: {
          field3: 1,
          field4: 1,
        },
      },
    })
  })
})
