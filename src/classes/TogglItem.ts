export default class TogglItem {
  private raw: TogglApi.responce.DetailsDatum
  constructor (value: TogglApi.responce.DetailsDatum) {
    this.raw = value
  }
  get backlogProjectName (): string {
    if (this.raw.description.split('-').length === 1) return '-'
    return this.raw.description.split('-')[0]
  }

  get backlogProjectID (): string {
    const test = this.raw.description.split('-')[1]
    if (!test) return '-'
    return test.split(' ')[0]
  }
  get backlogURL (): string {
    if (this.backlogProjectName === '-' || this.backlogProjectID === '-') return '-'
    return `https://ediplex.backlog.jp/view/${this.backlogProjectName}-${this.backlogProjectID}`
  }
}
