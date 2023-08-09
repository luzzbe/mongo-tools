import { HtmlReporter } from "./HtmlReporter"
import { MongoCompareIndexResult } from "../../../hexagon/models/MongoCompareIndexResult"

describe("HtmlReporter", () => {
  it("should return the indexes in html format", async () => {
    const indexes: MongoCompareIndexResult[] = [
      {
        names: ["index_1", "index_2"],
        collection: "collection1",
        details: {
          key: { field1: 1, field2: 1 },
        },
        databases: ["database1", "database2"],
        status: "OK",
        message: "Index is present in both databases",
      },
      {
        names: ["index_3"],
        collection: "collection2",
        details: {
          key: { field1: 1 },
        },
        databases: ["database1"],
        status: "MISSING",
        message: "Index is missing in database2",
      },
    ]
    const htmlFormatter = new HtmlReporter("templates/compare-indexes.hbs")
    const result = await htmlFormatter.format({ indexes })
    expect(result).toContain("index_1,index_2")
    expect(result).toContain("collection1")
    expect(result).toContain("{&quot;field1&quot;:1,&quot;field2&quot;:1}")
    expect(result).toContain("database1,database2")
    expect(result).toContain("Index is present in both databases")

    expect(result).toContain("index_3")
    expect(result).toContain("collection2")
    expect(result).toContain("{&quot;field1&quot;:1}")
    expect(result).toContain("database1")
    expect(result).toContain("Index is missing in database2")
  })
})
