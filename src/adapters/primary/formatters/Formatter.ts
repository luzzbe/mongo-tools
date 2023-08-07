export interface Formatter {
  format(templatePath: string, indexes: any): Promise<string>
}
