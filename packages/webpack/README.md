# @mwork-plugins/webpack

## Loader

### VueTemplateLog

为 `vue` 文件中的函数增加 `log`, 方便开发者查询对应文件位置。

#### options

|     名称     |    类型     | 描述                | 默认值          |
| :----------: | :---------: | :------------------ | :-------------- |
| **`enable`** | `{Boolean}` | 是否开loader        | 默认值: `false` |
| **`events`** |  `{Array}`  | 哪些事件需要增加log | 默认值: `[]`    |

#### 使用案例

```js
// vue.config.js
module.exports = defineConfig({
  transpileDependencies: true,

  chainWebpack: config => {
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-template-log')
      .loader('work-webpack/dist/vueTemplateLog')
      .options({
        events: ['cancel', 'ok', 'click'], // 为@cancel @ok @click 事件增加 log
        enable: true
      })
      .end();
  }
});
```

## Plugins

### ModulesAnalysis

用于分析项目中 `node_modules` 使用的次数与方式。

分析出项目中每个包的使用情况，使开发者能够分析哪些包可以更进一步的做优化。

#### options

|        名称         |    类型     | 描述                                    | 默认值                                      |
| :-----------------: | :---------: | :-------------------------------------- | :------------------------------------------ |
|    **`enable`**     | `{Boolean}` | 是否开启插件                            | 默认值: `false`                             |
|    **`enable`**     | `{Boolean}` | 是否开启插件                            | 默认值: `false`                             |
|  **`acceptType`**   |  `{Array}`  | 文件类型                                | 默认值: `['vue', 'js', 'jsx', 'tsx', 'ts']` |
| **`ignoreModules`** |  `{Array}`  | 需要被忽略的 node_module 名称           | 默认值: `['vue', 'vue-router']`             |
| **`extraModules`**  |  `{Array}`  | 额外的包，补充在package.json 中没有的包 | 默认值: `[]`                                |
|  **`outputType`**   | `{String}`  | 输出方式, 支持 `json` `markdown`        | 默认值: `'json'`                            |

#### 使用案例

```js
// vue.config.js
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new ModulesAnalysis({
        enable: true
      })
    ]
  }
});
```

### SafeDeleteFile

用于分析项目中有哪些文件没有被使用，也许可以安全删除。

在老项目不停的迭代，有些代码或文件也许早已没有作用，但开发者不知道哪些文件可以安全删除。那么你可以试试这个插件！

#### options

|       名称       |         类型         | 描述                             | 默认值                           |
| :--------------: | :------------------: | :------------------------------- | :------------------------------- |
|   **`enable`**   |     `{Boolean}`      | 是否开启插件                     | 默认值: `false`                  |
| **`folderPath`** |      `{String}`      | 文件路径                         | 默认值: `cli` 执行目录下的 `src` |
|   **`ignore`**   | `{String}` `{Array}` | 需要被忽略文件夹或文件           | 默认值: []                       |
| **`outputType`** |      `{String}`      | 输出方式, 支持 `json` `markdown` | 默认值: `'json'`                 |

#### 使用案例

```js
// vue.config.js
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new SafeDeleteFile({
        enable: true
      })
    ]
  }
});
```

### ReplaceConsole

某个项目开发阶段，因历史原因 遗留的 `console` 特别多的时候，影响开发调试，可以使用该插件。

该插件会将项目中的 `console` 重写为空函数（实现清理旧 `console` 的目的），如果需要使用 `console`, 则可以使用 `mconsole`(重写前的 `console api`)打印日志。

tips: 三方插件可以压缩代码丢弃 `console`，但是代码压缩会增加开发者机器压力。

#### options

|     名称     |    类型     | 描述         | 默认值          |
| :----------: | :---------: | :----------- | :-------------- |
| **`enable`** | `{Boolean}` | 是否开启插件 | 默认值: `false` |

#### 使用案例

```js
// vue.config.js
module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new ReplaceConsole({
        enable: true
      })
    ]
  }
});
```
