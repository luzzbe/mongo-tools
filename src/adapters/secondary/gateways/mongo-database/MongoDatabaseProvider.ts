import { DatabaseProvider } from "../../../../hexagon/gateways/DatabaseProvider"
import { Db, MongoClient } from "mongodb"

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
    const indexes = await Promise.all(
      collections.map(async (collection) => {
        const indexes = await collection.indexes()
        return indexes.map((index) => ({
          name: index.name,
          collection: collection.collectionName,
          details: {
            key: index.key,
          },
        }))
      }),
    )
    return indexes.flat()
  }
}
