import axios from 'axios'
import { backlogStateModule } from '@/stores/backlog'
export default class TogglItem {
  private raw: TogglApi.responce.DetailsDatum
  private backlogData: any
  constructor (value: TogglApi.responce.DetailsDatum) {
    this.raw = value
    this.fetchBacklogStatus()
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

  get parent (): string {
    if (!this.backlogData) return '-'
    if (this.backlogData.parentIssueId) return this.backlogData.parentIssueId
    return 'this'
  }

  fetchBacklogStatus (): void {
    if (backlogStateModule.getApiToken && this.backlogProjectID !== '-' && this.backlogProjectName !== '-') {
      axios
        .get(backlogStateModule.getWorkSpaceURL + '/api/v2/issues/' + this.backlogProjectName + '-' + this.backlogProjectID,
          {
            params: { apiKey: backlogStateModule.getApiToken }
          }
        )
        .then(res => {
          console.log(res)
          this.backlogData = res.data
        })
        .catch(err => {
          this.backlogData = null
          console.log(err)
        })
    }
  }
}
