# @mwork-plugins/vite

## Plugins

### VueTemplateLog

为 `vue` 文件中的函数增加 `log`, 方便开发者查询对应文件位置。

#### options

|     名称     |    类型     | 描述                | 默认值          |
| :----------: | :---------: | :------------------ | :-------------- |
| **`enable`** | `{Boolean}` | 是否开loader        | 默认值: `false` |
| **`events`** |  `{Array}`  | 哪些事件需要增加log | 默认值: `[]`    |

#### 使用案例

```js
import { vueTemplateLog } from '@mwork-plugins/vite';
// vite.config.js
export default defineConfig({
  plugins: [
    vueTemplateLog({
      enable: true,
      events: ['ok', 'click']
    })
  ]
});
```
