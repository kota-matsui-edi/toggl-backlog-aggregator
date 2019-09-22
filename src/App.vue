<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <a @click="$modal.push('config')">Config</a>
    </div>
    <router-view/>
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
