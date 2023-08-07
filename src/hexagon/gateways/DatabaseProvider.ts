import { MongoIndex } from "../models/MongoIndex"

export interface DatabaseProvider {
  connect(): Promise<void>
  close(): Promise<void>
  getDatabaseName(): string
  getIndexes(): Promise<MongoIndex[]>
}
