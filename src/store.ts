import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import frontConfig from './classes/FrontConfig'
Vue.use(Vuex)

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface State { }
/* eslint-disable @typescript-eslint/no-empty-interface */
export const vuexLocal: VuexPersistence<State> = new VuexPersistence({
  storage: frontConfig.useLocalStorage ? window.localStorage : window.sessionStorage,
  key: 'toggl-backlog-aggregator-state'
})
export function switchVuexStorage (useLocalStorage: boolean): void {
  if (frontConfig.useLocalStorage && !useLocalStorage) {
    window.sessionStorage['toggl-backlog-aggregator-state'] = window.localStorage['toggl-backlog-aggregator-state']
    vuexLocal.storage = window.sessionStorage
    window.localStorage.removeItem('toggl-backlog-aggregator-state')
    frontConfig.useLocalStorage = useLocalStorage
  } else if (!frontConfig.useLocalStorage && useLocalStorage) {
    window.localStorage['toggl-backlog-aggregator-state'] = window.sessionStorage['toggl-backlog-aggregator-state']
    vuexLocal.storage = window.localStorage
    window.sessionStorage.removeItem('toggl-backlog-aggregator-state')
    frontConfig.useLocalStorage = useLocalStorage
  }
}
const store = new Vuex.Store<State>({ plugins: [vuexLocal.plugin] })
export default store
