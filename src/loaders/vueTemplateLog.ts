import { LoaderContext } from 'webpack';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import { getVueTempllateEvents, replaceScriptCode, traverseVueScriptAst } from '../helpers';
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
/**
 * @description 为 vue template 组件增加 log。
 * 1. click 事件增加 log，方便开发者查询 click 来源。
 * 2. emit 事件增加 log，方便开发者查询到 emit 触发链。
 * @param this
 * @param source
 */
export default function VueTemplateLog(this: LoaderContext<any>, source: string) {
  const loaderContext = this;
  const { resourcePath } = loaderContext;

  const vueCodeAst = parse(source);
  const scriptCode = vueCodeAst.descriptor.script?.content;

  if (!scriptCode) {
    return source;
  }

  const templateAst = compileTemplate({
    ...vueCodeAst.descriptor,
    id: resourcePath
  });

  const events = getVueTempllateEvents(templateAst);
  if (!events.length) {
    return source;
  }

  const scriptAst = parser.parse(scriptCode, {
    sourceType: 'unambiguous'
  });
  // 改方法处理清洗后会给相应的 click 事件增加 log
  const withLogScriptAst = traverseVueScriptAst(scriptAst, events, resourcePath);
  const { code } = generate(withLogScriptAst);
  const withLogSource = replaceScriptCode(source, code);

  return withLogSource;
}
