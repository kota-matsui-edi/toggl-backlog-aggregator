/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import axios, { AxiosResponse } from 'axios'
import TogglItem, { BacklogResponse } from '@/classes/TogglItem'
import { backlogStateModule } from '@/stores/backlog'

export interface TotalTime { estimation: { complete: number, uncomplete: number }, achieve: { complete: number, uncomplete: number } }
export type Period = 'former' | 'later' | 'year'
declare type TogglApiType = 'base' | 'weekly' | 'details' | 'summary'
type Request = TogglApi.request.Details
const name = 'toggl'
export type FormettedData = { [project: string]: { [id: string]: TogglItem } }


@Module({ dynamic: true, store, name, namespaced: true })
class TogglStateModule extends VuexModule {
  private type: TogglApiType = 'details'
  private request: Request = {
    user_agent: 'ediplex',
    workspace_id: ''
  }
  private apiToken = ''
  private response: TogglApi.responce.DetailsDatum[] = []
  private loading = false;
  private year = '2019'
  private period: Period = 'former'
  private backlogResponse: { [project: string]: { [id: string]: BacklogResponse } } = {}
  private stop: boolean = false;
  get since (): string {
    switch (this.period) {
      case 'former':
        return `${this.year}-04-01`
      case 'later':
        return `${this.year}-09-01`
      case 'year':
        return `${this.year}-04-01`
    }
  }
  get until (): string {
    switch (this.period) {
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


  get getRequest () {
    return this.request
  }
  get getResponse () {
    return this.response
  }
  get getApiToken () {
    return this.apiToken
  }

  get getLoading (): boolean {
    return this.loading
  }

  get users (): string[] {
    if (this.loading) {
      return []
    }
    const result: string[] = [];
    for (const project in this.formattedData) {
      for (const id in this.formattedData[project]) {
        const item = this.formattedData[project][id]
        item.users.forEach(user => {
          if (!result.includes(user)) result.push(user);
        })
      }
    }
    return result;
  }

  get formattedData (): FormettedData {

    if (this.loading) {
      return {}
    }
    const result: FormettedData = {
      noProject: {}
    }

    this.response.map(el => new TogglItem([el])).forEach(datum => {
      // console.log(datum)
      if (datum.backlogProjectID !== '-' || datum.backlogProjectName !== '-') {
        if (!result[datum.backlogProjectName]) { result[datum.backlogProjectName] = {} }
        if (result[datum.backlogProjectName][datum.backlogProjectID]) {
          // console.log(datum.backlogProjectName)
          // console.log(datum.backlogProjectID)
          // console.log(result[datum.backlogProjectName][datum.backlogProjectID].userDulation)
          // console.log(datum.totalDuration / 1000 / 3600)
          result[datum.backlogProjectName][datum.backlogProjectID].raw.push(datum.raw[0]);
        } else {
          result[datum.backlogProjectName][datum.backlogProjectID] = datum
        }
        result[datum.backlogProjectName][datum.backlogProjectID].backlogData = this.backlogResponse[datum.backlogProjectName] ? this.backlogResponse[datum.backlogProjectName][datum.backlogProjectID] : null
      } else {
        if (result.noProject[datum.raw[0].description]) {
          result.noProject[datum.raw[0].description].raw.push(datum.raw[0]);
        } else {
          result.noProject[datum.raw[0].description] = datum
        }
      }
    })
    return result
  }
  get projects () {
    const result: {
      [project: string] : string[]
    } = {}
    this.response.map(el => new TogglItem([el])).forEach(datum => {
      if (datum.backlogProjectID !== '-' || datum.backlogProjectName !== '-') {
        if (!result[datum.backlogProjectName]) { result[datum.backlogProjectName] = [] }
        if (!result[datum.backlogProjectName].includes(datum.backlogProjectID)) {
          result[datum.backlogProjectName].push(datum.backlogProjectID);
        }       }
    })
    return result
  }
  get getYear (): string {
    return this.year
  }

  get getPeriod (): Period {
    return this.period
  }
  get totalTime (): TotalTime {
    if (this.loading) {
      return { estimation: { complete: 0, uncomplete: 0 }, achieve: { complete: 0, uncomplete: 0 } }
    }
    const result: TotalTime = { estimation: { complete: 0, uncomplete: 0 }, achieve: { complete: 0, uncomplete: 0 } }
    for (let project in this.formattedData) {
      for (let id in this.formattedData[project]) {
        if (this.formattedData[project][id]) {
          const datum = this.formattedData[project][id]
          if (datum.backlogData && datum.backlogData.status.name === '完了') {
            result.estimation.complete = result.estimation.complete + datum.backlogData.estimatedHours
            result.achieve.complete = result.achieve.complete + datum.totalDuration / 1000 / 3600
          } else if (datum.backlogData) {
            result.estimation.uncomplete = result.estimation.uncomplete + datum.backlogData.estimatedHours
            result.achieve.uncomplete = result.achieve.uncomplete + datum.totalDuration / 1000 / 3600
          }
        }
      }
    }
    return result
  }

  get totalTimeByUser (): { [user: string]: TotalTime } {
    const resultAll: { [user: string]: TotalTime } = {}
    this.users.forEach(user => {
      const result: TotalTime = { estimation: { complete: 0, uncomplete: 0 }, achieve: { complete: 0, uncomplete: 0 } }
      for (let project in this.formattedData) {
        for (let id in this.formattedData[project]) {
          if (this.formattedData[project][id]) {
            const datum = this.formattedData[project][id]
            if (datum.backlogData && datum.backlogData.status.name === '完了') {
              const userEstimation = datum.userDulation[user] ? datum.backlogData.estimatedHours / datum.totalDuration * datum.userDulation[user] : 0
              result.estimation.complete = result.estimation.complete + userEstimation
              result.achieve.complete = result.achieve.complete + (datum.userDulation[user] || 0) / 1000 / 3600
            } else if (datum.backlogData) {
              const userEstimation = datum.userDulation[user] ? datum.backlogData.estimatedHours / datum.totalDuration * datum.userDulation[user] : 0
              result.estimation.uncomplete = result.estimation.uncomplete + userEstimation
              result.achieve.uncomplete = result.achieve.uncomplete + (datum.userDulation[user] || 0) / 1000 / 3600
            }
          }
        }
      }
      resultAll[user] = result
    })
    return resultAll;
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
  private setResponse (value: TogglApi.responce.DetailsDatum[]) {
    this.response = value
  }

  @Mutation
  public setAllState (value: this) {
    Object.assign(this, value)
  }

  @Mutation
  setLoading (value: boolean) {
    if (this.loading === true && value === false) {
      this.stop = false
    }
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
  activateInstance (value: FormettedData) {
    for (let project in value) {
      for (let id in value[project]) {
        if (value[project][id]) {
          const temp = value[project][id]
          const instance = new TogglItem(temp.raw)
          instance.backlogData = temp.backlogData
          this.formattedData[project][id] = instance
        }
      }
    }
  }

  @Mutation
  addBacklogResponse (payload: { project: string, id: string, value: any }) {
    this.backlogResponse = {
      ...this.backlogResponse,
      [payload.project]: {
        ...this.backlogResponse[payload.project],
        [payload.id]: payload.value
      }
    }

  }

  @Mutation
  stopFetch () {
    this.stop = true;
  }


  @Action
  public async recover (recoverStateAll: any | null) {
    const recoverState: this | null = recoverStateAll[name]
    if (recoverState) {
      this.setAllState(recoverState)
      this.activateInstance(recoverState.formattedData)
    }
  }
  @Action
  async doRequest () {
    this.setLoading(true)
    this.updateRequest({ since: this.since, until: this.until })
    this.setResponse([])
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
          that.setResponse(that.response.concat(res.data.data))
          if (that.stop) {
            that.setLoading(false)
          }
          if (totalCount > count) {
            callEachPage(page + 1, count)
          } else {
            that.setLoading(false)
          }
        })
        .catch(err => {
          that.setResponse([])
          that.setLoading(false)
          throw err
        })
    }
  }

  @Action
  async fetchBacklogStatus () {
    console.log('fetchBacklogStatus')
    this.setLoading(true)
    for (let project in this.projects) {
      for (let index in this.projects[project]) {
        const id = this.projects[project][index]
        console.log(id)
          const res = await fetchBacklogStatusEachItem(project, id).catch(err=>{console.warn(err)});
          console.log(res)
          if(res) this.addBacklogResponse({ project, id, value: res });
      }
    }
    this.setLoading(false);
  }
}
async function fetchBacklogStatusEachItem (backlogProjectName: string, backlogProjectID: string) {
  console.log('fetchBacklogStatus')
  if(backlogProjectName === 'noProject') return null
  if (backlogStateModule.getApiToken && backlogProjectID !== '-' && backlogProjectName !== '-') {
    const res = await axios
      .get(backlogStateModule.getWorkSpaceURL + '/api/v2/issues/' + backlogProjectName + '-' + backlogProjectID,
        {
          params: { apiKey: backlogStateModule.getApiToken }
        }
      ).catch(err=>{console.warn(err)});
    console.log(res)
    if(!res) return null
    return res.data
  }
}
export const togglStateModule = getModule(TogglStateModule)
