import { parse } from '@babel/core';
import generate from '@babel/generator';
import loaderUtils from 'loader-utils';
import { compileTemplate, parse as sfcParse } from '@vue/compiler-sfc';
import { LoaderContext } from 'webpack';
import { getVueTempllateEvents, replaceScriptCode, traverseVueScriptAst } from '../helpers';
import { VueTemplateLogOptions } from '../types/vueTemplateLog';
/**
 * @description 为 vue template 组件增加 log。
 * @param this
 * @param source
 */
export default function VueTemplateLog(this: LoaderContext<VueTemplateLogOptions>, source: string) {
  const loaderContext = this;
  const loaderOptions = this?.getOptions
    ? this.getOptions()
    : (loaderUtils.getOptions(this) as unknown as VueTemplateLogOptions);

  if (!loaderOptions.enable) {
    return source;
  }

  if (!Array.isArray(loaderOptions.events)) {
    return source;
  }

  const { resourcePath, resourceQuery } = loaderContext;

  // 解析出不是 script 的话就直接返回源码。
  if (!resourceQuery.length && !resourceQuery.includes('?vue&type=script')) {
    return source;
  }

  const vueCodeAst = sfcParse(source);

  if (vueCodeAst.errors.length) {
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

  const scriptCode = vueCodeAst.descriptor.script?.content;

  if (!scriptCode) {
    return source;
  }

  const scriptAst = parse(scriptCode, {
    ast: true,
    filename: `${Date.now()}.ts`
  });

  if (!scriptAst) {
    return source;
  }

  const withLogScriptAst = traverseVueScriptAst(scriptAst, templateEvents, resourcePath);
  const { code } = generate(withLogScriptAst);
  const withLogSource = replaceScriptCode(source, code);

  return withLogSource;
}
