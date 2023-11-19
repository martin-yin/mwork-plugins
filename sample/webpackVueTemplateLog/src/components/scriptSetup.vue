<template>
  <div class="margin-top-20">
    <div @click="scriptSetup">script setup 方法调用</div>
    <div @click="scriptSetupArrow">script setup 箭头函数调用</div>
  </div>
</template>
<script setup>
function scriptSetup() {
  console.log('script setup 方法调用');
}

const scriptSetupArrow = () => {
  console.log('script setup 箭头函数调用');
};
</script>
<style scoped>
.margin-top-20 {
  margin-top: 20px;
}
</style>
