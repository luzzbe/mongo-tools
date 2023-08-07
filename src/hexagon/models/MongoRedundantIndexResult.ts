import { MongoIndex } from "./MongoIndex"

export interface MongoRedundantIndexResult extends MongoIndex {
  redundantWith: Array<MongoIndex>
}
