/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import axios, { AxiosResponse } from 'axios'
import TogglItem from '@/classes/TogglItem'
import dayjs from 'dayjs'

export interface TotalTime {estimation: {complete: number, uncomplete: number}, achieve: {complete: number, uncomplete: number}}
export type Period = 'former' | 'later' | 'year'
declare type TogglApiType = 'base' | 'weekly'|'details' | 'summary'
type Request = TogglApi.request.Details
const name = 'toggl'
export type FormettedData = {[project:string]:{[id: string]: TogglItem}}
@Module({ dynamic: true, store, name, namespaced: true })
class TogglStateModule extends VuexModule {
  private type: TogglApiType = 'details'
  private request: Request = {
    user_agent: 'ediplex',
    workspace_id: ''
  }
  private dataObject: TogglItem[] = []
  private apiToken = ''
  private response: TogglApi.responce.Details | null = null
  private loading = false;
  private year = '2019'
  private period: Period = 'former'
  private _formatData: FormettedData = {}
  get since (): string {
    switch(this.period) {
      case 'former':
        return `${this.year}-04-01`
      case 'later':
        return `${this.year}-09-01`
      case 'year':
        return `${this.year}-04-01`
    }
  }
  get until (): string {
    switch(this.period) {
      case 'former':
        return `${this.year}-08-31`
      case 'later':
        return `${Number(this.year) + 1}-03-31`
      case 'year':
        return `${Number(this.year) + 1}-03-31`
    }
  }
  get requestURL (): string {
    switch (this.type) {
      case 'base':
        return 'https://toggl.com/reports/api/v2'
      case 'details':
        return 'https://toggl.com/reports/api/v2/details'
      case 'summary':
        return 'https://toggl.com/reports/api/v2/summary'
      case 'weekly':
        return 'https://toggl.com/reports/api/v2/weekly'
    }
  }

  get getResponse (): TogglApi.responce.Details | null {
    return this.response
  }

  get getRequest () {
    return this.request
  }

  get getApiToken () {
    return this.apiToken
  }

  get getLoading (): boolean {
    return this.loading
  }

  get getFormattedData () {
    return this._formatData
  }

  get getYear (): string {
    return this.year
  }

  get getPeriod (): Period {
    return this.period
  }
  get totalTime (): TotalTime {
    const result: TotalTime = { estimation: { complete: 0, uncomplete: 0 }, achieve: { complete: 0, uncomplete: 0 } }
    for (let project in this._formatData) {
      for (let id in this._formatData[project]) {
        if (this._formatData[project][id]) {
          const datum = this._formatData[project][id]
          if (datum.backlogData && datum.backlogData.status.name === '完了') {
            result.estimation.complete = result.estimation.complete + datum.backlogData.estimatedHours
            result.achieve.complete = result.achieve.complete + datum.raw.dur / 1000 / 3600
          } else if (datum.backlogData) {
            result.estimation.uncomplete = result.estimation.uncomplete + datum.backlogData.estimatedHours
            result.achieve.uncomplete = result.achieve.uncomplete + datum.raw.dur / 1000 / 3600
          }
        }
      }
    }
    return result
  }

  @Mutation
  setRequest (value: Request) {
    this.request = value
  }

  @Mutation
  updateRequest (value: Partial<Request>) {
    Object.assign(this.request, value)
  }

  @Mutation
  setApiToken (value: string) {
    this.apiToken = value
  }

  @Mutation
  private setResponse (value: TogglApi.responce.Details | null) {
    this.response = value
    const result: TogglItem[] = []
    if (value) {
      value.data.forEach((datum) => {
        const item = new TogglItem(datum)
        result.push(item)
      })
      if (this.dataObject) this.dataObject = this.dataObject.concat(result)
      else this.dataObject = result
    } else {
      this.dataObject = []
      this._formatData = {}
    }
  }
  @Mutation
  public setAllState (value: this) {
    Object.assign(this, value)
  }

  @Mutation
  setLoading (value: boolean) {
    this.loading = value
  }

  @Mutation
  setYear (value: string) {
    this.year = value
  }

  @Mutation
  setPeriod (value: Period) {
    this.period = value
  }

  @Mutation
  concatData (data: TogglApi.responce.Details) {
    if (this.response) this.response.data = this.response.data.concat(data.data)
    else this.response = data
    const result: TogglItem[] = []
    data.data.forEach((datum) => {
      const item = new TogglItem(datum)
      result.push(item)
    })
    if (this.dataObject) this.dataObject = this.dataObject.concat(result)
    else this.dataObject = result
  }

  @Mutation
  activateInstance (value: FormettedData) {
    for (let project in value) {
      for (let id in value[project]) {
        if (value[project][id]) {
          const temp = value[project][id]
          const instance = new TogglItem(temp.raw)
          instance.backlogData = temp.backlogData
          this._formatData[project][id] = instance
        }
      }
    }
  }
  @Mutation
  setFormattedData () {
    console.log('setFormattedData')
    const res = this.dataObject
    if (!res) return {}
    const result: FormettedData = {}
    res.forEach(datum => {
      if (datum.backlogProjectID !== '-' || datum.backlogProjectName !== '-') {
        if (!result[datum.backlogProjectName]) { result[datum.backlogProjectName] = {} }
        if (result[datum.backlogProjectName][datum.backlogProjectID]) {
          console.log(datum.backlogProjectName)
          console.log(datum.backlogProjectID)
          console.log(result[datum.backlogProjectName][datum.backlogProjectID].raw.dur / 1000 / 3600)
          console.log(datum.raw.dur / 1000 / 3600)
          result[datum.backlogProjectName][datum.backlogProjectID].raw.dur = datum.raw.dur + result[datum.backlogProjectName][datum.backlogProjectID].raw.dur
        } else {
          result[datum.backlogProjectName][datum.backlogProjectID] = datum
        }
      } else {
        if (!result.noProject) result.noProject = {}
        if (result.noProject[datum.raw.description]) {
          result.noProject[datum.raw.description].raw.dur = datum.raw.dur + result.noProject[datum.raw.description].raw.dur
        } else {
          result.noProject[datum.raw.description] = datum
        }
      }
    })
    this._formatData = result
  }

  @Action
  public async recover (recoverStateAll: any | null) {
    const recoverState: this | null = recoverStateAll[name]
    if (recoverState) {
      this.setAllState(recoverState)
      this.activateInstance(recoverState._formatData)
    }
  }
  @Action
  async doRequest () {
    this.setLoading(true)
    this.updateRequest({ since: this.since, until: this.until })
    this.setResponse(null)
    let i = 1
    let count = 0
    const that = this

    callEachPage(i, count)

    async function callEachPage (page: number, count: number) {
      console.log(that)
      console.log('start callEachPage')
      that.updateRequest({ page: page })
      await new Promise(resolve => setTimeout(resolve, 1000))
      axios
        .get('https://toggl.com/reports/api/v2/details',
          {
            headers: {
              Authorization: `Basic ${btoa(that.apiToken + ':api_token')}`
            },
            params: that.request
          }
        )
        .then((res: AxiosResponse<TogglApi.responce.Details>) => {
          console.log(res)
          count = count + res.data.per_page
          const totalCount = res.data.total_count
          that.concatData(res.data)
          if (count < totalCount) {
            callEachPage(page + 1, count)
          } else {
            that.setLoading(false)
            that.setFormattedData()
          }
        })
        .catch(err => {
          that.setResponse(null)
          that.setLoading(false)
          throw err
        })
    }
  }

  @Action
  async fetchBacklogStatus () {
    for (let project in this._formatData) {
      for (let id in this._formatData[project]) {
        if (this._formatData[project][id]) this._formatData[project][id].fetchBacklogStatus()
      }
    }
  }
}

export const togglStateModule = getModule(TogglStateModule)
