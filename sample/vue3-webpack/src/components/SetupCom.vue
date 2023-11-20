<template>
  <div>
    <div @click="setupFun('setup 的函数方法')">setup 的函数方法</div>
    <div @click="setupArr">setup 的箭头函数</div>
  </div>
</template>
<script setup lang="ts">
function setupFun(value: string) {
  console.log(value);
}

const setupArr = () => {
  console.log('setup 的箭头函数');
};
</script>
