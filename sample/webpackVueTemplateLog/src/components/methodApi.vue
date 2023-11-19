<template>
  <div class="margin-top-20" @click="methodClick()">选项 method Api</div>
</template>

<script>
export default {
  methods: {
    methodClick() {
      console.log('选项 method Api');
    }
  }
};
</script>
<style scoped>
.margin-top-20 {
  margin-top: 20px;
}
</style>
