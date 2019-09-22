/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import axios, { AxiosResponse } from 'axios'
declare type TogglApiType = 'base' | 'weekly'|'details' | 'summary'
type Request = TogglApi.request.Base | TogglApi.request.Weekly | TogglApi.request.Details | TogglApi.request.Summary
const name = 'toggl'

@Module({ dynamic: true, store, name, namespaced: true })
class TogglStateModule extends VuexModule {
  private type: TogglApiType = 'details'
  private request: Request = {
    user_agent: 'ediplex',
    workspace_id: ''
  }
  private apiToken = ''
  private response: TogglApi.responce.Details | null = null

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
  private setResponse (value: TogglApi.responce.Details) {
    this.response = value
  }
  @Mutation
  public setAllState (value: this) {
    Object.assign(this, value)
  }

  @Action
  public async recover (recoverStateAll: any | null) {
    const recoverState: this | null = recoverStateAll[name]
    if (recoverState) {
      this.setAllState(recoverState)
    }
  }
  @Action
  doRequest () {
    axios
      .get('https://toggl.com/reports/api/v2/details',
        {
          headers: {
            Authorization: `Basic ${btoa(this.apiToken + ':api_token')}`
          },
          params: this.request
        }
      )
      .then((res: AxiosResponse<TogglApi.responce.Details>) => {
        this.setResponse(res.data)
      })
  }
}

export const togglStateModule = getModule(TogglStateModule)
