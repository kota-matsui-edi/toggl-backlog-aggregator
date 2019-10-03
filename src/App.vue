<template>
  <div id="app">
    <div class="hero-head">
      <nav class="main-nav navbar ">
        <div class="container">
          <div class="navbar-start">
            <span
              class="navbar-item"
              href="https://jenil.github.io/bulmaswatch/"
            >
              <h1 class="title is-5">Toggl-backlog-aggregator</h1>
            </span>
            <a
              class="navbar-item is-active"
              @click="$modal.push('config')"
            >Config</a>
          </div>
          <div class="navbar-end navbar-menu">
            <a
              class="navbar-item"
              href="//github.com/kota-matsui-edi/toggl-backlog-aggregator"
              target="_blank"
            >
              <font-awesome-icon :icon="['fab', 'github']"> </font-awesome-icon>
            </a>
          </div>
        </div>
      </nav>
    </div>
    <div class="container">
      <router-view />
    </div>
    <modal name="config">
      <config />
    </modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Config from '@/components/Config.vue'
@Component({
  components: {
    Config
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
@import "bulma/bulma.sass";
@import "bulmaswatch/materia/bulmaswatch.scss";
</style>
