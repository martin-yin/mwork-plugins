import { LoaderContext } from 'webpack';
import { parse as sfcParse, compileTemplate } from '@vue/compiler-sfc';
import { getVueTempllateEvents, replaceScriptCode, traverseVueScriptAst } from '../helpers';
import { parse } from '@babel/core';
import generate from '@babel/generator';
/**
 * @description 为 vue template 组件增加 log。
 * @param this
 * @param source
 */
type VueTemplateLogOptions = {
  enable: boolean;
  events: Array<string>;
};

export default function VueTemplateLog(this: LoaderContext<VueTemplateLogOptions>, source: string) {
  const loaderContext = this;
  const loaderOptions = this.getOptions();

  if (!loaderOptions.enable) {
    return source;
  }

  if (!Array.isArray(loaderOptions.events)) {
    return source;
  }

  const { resourcePath } = loaderContext;

  const vueCodeAst = sfcParse(source);
  const scriptCode = vueCodeAst.descriptor.script?.content;

  if (!scriptCode) {
    return source;
  }

  const templateAst = compileTemplate({
    ...vueCodeAst.descriptor,
    id: resourcePath
  });

  if (!templateAst.errors.length) {
    return source;
  }

  const templateEvents = getVueTempllateEvents(templateAst, loaderOptions.events);

  if (!templateEvents.length) {
    return source;
  }

  const scriptAst = parse(scriptCode, {
    ast: true,
    filename: `${Date.now()}.ts`
  });

  if (!scriptAst) {
    return source;
  }
  // 改方法处理清洗后会给相应的 click 事件增加 log
  const withLogScriptAst = traverseVueScriptAst(scriptAst, templateEvents, resourcePath);
  const { code } = generate(withLogScriptAst);
  const withLogSource = replaceScriptCode(source, code);

  return withLogSource;
}
