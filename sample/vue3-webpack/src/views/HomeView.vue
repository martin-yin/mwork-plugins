<template>
  <div class="home">
    <MethodApi />
    <DefineComponent />
    <SetupCom />
    <TsxRender />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MethodApi from '../components/MethodApi.vue';
import DefineComponent from '../components/DefineComponent.vue';
import SetupCom from '../components/SetupCom.vue';
import TsxRender from '../components/TsxRender.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    MethodApi,
    DefineComponent,
    SetupCom,
    TsxRender
  }
});
</script>
