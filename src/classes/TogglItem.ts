import axios from 'axios'
import { backlogStateModule } from '@/stores/backlog'
import dayjs from 'dayjs'
export default class TogglItem {
  public raw: TogglApi.responce.DetailsDatum
  public backlogData: any
  constructor (value: TogglApi.responce.DetailsDatum) {
    this.raw = value
  }
  get backlogProjectName (): string {
    if (this.raw.description.split('-').length === 1) return '-'
    return this.raw.description.split('-')[0]
  }

  get timeOver (): boolean {
    if (!this.backlogData) return false
    return this.raw.dur / 1000 / 3600 > Number(this.backlogData.estimatedHours)
  }
  get timeOverTwice (): boolean {
    if (!this.backlogData) return false
    return this.raw.dur / 1000 / 3600 > Number(this.backlogData.estimatedHours) * 2
  }

  get noEstimatedHours (): boolean {
    if (!this.backlogData) return true
    return !this.backlogData.estimatedHours
  }
  get backlogProjectID (): string {
    const test = this.raw.description.split('-')[1]
    if (!test) return '-'
    return test.split(' ')[0]
  }
  get backlogURL (): string | null {
    if (this.backlogProjectName === '-' || this.backlogProjectID === '-') return null
    return `https://ediplex.backlog.jp/view/${this.backlogProjectName}-${this.backlogProjectID}`
  }

  get parentURL (): string | null {
    if (this.parent === 'this') return null
    return `https://ediplex.backlog.jp/view/${this.parent}`
  }

  get parent (): string {
    if (!this.backlogData) return '-'
    if (this.backlogData.parentIssueId) return this.backlogData.parentIssueId
    return 'this'
  }

  get ninnichi (): string {
    return (this.raw.dur / 1000 / 3600).toFixed(1) + '時間'
  }

  fetchBacklogStatus (): void {
    console.log('fetchBacklogStatus')
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
