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

  private getRedundantIndexes(indexes: Record<string, MongoIndex[]>) {
    const redundantIndexes: MongoRedundantIndexResult[] = []

    Object.values(indexes).forEach((indexes) => {
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
        indexKeys[i] === otherIndexKeys[i] &&
        index.details.key[indexKeys[i]] ===
          otherIndex.details.key[otherIndexKeys[i]],
    )
  }
}
