export interface BacklogResponse {
  estimatedHours: number;
  status: {
    name:string
  };
  parentIssueId: string
}

export default class TogglItem {
  public raw: TogglApi.responce.DetailsDatum[]
  public backlogData: BacklogResponse | null = null
  constructor (value: TogglApi.responce.DetailsDatum[]) {
    this.raw = value
  }
  get users (): string[] {
    const result: string[] = []
    this.raw.forEach(el=>{
      const user = el.user;
      if(!result.includes(user)) {
        result.push(user)
      }
    })
    return result
  }

  get userDulation(): {[user: string]: number} {
    const result: {[user: string]: number} = {}
    this.raw.forEach(el=>{
      if(result[el.user]) {
        result[el.user] += el.dur
      } else {
        result[el.user] = el.dur
      }
    })
    return result
  }

  get totalDuration():number {
    let result = 0;
    this.users.forEach(el=>{
      result += this.userDulation[el] ||0
    })
    return result
  }
  get backlogProjectName (): string {
    if(!this.raw[0]) return ''
    if (this.raw[0].description.split('-').length === 1) return '-'
    return this.raw[0].description.split('-')[0]
  }

  get timeOver (): boolean {
    if (!this.backlogData) return false
    return this.totalDuration / 1000 / 3600 > Number(this.backlogData.estimatedHours)
  }
  get timeOverTwice (): boolean {
    if (!this.backlogData) return false
    return this.totalDuration / 1000 / 3600 > Number(this.backlogData.estimatedHours) * 2
  }

  get noEstimatedHours (): boolean {
    if (!this.backlogData) return true
    return !this.backlogData.estimatedHours
  }
  get backlogProjectID (): string {
    const test = this.raw[0].description.split('-')[1]
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
    return (this.totalDuration / 1000 / 3600).toFixed(1) + '時間'
  }

}
