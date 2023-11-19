<template>
  <div class="margin-top-20">
    <div @click="defindSetup">defindSetup 方法的调用</div>
    <div @click="defindArrorw">defindArrorw 方法的调用</div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'DefindSetup',
  setup() {
    function defindSetup() {
      console.log('defindSetup 方法的调用');
    }

    const defindArrorw = () => {
      console.log('箭头函数 的调用');
    };

    return {
      defindSetup,
      defindArrorw
    };
  }
});
</script>
<style scoped>
.margin-top-20 {
  margin-top: 20px;
}
</style>
