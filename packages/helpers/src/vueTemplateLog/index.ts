import { parse, ParseResult } from '@babel/core';
import generate from '@babel/generator';
import template from '@babel/template';
import traverse from '@babel/traverse';
import * as babelTypes from '@babel/types';
import { VueTemplateEvent, VueTemplateEvents } from '@mwork-plugins/types';
import type { SFCTemplateCompileResults } from '@vue/compiler-sfc';
import { compileTemplate, parse as sfcParse } from '@vue/compiler-sfc';

/**
 * @description 获取 vue 模版中的 events。
 * @param templateAst
 * @returns
 */
export function getVueTempllateEvents(templateAst: SFCTemplateCompileResults | null, events: Array<string>) {
  const vueTemplateEvents: VueTemplateEvents = [];
  if (!templateAst) {
    return vueTemplateEvents;
  }
  recursiveTemplateProps(templateAst.ast?.children, events, vueTemplateEvents);
  return vueTemplateEvents;
}

/**
 * @description 递归获取 template 中的 click 事件。
 * @param array
 * @param events
 * @param vueTemplateEvents
 */
export function recursiveTemplateProps(array: any, events: Array<string>, vueTemplateEvents: VueTemplateEvents = []) {
  if (Array.isArray(array)) {
    array.forEach(item => {
      if (item.children) {
        recursiveTemplateProps(item.children, events, vueTemplateEvents);
      }
      if (item.props) {
        // 对 props 数组进行操作
        item.props.forEach((prop: any) => {
          if (prop.type === 7 && prop?.arg?.content && events.includes(prop.arg.content)) {
            let templateEvent: VueTemplateEvent;
            if (prop.exp?.children) {
              templateEvent = {
                event: prop.arg.content,
                method: prop.exp?.children[0]?.loc?.source
              };
            } else {
              templateEvent = {
                event: prop.arg.content,
                method: prop?.exp?.loc?.source
              };
            }
            vueTemplateEvents.push(templateEvent);
          }
        });
      }
    });
  }
}

/**
 * @description 根据 method 名称获取 template 中的 event
 * @param method
 * @param vueTemplateEvents
 * @returns boolean
 */
export function getTemplateEventByMethod(method: string, vueTemplateEvents: VueTemplateEvents) {
  const events = vueTemplateEvents.filter(event => event.method === method);

  if (!events.length) {
    return null;
  }

  return events[0];
}

/**
 * @description 递归处理 ast，并给其添加 log。
 * @param scriptAst
 * @param vueTemplateEvents
 * @param resourcePath
 * @returns
 */
export function traverseVueScriptAst(
  scriptAst: ParseResult,
  vueTemplateEvents: VueTemplateEvents,
  resourcePath: string
): ParseResult {
  traverse(scriptAst, {
    BlockStatement(path: any) {
      if (path?.isAddLog) {
        return;
      }
      const parentPath = path?.parentPath;
      // 判断是不是方法
      if (!babelTypes.isMethod(parentPath?.node)) {
        return;
      }

      const method = parentPath?.node?.key?.name;

      if (method === '') {
        return;
      }

      const templateEvent = getTemplateEventByMethod(method, vueTemplateEvents);
      if (templateEvent) {
        let methodContainsEmit = false;
        path.traverse({
          MemberExpression(innerPath: any) {
            if (
              babelTypes.isThisExpression(innerPath.node.object) &&
              babelTypes.isIdentifier(innerPath.node.property) &&
              innerPath?.node?.property?.name === '$emit'
            ) {
              methodContainsEmit = true;
            }
          }
        });
        const filePath = resourcePath;
        const escapedFilePath = JSON.stringify(filePath);
        const newTemplate = template.ast(`
            console.log('------vueTemplateLog------')
            console.log('事件名称: ${templateEvent.event}');
            console.log('方法名称: ${method}');
            console.log('文件位置: ${escapedFilePath}');
            console.log('是否触发emit: ${methodContainsEmit ? '是' : '否'}');
            console.log('------vueTemplateLog------')
          `);

        path.unshiftContainer('body', newTemplate);
        path.isAddLog = true;
      }
    }
  });

  return scriptAst;
}

/**
 * @description 替换源代码。
 * @param content
 * @param replaceContent
 * @returns
 */
export function replaceScriptCode(content: string, replaceContent: string) {
  let regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/;
  let matches = content.match(regex);

  if (matches) {
    let scriptTag = matches[0];
    let attributes = matches[1];
    let originalContent = matches[2];

    let newScriptTag = `<script${attributes}>${originalContent.replace(originalContent, replaceContent)}</script>`;
    content = content.replace(scriptTag, newScriptTag);
  }

  return content;
}

/**
 * @desc 给 template 添加 log
 * @param source
 * @param resourcePath
 * @param events
 * @returns
 */
export function addTemplateEventLog(source: string, resourcePath: string, events: Array<string>) {
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

  const templateEvents = getVueTempllateEvents(templateAst, events);

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

  try {
    const withLogScriptAst = traverseVueScriptAst(scriptAst, templateEvents, resourcePath);
    const { code } = generate(withLogScriptAst);
    const withLogSource = replaceScriptCode(source, code);

    return withLogSource;
  } catch (e) {
    return source;
  }
}
