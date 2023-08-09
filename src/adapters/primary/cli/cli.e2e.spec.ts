import fs from "fs"
import path from "path"
import { compareIndexesHandler, listRedundantIndexesHandler } from "./handlers"
import { MongoClient } from "mongodb"

describe("Commands tests", () => {
  const url1 = "mongodb://localhost:27017/test-db-e2e-1"
  const url2 = "mongodb://localhost:27017/test-db-e2e-2"
  const mongoClient = new MongoClient(url1)
  const db1 = mongoClient.db("test-db-e2e-1")
  const db2 = mongoClient.db("test-db-e2e-2")

  beforeAll(async () => {
    await mongoClient.connect()
    await Promise.all([db1.dropDatabase(), db2.dropDatabase()])
    await db1.createIndex("collection1", { field1: 1 })
    await db1.createIndex("collection1", { field1: 1, field2: 1 })
    await db2.createIndex("collection1", { field1: 1, field2: 1 })
  })

  afterAll(async () => {
    await mongoClient.close()
  })

  describe("compareIndexes", () => {
    const reportPath = "reports/compare-indexes.html"

    beforeEach(() => {
      if (fs.existsSync(path.dirname(reportPath))) {
        fs.rmSync(path.dirname(reportPath), { force: true, recursive: true })
      }
    })

    it("should generate a report", async () => {
      await compareIndexesHandler({
        db1: url1,
        db2: url2,
        output: reportPath,
      } as any)
      expect(fs.existsSync(reportPath)).toBe(true)
      const content = fs.readFileSync(reportPath, "utf-8")
      expect(content).toContain("{&quot;field1&quot;:1}")
      expect(content).toContain("MISSING")
    })
  })

  describe("redundantIndexes", () => {
    const reportPath = "reports/redundant-indexes.html"

    beforeEach(() => {
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath))
      }

      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath)
      }
    })

    it("should generate a report", async () => {
      await listRedundantIndexesHandler({
        db: url1,
        output: reportPath,
      } as any)
      expect(fs.existsSync(reportPath)).toBe(true)
      const content = fs.readFileSync(reportPath, "utf-8")
      expect(content).toContain("{&quot;field1&quot;:1}")
    })
  })
})
