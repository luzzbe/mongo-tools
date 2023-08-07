#!/usr/bin/env node

import fs from "node:fs"
import path from "path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { CompareIndexes } from "../../../hexagon/use-cases/CompareIndexes"
import { MongoDatabaseProvider } from "../../secondary/gateways/mongo-database/MongoDatabaseProvider"
import { HtmlFormatter } from "../formatters/HtmlFormatter"
import { RedundantIndexes } from "../../../hexagon/use-cases/RedundantIndexes"

yargs(hideBin(process.argv))
  .command(
    "compareIndexes [db1] [db2]",
    "compare indexes between two databases",
    (yargs) => {
      return yargs
        .positional("db1", {
          describe: "database 1 connection string",
          type: "string",
        })
        .demandOption("db1")
        .positional("db2", {
          describe: "database 2 connection string",
          type: "string",
        })
        .demandOption("db2")
        .option("output", {
          describe: "output file path",
          type: "string",
        })
        .demandOption("output")
    },
    async (argv) => {
      const mongoDatabaseProvider1 = new MongoDatabaseProvider(argv.db1)
      const mongoDatabaseProvider2 = new MongoDatabaseProvider(argv.db2)
      const compareIndexes = new CompareIndexes(
        mongoDatabaseProvider1,
        mongoDatabaseProvider2,
      )
      const results = await compareIndexes.execute()
      const htmlFormatter = new HtmlFormatter()
      const html = await htmlFormatter.format(
        "templates/compare-indexes.hbs",
        results,
      )
      if (!fs.existsSync(path.dirname(argv.output))) {
        fs.mkdirSync(path.dirname(argv.output))
      }
      fs.writeFileSync(argv.output, html)
      console.log(`Write file at ${argv.output}.`)
    },
  )
  .command(
    "redundantIndexes [db]",
    "list redundants indexes",
    (yargs) => {
      return yargs
        .positional("db", {
          describe: "database connection string",
          type: "string",
        })
        .demandOption("db")
        .option("output", {
          describe: "output file path",
          type: "string",
        })
        .demandOption("output")
    },
    async (argv) => {
      const mongoDatabaseProvider = new MongoDatabaseProvider(argv.db)
      const redundantIndexes = new RedundantIndexes(mongoDatabaseProvider)
      const results = await redundantIndexes.execute()
      const htmlFormatter = new HtmlFormatter()
      const html = await htmlFormatter.format(
        "templates/compare-indexes.hbs",
        results,
      )
      if (!fs.existsSync(path.dirname(argv.output))) {
        fs.mkdirSync(path.dirname(argv.output))
      }
      fs.writeFileSync(argv.output, html)
      console.log(`Write file at ${argv.output}.`)
    },
  )
  .demandCommand(1, "You must provide a command.")
  .showHelpOnFail(true)
  .help()
  .alias("help", "h")
  .parse()
