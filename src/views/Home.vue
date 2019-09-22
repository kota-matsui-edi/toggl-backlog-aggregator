<template>
  <div class="home">
    <div class="section">
      <progress class="progress is-small is-primary" max="100" v-if="togglLoading">15%</progress>
      <template v-else-if="togglData.length === 0">
        <h3 class="title">No Data</h3>
        <p>please check your <a @click="$modal.push('config')">configrations</a>.</p>
      </template>
      <table class="table is-bordered is-striped is-narrow" v-else>
        <thead>
          <tr>
            <th> description </th>
            <th> プロジェクト名 </th>
            <th> 課題番号 </th>
            <th>URL</th>
            <th>親課題</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(datum, index) in togglData"
            :key="index"
          >
            <td> {{datum.raw.description}} </td>
            <td> {{datum.backlogProjectName}} </td>
            <td> {{datum.backlogProjectID}} </td>
            <td>
              <a
                :href="datum.backlogURL"
                target="_blank"
                rel="noopener noreferrer"
              >{{datum.backlogURL}}</a>
            </td>
            <td>
              {{datum.parent}}
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import frontConfig from '../classes/FrontConfig'
import { togglStateModule } from '../stores/toggl'
import TogglItem from '@/classes/TogglItem'
@Component({
  components: {}
})
export default class Home extends Vue {
  get togglApiToken (): string {
    return togglStateModule.getApiToken
  }
  set togglApiToken (value: string) {
    togglStateModule.setApiToken(value)
  }

  get toggleWorkSpaceId (): string {
    return togglStateModule.getRequest.workspace_id
  }
  set toggleWorkSpaceId (value: string) {
    togglStateModule.updateRequest({ workspace_id: value })
  }
  get res (): TogglApi.responce.Details | null {
    return togglStateModule.getResponse
  }

  get togglData (): TogglItem[] {
    const result: TogglItem[] = []
    const res = this.res
    if (res) {
      res.data.forEach(datum => {
        result.push(new TogglItem(datum))
      })
    }
    return result
  }

  get useLocalStorage (): boolean {
    return frontConfig.useLocalStorage
  }
  set useLocalStorage (value: boolean) {
    frontConfig.useLocalStorage = value
  }

  get togglLoading (): boolean {
    return togglStateModule.getLoading
  }

  created () {}
  submit () {
    togglStateModule.doRequest()
  }
}
</script>
