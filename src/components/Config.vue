<template>
  <div class="config">
    <header class="modal-card-head">
      <p class="modal-card-title">Config</p>
    </header>
    <section class="modal-card-body">
      <div class="columns">
        <div class="column">
          <div class="section">
            <h2 class="title"> Toggl </h2>
            <div class="field">
              <label class="label">API token <a
                  href="https://www.toggl.com/app/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >*ref.</a></label>
              <p class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="abcdefghijklmn "
                  v-model="togglApiToken"
                >
              </p>
            </div>
            <div class="field">
              <label class="label">Workspace ID</label>
              <p class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="123456"
                  v-model="toggleWorkSpaceId"
                >
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="section">
            <h2 class="title"> Backlog </h2>
            <div class="field">
              <label class="label">workspace URL</label>
              <p class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="https://xx.backlog.com"
                  v-model="backlogWorkSpaceURL"
                >
              </p>
            </div>
            <div class="field">
              <label class="label">API token</label>
              <p class="control">
                <input
                  class="input"
                  type="text"
                  placeholder="abcdefghijklmn "
                  v-model="backlogApiToken"
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="title"> Common </h2>
        <label class="label">period</label>
        <div class="field is-grouped">
          <p class="control">
            <input
              class="input"
              type="number"
              placeholder="2019"
              v-model="year"
            >
          </p>
          <p class="control">
            <span class="select">
              <select v-model="period">
                <option value="former">上期</option>
                <option value="later">下期</option>
              </select>
            </span>
          </p>

        </div>
        <div class="field">
          <p class="control">
            <label class="checkbox">
              <input
                type="checkbox"
                v-model="useLocalStorage"
              > use local storage.
            </label>
          </p>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button
        class="button is-primary"
        @click="submit"
      >OK</button>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import frontConfig from '@/classes/FrontConfig'
import { togglStateModule } from '@/stores/toggl'
import { backlogStateModule } from '@/stores/backlog'

import TogglItem from '@/classes/TogglItem'
@Component({
  components: {}
})
export default class Config extends Vue {
  get togglApiToken (): string {
    return togglStateModule.getApiToken
  }
  set togglApiToken (value: string) {
    togglStateModule.setApiToken(value)
  }
  get backlogApiToken (): string {
    return backlogStateModule.getApiToken
  }
  set backlogApiToken (value: string) {
    backlogStateModule.setApiToken(value)
  }
  get backlogWorkSpaceURL (): string {
    return backlogStateModule.getWorkSpaceURL
  }
  set backlogWorkSpaceURL (value: string) {
    backlogStateModule.setWrokSpaceURL(value)
  }
  get toggleWorkSpaceId (): string {
    return togglStateModule.getRequest.workspace_id
  }
  set toggleWorkSpaceId (value: string) {
    togglStateModule.updateRequest({ workspace_id: value })
  }
  get year (): string {
    return togglStateModule.getYear
  }
  set year (value: string) {
    togglStateModule.setYear(value)
  }
  get period (): string {
    return togglStateModule.getPeriod
  }
  set period (value: string) {
    togglStateModule.setPeriod(value)
  }
  get useLocalStorage (): boolean {
    return frontConfig.useLocalStorage
  }
  set useLocalStorage (value: boolean) {
    frontConfig.useLocalStorage = value
  }
  created () {}
  submit () {
    this.$modal.pop()
  }
}
</script>
<style lang="scss" scoped>
.config {
  padding: 0;
  background: transparent;
}
</style>
