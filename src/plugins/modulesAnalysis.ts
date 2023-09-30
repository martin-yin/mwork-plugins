import fs from 'node:fs';
import path from 'node:path';
import swc from '@swc/core';
import vueCompiler from '@vue/compiler-dom';
import json2md from 'json2md';
import { Compiler } from 'webpack';
import { getCodeByFilePath, getNodeModules, parseCode } from '../utils';

const pluginName = 'ModulesAnalysis';

abstract class ModulesAnalysisIf {
  abstract isAcceptFile(file: string): boolean;

  abstract getNodeModuleFilesMap(files: Array<string>): any;

  abstract calculateModuleUseInfo(data: any): any;

  abstract outPutFile(content: Array<string>): void;

  apply(compiler: Compiler): void {}
}
class ModulesAnalysis implements ModulesAnalysisIf {
  private acceptType: Array<string> = [];
  private ignoreModules: Array<string> = [];
  private outputType: 'json' | 'markdonw';
  private packageNodeModules: string[] = [];

  constructor(options: any) {
    this.acceptType = options?.acceptType || ['vue', 'js', 'jsx', 'tsx', 'ts'];
    this.ignoreModules = options?.ignoreModules || ['vue', 'vue-router'];
    this.outputType = options?.outputType || 'json';
    // this.packageNodeModules = this.getPackageNodeModules();
  }

  isAcceptFile(file: string) {
    if (file.includes('node_modules')) {
      return false;
    }

    return this.acceptType.includes(file.split('.')?.pop() || '');
  }

  async getNodeModuleFilesMap(files: Array<string>) {
    const cwd = process.cwd() + '\\';
    const nodeModuleFilesMap = new Map();
    const nodeModulePromises = files.map(async file => {
      const code = getCodeByFilePath(file);
      const ast = await parseCode(code);
      const nodeModules = getNodeModules(ast);
      if (nodeModules.length) {
        nodeModules.forEach(module => {
          const { value, useType } = module;
          const nodeModuleFilesMapValue = nodeModuleFilesMap?.get(value) || [];
          nodeModuleFilesMap.set(value, [
            ...nodeModuleFilesMapValue,
            {
              filePath: file.replace(cwd, ''),
              useType
            }
          ]);
        });
      }
    });
    await Promise.all(nodeModulePromises);
    return nodeModuleFilesMap;
  }

  outPutFile(content: string[]): void {
    throw new Error('Method not implemented.');
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(pluginName, async stats => {
      const filesPath = [...stats.compilation.fileDependencies].filter(filePath => this.isAcceptFile(filePath));
    });
  }
}

export default ModulesAnalysis;
