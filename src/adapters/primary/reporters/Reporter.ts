export interface Reporter {
  format(data: any): Promise<string>
}
