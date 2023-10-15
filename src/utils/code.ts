const vueCompiler = require('@vue/compiler-dom');
import type { SFCTemplateCompileResults } from '@vue/compiler-sfc';
import fs from 'node:fs';

type element = {
  tag: string;

  children: Array<{
    content: string;
  }>;
};

function getScriptCode(path: string) {
  const code = fs.readFileSync(path, {
    encoding: 'utf-8'
  });

  return code;
}

function getVueScriptCode(path: string) {
  const code = getScriptCode(path);
  let scriptCode = '';

  if (!code) {
    return scriptCode;
  }

  const { children } = vueCompiler.parse(code);
  children.forEach((element: element) => {
    if (element?.tag === 'script') {
      scriptCode = element.children[0].content;
    }
  });

  return scriptCode;
}

const codeMethods = {
  vue: getVueScriptCode,
  js: getScriptCode,
  jsx: getScriptCode,
  ts: getScriptCode,
  tsx: getScriptCode,
  unknow: () => ''
};

type TargetType = typeof codeMethods;

type TargetTypeKeys = keyof TargetType;

const codeMethodsProxy = new Proxy(codeMethods, {
  get: function (target: TargetType, property: TargetTypeKeys) {
    if (property in target) {
      return target[property];
    }
    return target['unknow'];
  }
});

function getCodeByFilePath(filePath: string) {
  const extensions = filePath.split('.').pop() as TargetTypeKeys;

  return codeMethodsProxy[extensions](filePath);
}

function recursiveTemplateProps(array: any, events: Array<string> = []) {
  if (Array.isArray(array)) {
    array.forEach(item => {
      if (item.children) {
        recursiveTemplateProps(item.children, events);
      }
      if (item.props) {
        // 对 props 数组进行操作
        item.props.forEach((prop: any) => {
          if (prop.type === 7 && prop.arg.content === 'click') {
            let eventName = '';
            if (prop.exp?.children) {
              eventName = prop.exp?.children[0]?.loc?.source;
            }
            events.push(eventName);
          }
        });
      }
    });
  }
}

function getVueTempllateEvents(templateAst: SFCTemplateCompileResults) {
  const events: Array<string> = [];
  recursiveTemplateProps(templateAst.ast?.children, events);
  return events;
}

function replaceScriptCode(content: string, replaceContent: string) {
  let regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/;
  let matches = content.match(regex);

  if (matches) {
    let scriptTag = matches[0];
    let attributes = matches[1];
    let originalContent = matches[2];

    // 构建新的 <script> 标签，保留原有的属性和其他内容
    let newScriptTag = `<script${attributes}>${originalContent.replace(originalContent, replaceContent)}</script>`;

    // 替换原有的 <script> 标签为新的标签
    content = content.replace(scriptTag, newScriptTag);
  }

  return content;
}

export { getCodeByFilePath, getVueTempllateEvents, replaceScriptCode };
