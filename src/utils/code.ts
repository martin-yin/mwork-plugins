const vueCompiler = require('@vue/compiler-dom');
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

export { getCodeByFilePath };
