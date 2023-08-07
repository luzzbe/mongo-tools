export interface MongoIndex {
  name: string
  collection: string
  details: {
    key: { [key: string]: number }
  }
}
