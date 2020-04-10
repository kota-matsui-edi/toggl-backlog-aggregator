<template>
  <div class="home">
    <div class="section">
      <div class="field is-grouped">
        <p class="control">
          <button
            class="button is-primary"
            @click="fetchToggl"
            id="hoge"
          >fetch toggl</button>
        </p>
        <p class="control">
          <button
            class="button is-link"
            @click="fetchBacklog"
          >fetch backlog</button>
        </p>
        <p class="control">
          <button
            class="button is-warn"
            @click="stopFetch"
          >stop</button>
        </p>
      </div>
      <section>
        <hr>
        <h3 class="title">Total</h3>
        <nav class="level">
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">納品人日（納品済み）</p>
              <p class="title">{{hourToNinnichi(totalTime.estimation.complete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（納品済み）</p>
              <p class="title">{{hourToNinnichi(totalTime.achieve.complete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（未納品）</p>
              <p class="title">{{hourToNinnichi(totalTime.achieve.uncomplete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">予定人日（未納品込み）</p>
              <p class="title">{{hourToNinnichi(totalTime.estimation.complete + totalTime.achieve.uncomplete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（合計）</p>
              <p class="title">{{hourToNinnichi(totalTime.achieve.complete + totalTime.achieve.uncomplete)}}</p>
            </div>
          </div>
        </nav>
        <hr>
      </section>
      <section v-for="(time, key) in totalTimeByUser" :key="key">
        <hr>
        <h3 class="title">{{key}}</h3>
        <nav class="level">
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">納品人日（納品済み）</p>
              <p class="title">{{hourToNinnichi(time.estimation.complete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（納品済み）</p>
              <p class="title">{{hourToNinnichi(time.achieve.complete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（未納品）</p>
              <p class="title">{{hourToNinnichi(time.achieve.uncomplete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">予定人日（未納品込み）</p>
              <p class="title">{{hourToNinnichi(time.estimation.complete + time.achieve.uncomplete)}}</p>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">実働人日（合計）</p>
              <p class="title">{{hourToNinnichi(time.achieve.complete + time.achieve.uncomplete)}}</p>
            </div>
          </div>
        </nav>
        <hr>
      </section>
      <progress
        class="progress is-small is-primary"
        max="100"
        v-if="togglLoading"
      >15%</progress>
      <template v-else-if="response.length === 0">
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
                  <td> {{datum.raw[0].description}} </td>
                  <td>
                    {{datum.backlogData && datum.backlogData.estimatedHours ? datum.backlogData.estimatedHours + '時間': '-'}}
                  </td>
                  <td> {{datum.ninnichi}} </td>

                  <td>
                    <a
                      :href="datum.parentURL"
                      target="_blank"
                      rel="noopener noreferrer"
                      v-if="datum.parentURL"
                    >{{datum.parent}}</a>
                    <span v-else>{{datum.parent}}</span>
                  </td>
                  <td>
                    {{datum.backlogData && datum.backlogData.status ? datum.backlogData.status.name : '-'}}
                  </td>
                  <td>
                    <a
                      class="button is-info"
                      v-if="datum.noEstimatedHours"
                    > Nodata </a>
                    <a
                      class="button is-danger"
                      v-else-if="datum.timeOverTwice"
                    > Danger </a>
                    <a
                      class="button is-warning"
                      v-else-if="datum.timeOver"
                    > Warning </a>
                    <a
                      class="button is-success"
                      v-else
                    > Good </a>
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
              <td> {{datum.raw[0].description}} </td>
              <td> {{datum.raw[0].dur}} </td>
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
import { Component, Vue } from "vue-property-decorator";
import frontConfig from "../classes/FrontConfig";
import { togglStateModule, TotalTime } from "../stores/toggl";
@Component({
  components: {}
})
export default class Home extends Vue {
  get togglApiToken(): string {
    return togglStateModule.getApiToken;
  }
  set togglApiToken(value: string) {
    togglStateModule.setApiToken(value);
  }

  get toggleWorkSpaceId(): string {
    return togglStateModule.getRequest.workspace_id;
  }
  set toggleWorkSpaceId(value: string) {
    togglStateModule.updateRequest({ workspace_id: value });
  }

  get response() {
    return togglStateModule.getResponse;
  }

  get formattedData() {
    return togglStateModule.formattedData;
  }

  get useLocalStorage(): boolean {
    return frontConfig.useLocalStorage;
  }
  set useLocalStorage(value: boolean) {
    frontConfig.useLocalStorage = value;
  }

  get togglLoading(): boolean {
    return togglStateModule.getLoading;
  }

  get totalTime(): TotalTime {
    return togglStateModule.totalTime;
  }

  get totalTimeByUser() {
    return togglStateModule.totalTimeByUser
  }

  hourToNinnichi(value: number): string {
    return (value / 8).toFixed(1) + "日";
  }

  created() {
    togglStateModule.setLoading(false);
  }
  fetchToggl() {
    togglStateModule.doRequest();
  }
  fetchBacklog() {
    togglStateModule.fetchBacklogStatus();
  }
  stopFetch() {
    togglStateModule.stopFetch();
  }
}
</script>
<style lang="scss" scoped>
.table h4 {
  margin-top: 1em;
}
</style>
