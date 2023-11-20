<script lang="tsx">
import { defineComponent } from 'vue';

export default defineComponent({
  render() {
    return (
      <div
        onClick={() => {
          console.log(1);
        }}
      >
        tsx 方式渲染的组件
      </div>
    );
  }
});
</script>
