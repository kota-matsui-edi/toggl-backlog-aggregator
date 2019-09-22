import { togglStateModule } from '@/stores/toggl'
import { backlogStateModule } from '@/stores/backlog'

import frontConfig from '@/classes/FrontConfig'

export default function initialize () {
  console.log('initialization start')
  const recoveredString = frontConfig.useLocalStorage ? window.localStorage['toggl-backlog-aggregator-state'] : window.sessionStorage['toggl-backlog-aggregator-state']
  console.log(recoveredString)
  if (!recoveredString) return
  const recoveredStateAll = recoveredString ? JSON.parse(recoveredString) : null
  console.log(recoveredStateAll)
  togglStateModule.recover(recoveredStateAll)
  backlogStateModule.recover(recoveredStateAll)
}
