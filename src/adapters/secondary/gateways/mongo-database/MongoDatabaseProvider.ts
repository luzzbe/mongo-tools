import { DatabaseProvider } from "../../../../hexagon/gateways/DatabaseProvider"
import { Db, MongoClient } from "mongodb"
import { MongoIndex } from "../../../../hexagon/models/MongoIndex"

export class MongoDatabaseProvider implements DatabaseProvider {
  private client: MongoClient
  private db: Db

  constructor(url: string) {
    this.client = new MongoClient(url)
    this.db = this.client.db()
  }

  public async connect() {
    await this.client.connect()
  }

  public async close() {
    await this.client.close()
  }

  public getDatabaseName() {
    return this.db.databaseName
  }

  public async getIndexes() {
    const collections = await this.db.collections()
    const indexes: Array<MongoIndex> = []
    for (const collection of collections) {
      const collectionIndexes = await collection.indexes()
      collectionIndexes.forEach((i) =>
        indexes.push({
          name: i.name,
          collection: collection.collectionName,
          details: {
            key: i.key,
          },
        }),
      )
    }

    return indexes.sort((a, b) => {
      if (a.collection === b.collection) return a.name.localeCompare(b.name)
      return a.collection.localeCompare(b.collection)
    })
  }
}
