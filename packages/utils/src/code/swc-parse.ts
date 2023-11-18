import { parse } from '@swc/core';
import type { Module } from '@swc/core';

/**
 * @desc 解析代码
 * @param code
 * @returns Promise<Module['body']>
 */
export async function parseCode(code: string): Promise<Module['body']> {
  const { body } = await parse(code);
  return body;
}
