import type { Module } from '@swc/core';
import { parse } from '@swc/core';
import { parse as sfcParse } from '@vue/compiler-sfc';
import fs from 'node:fs';

/**
 * @desc 读取 vue 代码
 * @param path
 * @returns
 */
export function getScriptCode(path: string) {
  const code = fs.readFileSync(path, {
    encoding: 'utf-8'
  });

  return code;
}

/**
 * @desc 获取 vue scirpt 部分代码
 * @param path
 * @returns
 */
export function getVueScriptCode(path: string) {
  const code = getScriptCode(path);
  if (!code) {
    return '';
  }

  // 使用 vue sfc 获取到 script
  const vueCodeAst = sfcParse(code);
  const vueScript = vueCodeAst.descriptor.script;

  if (vueCodeAst.errors.length) {
    return '';
  }

  return vueScript?.content || '';
}

export const codeMethods = {
  vue: getVueScriptCode,
  js: getScriptCode,
  jsx: getScriptCode,
  ts: getScriptCode,
  tsx: getScriptCode,
  unknow: () => ''
};

type TargetType = typeof codeMethods;
type TargetTypeKeys = keyof TargetType;

/**
 * @desc 通过 Proxy 获取对应的方法，读取代码。
 */
export const codeMethodsProxy = new Proxy(codeMethods, {
  get: function (target: TargetType, property: TargetTypeKeys) {
    if (property in target) {
      return target[property];
    }
    return target['unknow'];
  }
});

/**
 * @desc 根据文件文件后缀获取对应的方式解析 script
 * @param filePath
 * @returns
 */
export function getCodeByFileExt(filePath: string) {
  const extension = filePath.split('.').pop() as TargetTypeKeys;
  return codeMethodsProxy[extension](filePath);
}

/**
 * @desc 解析代码
 * @param code
 * @returns Promise<Module['body']>
 */
export async function parseCodeBySwc(code: string): Promise<Module['body']> {
  const { body } = await parse(code);
  return body;
}
