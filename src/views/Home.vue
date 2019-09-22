<template>
  <div class="home">
    <div class="section">
      <div class="field">
        <label class="label">Toggl API token <a
            href="https://www.toggl.com/app/profile"
            target="_blank"
            rel="noopener noreferrer"
          >https://www.toggl.com/app/profile</a></label>
        <p class="control">
          <input
            class="input"
            type="text"
            placeholder="Text input"
            v-model="togglApiToken"
          >
        </p>
      </div>
      <div class="field">
        <label class="label">The workspace whose data you want to access.</label>
        <p class="control">
          <input
            class="input"
            type="text"
            placeholder="Text input"
            v-model="toggleWorkSpaceId"
          >
        </p>
      </div>
      <div class="field">
        <p class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="useLocalStorage"> use local storage.
          </label>
        </p>
      </div>
      <div class="field is-grouped">
        <p class="control">
          <button class="button is-primary" @click="submit">Submit</button>
        </p>
        <p class="control">
          <button class="button is-link">Cancel</button>
        </p>
      </div>
    </div>
    <div class="section">
      <table class="table is-bordered is-striped is-narrow">
    <thead>
      <tr>
        <th> description </th>
        <th> プロジェクト名 </th>
        <th> 課題番号 </th>
        <th>URL</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(datum, index) in togglData" :key="index">
        <td> {{datum.raw.description}} </td>
        <td> {{datum.backlogProjectName}} </td>
        <td> {{datum.backlogProjectID}} </td>
        <td>
          <a :href="datum.backlogURL" target="_blank" rel="noopener noreferrer">{{datum.backlogURL}}</a>
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
  created () {}
  submit () {
    togglStateModule.doRequest()
  }
}
</script>
