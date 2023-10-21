import json2md from 'json2md';
import { ModulesAnalysisMarkdownContentType, ModulesUseInfoType } from '../types';
import type { SFCTemplateCompileResults } from '@vue/compiler-sfc';
// 这里不使用 require 方式引入会报错，后期处理！
import template from '@babel/template';
import traverse from '@babel/traverse';
import { ParseResult } from '@babel/core';
import * as babelTypes from '@babel/types';

export function safeDeleteFileMarkdown(content: Array<string>): string {
  const markdownContent = content.map(item => {
    return { p: `${item}` };
  });

  return json2md([{ h1: `SafeDeleteFile 扫描结果` }, { blockquote: '以下文件也许可以安全删除' }, ...markdownContent]);
}

export function modulesAnalysisMarkdown(content: ModulesUseInfoType) {
  const markdownContent: ModulesAnalysisMarkdownContentType = [];
  markdownContent.push({ h1: `ModulesAnalysis 分析结果` });

  content.forEach(item => {
    markdownContent.push({ h2: item.name });
    markdownContent.push({ h3: `使用次数: ${item.total}` });
    item.files.forEach(({ filePath, useType }: any) => {
      markdownContent.push({ p: `文件: ${filePath}` });
      markdownContent.push({ p: `使用方式：${useType}` });
    });
  });

  return json2md(markdownContent);
}

/**
 * @description 递归获取 template 中的 click 事件。
 * @param array
 * @param templateEvents
 */
export function recursiveTemplateProps(array: any, events: Array<string>, templateEvents: Array<string> = []) {
  if (Array.isArray(array)) {
    array.forEach(item => {
      if (item.children) {
        recursiveTemplateProps(item.children, events, templateEvents);
      }
      if (item.props) {
        // 对 props 数组进行操作
        item.props.forEach((prop: any) => {
          if (prop.type === 7 && prop?.arg?.content && events.includes(prop.arg.content)) {
            let templateEvent = '';
            if (prop.exp?.children) {
              templateEvent = prop.exp?.children[0]?.loc?.source;
            } else {
              templateEvent = prop?.exp?.loc?.source;
            }
            templateEvents.push(templateEvent);
          }
        });
      }
    });
  }
}

/**
 * @description 获取 vue 模版中的 events。
 * @param templateAst
 * @returns
 */
export function getVueTempllateEvents(templateAst: SFCTemplateCompileResults, events: Array<string>) {
  const templateEvents: Array<string> = [];
  recursiveTemplateProps(templateAst.ast?.children, events, templateEvents);
  return templateEvents;
}

/**
 * @description 递归处理 ast，并给其添加 log。
 * @param scriptAst
 * @param events
 * @param resourcePath
 * @returns
 */
export function traverseVueScriptAst(scriptAst: ParseResult, events: Array<string>, resourcePath: string) {
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

      const methdoName = parentPath?.node?.key?.name;
      if (methdoName !== '' && events.includes(methdoName)) {
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
          console.log('方法名称: ${methdoName}');
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
