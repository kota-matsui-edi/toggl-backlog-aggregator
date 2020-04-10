/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import axios, { AxiosResponse } from 'axios'
import TogglItem from '@/classes/TogglItem'
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
  private backlogResponse: any = {}
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

  get getApiToken () {
    return this.apiToken
  }

  get getLoading (): boolean {
    return this.loading
  }

  get formattedData (): FormettedData {
      const result: FormettedData = {
        noProject: {}
      }
      this.response.map(el=>new TogglItem([el])).forEach(datum => {
        if (datum.backlogProjectID !== '-' || datum.backlogProjectName !== '-') {
          if (!result[datum.backlogProjectName]) { result[datum.backlogProjectName] = {} }
          if (result[datum.backlogProjectName][datum.backlogProjectID]) {
            console.log(datum.backlogProjectName)
            console.log(datum.backlogProjectID)
            console.log(result[datum.backlogProjectName][datum.backlogProjectID].userDulation)
            console.log(datum.totalDuration / 1000 / 3600)
            result[datum.backlogProjectName][datum.backlogProjectID].raw.push(datum.raw[0]);
          } else {
            result[datum.backlogProjectName][datum.backlogProjectID] = datum
          }
        } else {
          if (result.noProject[datum.raw[0].description]) {
            result.noProject[datum.raw[0].description].raw.push(datum.raw[0]);
          } else {
            result.noProject[datum.raw[0].description] = datum
          }
        }
        result[datum.backlogProjectName][datum.backlogProjectID].backlogData = this.backlogResponse[datum.backlogProjectName] ? this.backlogResponse[datum.backlogProjectName][datum.backlogProjectID] : null
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
  addBacklogResponse(payload: {project: string, id: string, value: any}) {
    this.backlogResponse = {
      ...this.backlogResponse,
      [payload.project]:{
        ...this.backlogResponse[payload.project],
        [payload.id]: payload.value
      }
    }

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
          if (false) {
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
    for (let project in this.formattedData) {
      console.log(project)
      for (let id in this.formattedData[project]) {
        console.log(id)
        if (this.formattedData[project][id]) {
          console.log(this.formattedData[project][id])
          const res = await fetchBacklogStatusEachItem(project, id);
          console.log(res)
          this.addBacklogResponse({project, id, value: res});
        }
      }
    }
  }
}
async function fetchBacklogStatusEachItem (backlogProjectName: string,  backlogProjectID: string) {
  console.log('fetchBacklogStatus')
  if (backlogStateModule.getApiToken && backlogProjectID !== '-' && backlogProjectName !== '-') {
    const res = await axios
      .get(backlogStateModule.getWorkSpaceURL + '/api/v2/issues/' + backlogProjectName + '-' + backlogProjectID,
        {
          params: { apiKey: backlogStateModule.getApiToken }
        }
      )
      console.log(res)
    return res.data
  }
}
export const togglStateModule = getModule(TogglStateModule)
