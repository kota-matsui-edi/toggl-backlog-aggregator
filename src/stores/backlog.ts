/* eslint-disable camelcase */
import { Module, VuexModule, Mutation, getModule, Action } from 'vuex-module-decorators'
import store from '@/store'
import axios, { AxiosResponse } from 'axios'
declare type BacklogApiType = 'base' | 'weekly'|'details' | 'summary'
const name = 'backlog'

@Module({ dynamic: true, store, name, namespaced: true })
class BacklogStateModule extends VuexModule {
  private workSpaceURL = ''
  private type: BacklogApiType = 'details'
  private request: any = {}
  private apiToken = ''
  private response: any | null = null
  private loading = false;

  get getResponse () {
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

  get getWorkSpaceURL (): string {
    return this.workSpaceURL
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
  private setResponse (value: any) {
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
  setWrokSpaceURL (value: string) {
    this.workSpaceURL = value
  }

  @Action
  public async recover (recoverStateAll: any | null) {
    const recoverState: this | null = recoverStateAll[name]
    if (recoverState) {
      this.setAllState(recoverState)
    }
  }
  @Action
  refleshAuth () {
    this.setLoading(true)
    axios
      .get('https://Backlog.com/reports/api/v2/details',
        {
          headers: {
            Authorization: `Basic ${btoa(this.apiToken + ':api_token')}`
          },
          params: this.request
        }
      )
      .then((res: AxiosResponse) => {
        this.setResponse(res.data)
      })
      .catch(err => {
        this.setResponse(null)
        throw err
      })
      .finally(() => { this.setLoading(false) })
  }

  @Action
  fetchSpace () {
    this.setLoading(true)
    if (!this.workSpaceURL || !this.apiToken) return
    axios
      .get(this.workSpaceURL + '/api/v2/space',
        {
          params: { apiKey: this.apiToken }
        }
      )
      .then((res: AxiosResponse) => {
        this.setResponse(res.data)
      })
      .catch(err => {
        this.setResponse(null)
        throw err
      })
      .finally(() => { this.setLoading(false) })
  }
}

export const backlogStateModule = getModule(BacklogStateModule)
