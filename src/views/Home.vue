<template>
  <div class="home">
    <div class="section">
      <div class="field is-grouped">
        <p class="control">
          <button
            class="button is-primary"
            @click="fetchToggl"
          >fetch toggl</button>
        </p>
        <p class="control">
          <button
            class="button is-link"
            @click="fetchBacklog"
          >fetch backlog</button>
        </p>
      </div>
      <progress
        class="progress is-small is-primary"
        max="100"
        v-if="togglLoading"
      >15%</progress>
      <template v-else-if="formattedData.length === 0">
        <h3 class="title">No Data</h3>
        <p>please check your <a @click="$modal.push('config')">configrations</a>.</p>
      </template>
      <div
        class="content"
        v-else
      >
        <table class="table is-bordered is-striped is-narrow">
          <template v-for="(projectData, projectName) in formattedData">
            <template v-if="projectName !== 'noProject'">
              <h4 :key="projectName + 'h4'">{{projectName}}</h4>

              <tbody :key="projectName + 'tbody'">
                <tr>
                  <th> チケット </th>
                  <th> description </th>
                  <th>予定時間</th>
                  <th>実時間</th>
                  <th>親課題</th>
                  <th>状態</th>
                  <th>結果</th>
                </tr>
                <tr
                  v-for="(datum, id) in projectData"
                  :key="id"
                  class="is-danger"
                >
                  <td v-if="projectName !== 'noProject'"><a
                      :href="datum.backlogURL"
                      target="_blank"
                      rel="noopener noreferrer"
                      v-if="datum.backlogURL"
                    >{{projectName + '-' + id}}</a><span v-else> -</span></td>
                  <td> {{datum.raw.description}} </td>
                  <td>
                    {{datum.backlogData && datum.backlogData.estimatedHours ? datum.backlogData.estimatedHours + '時間': '-'}}
                  </td>
                  <td> {{datum.ninnichi}} </td>

                  <td>
                    <a :href="datum.parentURL" target="_blank" rel="noopener noreferrer" v-if="datum.parentURL">{{datum.parent}}</a>
                    <span v-else>{{datum.parent}}</span>
                  </td>
                  <td>
                    {{datum.backlogData && datum.backlogData.status ? datum.backlogData.status.name : '-'}}
                  </td>
                  <td>
                    <a class="button is-info" v-if="datum.noEstimatedHours"> Nodata </a>
                    <a class="button is-danger" v-else-if="datum.timeOverTwice"> Danger </a>
                    <a class="button is-warning" v-else-if="datum.timeOver"> Warning </a>
                    <a class="button is-success" v-else> Good </a>
                  </td>
                </tr>
              </tbody>
            </template>
          </template>
          <h4>該当プロジェクトなし</h4>
          <tbody>
            <tr>
              <th> チケット </th>
              <th> description </th>
              <th>実時間</th>
              <th>親課題</th>
            </tr>
            <tr
              v-for="(datum, id) in formattedData.noProject"
              :key="id"
            >
              <td>-</td>
              <td> {{datum.raw.description}} </td>
              <td> {{datum.raw.dur}} </td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
        <div>
        </div>
      </div>
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

  get formattedData () {
    return togglStateModule.getFormattedData
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
  fetchToggl () {
    togglStateModule.doRequest()
  }
  fetchBacklog () {
    togglStateModule.fetchBacklogStatus()
  }
}
</script>
<style lang="scss" scoped>
.table h4 {
  margin-top: 1em;
}
</style>
