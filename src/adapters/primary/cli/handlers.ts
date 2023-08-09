import yargs from "yargs"
import path from "path"
import fs from "fs"
import { MongoDatabaseProvider } from "../../secondary/gateways/mongo-database/MongoDatabaseProvider"
import { CompareIndexes } from "../../../hexagon/use-cases/CompareIndexes"
import { HtmlReporter } from "../reporters/HtmlReporter"
import { RedundantIndexes } from "../../../hexagon/use-cases/RedundantIndexes"

const compareIndexesHandler = async (
  argv: yargs.ArgumentsCamelCase<{
    db1: string
    db2: string
    output: string
  }>,
) => {
  const mongoDatabaseProvider1 = new MongoDatabaseProvider(argv.db1)
  const mongoDatabaseProvider2 = new MongoDatabaseProvider(argv.db2)
  const compareIndexes = new CompareIndexes(
    mongoDatabaseProvider1,
    mongoDatabaseProvider2,
  )
  const results = await compareIndexes.execute()
  const htmlFormatter = new HtmlReporter("templates/compare-indexes.hbs")
  const html = await htmlFormatter.format({ indexes: results })
  if (!fs.existsSync(path.dirname(argv.output))) {
    fs.mkdirSync(path.dirname(argv.output))
  }
  fs.writeFileSync(argv.output, html)
}

const listRedundantIndexesHandler = async (
  argv: yargs.ArgumentsCamelCase<{
    db: string
    output: string
  }>,
) => {
  const mongoDatabaseProvider = new MongoDatabaseProvider(argv.db)
  const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
  const results = await redundantIndexes.execute()
  const htmlFormatter = new HtmlReporter("templates/redundant-indexes.hbs")
  const html = await htmlFormatter.format({ indexes: results })
  if (!fs.existsSync(path.dirname(argv.output))) {
    fs.mkdirSync(path.dirname(argv.output))
  }
  fs.writeFileSync(argv.output, html)
}

export { compareIndexesHandler, listRedundantIndexesHandler }
