import { MongoIndex } from "../../../../hexagon/models/MongoIndex"
import { DatabaseProvider } from "../../../../hexagon/gateways/DatabaseProvider"

export class MongoDatabaseProviderStub implements DatabaseProvider {
  private _databaseName: string | null = null
  private _indexes: MongoIndex[] | null = null

  public async connect() {
    return Promise.resolve()
  }

  public async close() {
    return Promise.resolve()
  }

  public getDatabaseName() {
    return this._databaseName!
  }
  public async getIndexes() {
    return this._indexes!
  }

  set indexes(indexes: MongoIndex[]) {
    this._indexes = indexes
  }

  set databaseName(databaseName: string) {
    this._databaseName = databaseName
  }
}
