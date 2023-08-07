#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { compareIndexesHandler, listRedundantIndexesHandler } from "./handlers"

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
    compareIndexesHandler,
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
    listRedundantIndexesHandler,
  )
  .demandCommand(1, "You must provide a command.")
  .showHelpOnFail(true)
  .help()
  .alias("help", "h")
  .parse()
