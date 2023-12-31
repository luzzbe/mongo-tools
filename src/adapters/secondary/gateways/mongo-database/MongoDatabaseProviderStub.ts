import { MongoIndex } from "../../../../hexagon/models/MongoIndex"
import { DatabaseProvider } from "../../../../hexagon/gateways/DatabaseProvider"

export class MongoDatabaseProviderStub implements DatabaseProvider {
  private _calls: string[] = []
  private _databaseName: string | null = null
  private _indexes: Record<string, MongoIndex[]> | null = null

  public async connect() {
    this._calls.push("connect")
  }

  public async close() {
    this._calls.push("disconnect")
  }

  public getDatabaseName() {
    return this._databaseName!
  }
  public async getIndexes() {
    return this._indexes!
  }

  set indexes(value: Record<string, MongoIndex[]>) {
    this._indexes = value
  }

  set databaseName(databaseName: string) {
    this._databaseName = databaseName
  }

  get calls() {
    return this._calls
  }
}
