import fs from "node:fs"
import Handlebars from "handlebars"
import { Reporter } from "./Reporter"

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context)
})

export class HtmlReporter implements Reporter {
  constructor(private readonly _template: string) {}

  public async format(data: any) {
    const source = fs.readFileSync(this._template, "utf-8")
    const template = Handlebars.compile(source)
    return template(data)
  }
}
