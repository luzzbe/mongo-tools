import fs from "node:fs"
import Handlebars from "handlebars"
import { Formatter } from "./Formatter"

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context)
})

export class HtmlFormatter implements Formatter {
  public async format(templatePath: string, data: any[]) {
    const source = fs.readFileSync(templatePath, "utf-8")
    const template = Handlebars.compile(source)
    return template({ indexes: data })
  }
}
