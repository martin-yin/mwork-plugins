import { ModuleItem, parse } from '@swc/core';
import type { Module } from '@swc/core';

async function parseCode(code: string): Promise<Module['body']> {
  const { body } = await parse(code);
  return body;
}

function getImport(element: ModuleItem) {
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

async function getImportsByCode(code: string) {
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

function isNodeModule(value: string, node_modules: Array<string>) {
  if (!node_modules.includes(value)) {
    return false;
  }
  return true;
}

export { parseCode, getImportsByCode, isNodeModule };
