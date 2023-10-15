import { LoaderContext } from 'webpack';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import { getVueTempllateEvents, replaceScriptCode } from '../utils';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const template = require('@babel/template').default;
const t = require('@babel/types');
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
  const scriptAst = parser.parse(scriptCode, {
    sourceType: 'unambiguous'
  });

  traverse(scriptAst, {
    BlockStatement(path: any) {
      if (path.isAddLog) {
        return;
      }
      const parentPath = path?.parentPath;
      const methdoName = parentPath?.node?.key?.name;

      if (methdoName !== '' && events.includes(methdoName)) {
        let methodContainsEmit = false;
        path.traverse({
          MemberExpression(innerPath: any) {
            if (
              t.isThisExpression(innerPath.node.object) &&
              t.isIdentifier(innerPath.node.property) &&
              innerPath?.node?.property?.name === '$emit'
            ) {
              methodContainsEmit = true;
            }
          }
        });

        const newTemplate = template.ast(`
          console.log("方法名称: ${methdoName}");
          console.log("文件位置: ${resourcePath}");
          console.log("是否触发emit: ${methodContainsEmit ? '是' : '否'}");
        `);

        path.unshiftContainer('body', newTemplate);
        path.isAddLog = true;
      }
    }
  });

  const { code } = generate(scriptAst);
  const withLogSource = replaceScriptCode(source, code);

  return withLogSource;
}
