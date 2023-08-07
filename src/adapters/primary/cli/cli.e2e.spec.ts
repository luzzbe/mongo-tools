import fs from "fs"
import path from "path"
import { compareIndexesHandler, listRedundantIndexesHandler } from "./handlers"

describe("Commands tests", () => {
  const url = "mongodb://localhost:27017/test-db"

  describe("compareIndexes", () => {
    const reportPath = "reports/compare-indexes.html"

    beforeEach(() => {
      if (!fs.existsSync(path.dirname(reportPath))) {
        fs.mkdirSync(path.dirname(reportPath))
      }

      if (fs.existsSync(reportPath)) {
        fs.unlinkSync(reportPath)
      }
    })

    it("should generate a report", async () => {
      await compareIndexesHandler({
        db1: url,
        db2: url,
        output: reportPath,
      } as any)
      expect(fs.existsSync(reportPath)).toBe(true)
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
        db: url,
        output: reportPath,
      } as any)
      expect(fs.existsSync(reportPath)).toBe(true)
    })
  })
})
