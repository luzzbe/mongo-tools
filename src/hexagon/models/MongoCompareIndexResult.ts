export interface MongoCompareIndexResult {
  names: Array<string>
  collection: string
  details: {
    key: { [key: string]: number }
  }
  databases: string[]
  status: "OK" | "DIFFERENT" | "MISSING"
  message?: string
}
