import { ModuleItem } from '@swc/core';
import { parseCode } from './swc-parse';

/**
 * @desc 判断是否是 node_modules 中的包
 * @param value
 * @param node_modules
 * @returns
 */
export function isNodeModule(value: string, node_modules: Array<string>) {
  if (!node_modules.includes(value)) {
    return false;
  }
  return true;
}

/**
 * @desc 获取 script 代码中 require/import 包
 * @param element
 * @returns
 */
export function getImport(element: ModuleItem) {
  if (element.type === 'ImportDeclaration') {
    return {
      value: element.source.value,
      useType: 'import'
    };
  }

  if (element.type === 'VariableDeclaration') {
    const { init } = element?.declarations[0];
    if (
      init?.type === 'CallExpression' &&
      init?.callee.type === 'Identifier' &&
      init.arguments[0]?.expression.type === 'StringLiteral'
    ) {
      return {
        value: init?.arguments[0]?.expression?.value,
        useType: 'require'
      };
    }
  }
  return null;
}

/**
 * @desc 获取代码中 import/require 引用的包名
 * @param code
 * @returns
 */
export async function getImportsByCode(code: string) {
  const imports: Array<{
    useType: string;
    value: string;
  }> = [];
  const ast = await parseCode(code);

  ast.forEach(element => {
    let value = getImport(element);
    if (value) {
      imports.push({ ...value });
    }
  });

  return imports;
}
