<template>
  <h1>vue 的几种调用方法：</h1>
  <h2 style="margin-top: 20px">vue2:</h2>
  <MethodApi />
  <h2 style="margin-top: 20px">vue3:</h2>
  <DefindSetupVue />
  <ScriptSetup />
</template>

<script>
import { defineComponent } from 'vue';
import DefindSetupVue from './components/defindSetup.vue';
import MethodApi from './components/methodApi.vue';
import ScriptSetup from './components/scriptSetup.vue';

export default defineComponent({
  name: 'App',
  components: {
    DefindSetupVue,
    MethodApi,
    ScriptSetup
  }
});
</script>

<style scoped></style>
