<template>
  <div>
    <p @click="fun">defineComponent setup 的函数方法</p>
    <p @click="arrfun">defineComponent setup 的箭头方法</p>

    <p @click="defindMethod">defineComponent method 方法</p>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    function fun() {
      console.log('defineComponent setup 的函数方法');
    }

    const arrfun = () => {
      console.log('defineComponent setup 的箭头方法');
    };
    return { fun, arrfun };
  },
  methods: {
    defindMethod() {
      console.log('defineComponent method 方法');
    }
  }
});
</script>
