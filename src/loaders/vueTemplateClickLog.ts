import { LoaderContext } from 'webpack';
import { parse, compileTemplate } from '@vue/compiler-sfc';

/**
 * @description 为 vue template 中的 click 方法增加日志。
 * @param this
 * @param source
 */
export default function vueTemplateClickLog(this: LoaderContext<any>, source: string) {
  const loaderContext = this;
  const { resourcePath } = loaderContext;

  const vueCodeAst = parse(source);
  const templateAst = compileTemplate({
    ...vueCodeAst.descriptor,
    id: resourcePath
  });

  // 遍历 templateAst 查询出该 template 中所有的 click 事件名称。

  // 在 script 部分中找到对应的 methdos，并在函数之前添加 console.log。
  return source;
}
