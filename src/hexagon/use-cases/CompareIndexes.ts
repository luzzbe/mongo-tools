import { DatabaseProvider } from "../gateways/DatabaseProvider"
import { MongoIndex } from "../models/MongoIndex"
import { MongoCompareIndexResult } from "../models/MongoCompareIndexResult"

export class CompareIndexes {
  constructor(
    private readonly mongoDatabaseProvider1: DatabaseProvider,
    private readonly mongoDatabaseProvider2: DatabaseProvider,
  ) {}

  public async execute() {
    await this.mongoDatabaseProvider1.connect()
    await this.mongoDatabaseProvider2.connect()

    const { databaseName1, indexes1, databaseName2, indexes2 } =
      await this.getDatabasesInfo()

    await this.mongoDatabaseProvider1.close()
    await this.mongoDatabaseProvider2.close()

    const indexesMap = this.getIndexesMap(
      databaseName1,
      indexes1,
      databaseName2,
      indexes2,
    )

    return Array.from(indexesMap.values()).sort((a, b) =>
      a.collection.localeCompare(b.collection),
    )
  }

  private getIndexesMap(
    databaseName1: string,
    indexes1: MongoIndex[],
    databaseName2: string,
    indexes2: MongoIndex[],
  ) {
    const indexesMap = new Map<string, MongoCompareIndexResult>()

    indexes1.forEach((index1) =>
      this.handleIndex(databaseName1, databaseName2, index1, indexesMap),
    )
    indexes2.forEach((index2) =>
      this.handleIndex(databaseName2, databaseName1, index2, indexesMap),
    )

    return indexesMap
  }

  private handleIndex(
    databaseName: string,
    otherDatabaseName: string,
    index: MongoIndex,
    indexesMap: Map<string, MongoCompareIndexResult>,
  ) {
    const indexResult = indexesMap.get(this.getIndexKey(index))!
    if (indexResult) {
      if (indexResult.names[0] !== index.name) {
        indexResult.names.push(index.name)
        indexResult.databases.push(databaseName)
        indexResult.status = "DIFFERENT"
        indexResult.message = `Index is different in ${otherDatabaseName} and ${databaseName}`
      } else {
        indexesMap.delete(this.getIndexKey(index))
      }
    } else {
      indexesMap.set(this.getIndexKey(index), {
        names: [index.name],
        collection: index.collection,
        details: index.details,
        databases: [databaseName],
        status: "MISSING",
        message: `Index is missing in ${otherDatabaseName}`,
      })
    }
  }

  private getIndexKey(index: MongoIndex) {
    return `${index.collection}_${JSON.stringify(index.details)}`
  }

  private async getDatabasesInfo() {
    return {
      databaseName1: this.mongoDatabaseProvider1.getDatabaseName(),
      indexes1: await this.mongoDatabaseProvider1.getIndexes(),
      databaseName2: this.mongoDatabaseProvider2.getDatabaseName(),
      indexes2: await this.mongoDatabaseProvider2.getIndexes(),
    }
  }
}
