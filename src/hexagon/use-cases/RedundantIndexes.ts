import { DatabaseProvider } from "../gateways/DatabaseProvider"
import { MongoIndex } from "../models/MongoIndex"
import { MongoRedundantIndexResult } from "../models/MongoRedundantIndexResult"

export class RedundantIndexes {
  constructor(private readonly mongoDatabaseProvider: DatabaseProvider) {}
  async execute(): Promise<MongoRedundantIndexResult[]> {
    await this.mongoDatabaseProvider.connect()

    const indexes = await this.mongoDatabaseProvider.getIndexes()
    const redundantIndexes = this.getRedundantIndexes(indexes)

    await this.mongoDatabaseProvider.close()
    return redundantIndexes
  }

  private getRedundantIndexes(indexes: MongoIndex[]) {
    const indexesByCollection = this.getIndexesByCollection(indexes)

    const redundantIndexes: MongoRedundantIndexResult[] = []

    Object.values(indexesByCollection).forEach((indexes) => {
      indexes.forEach((index) => {
        indexes.forEach((otherIndex) => {
          if (index.name === otherIndex.name) return
          if (this.isRedundant(index, otherIndex)) {
            const redundantIndex = redundantIndexes.find(
              (i) => i.name === index.name,
            )
            if (redundantIndex) {
              redundantIndex.redundantWith.push(otherIndex)
            } else {
              redundantIndexes.push({
                name: index.name,
                collection: index.collection,
                details: index.details,
                redundantWith: [otherIndex],
              })
            }
          }
        })
      })
    })

    return redundantIndexes
  }

  private isRedundant(index: MongoIndex, otherIndex: MongoIndex) {
    const indexKeys = Object.keys(index.details.key)
    const otherIndexKeys = Object.keys(otherIndex.details.key)
    return indexKeys.every(
      (_, i) =>
        otherIndex.details.key[otherIndexKeys[i]] ===
        index.details.key[indexKeys[i]],
    )
  }

  private getIndexesByCollection(indexes: MongoIndex[]) {
    return indexes.reduce((acc: Record<string, MongoIndex[]>, val) => {
      if (!acc[val.collection]) {
        acc[val.collection] = []
      }
      acc[val.collection].push(val)
      return acc
    }, {})
  }
}
