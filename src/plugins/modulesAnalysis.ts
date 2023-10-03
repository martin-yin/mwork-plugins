import fs from 'node:fs';
import path from 'node:path';
import { Compiler } from 'webpack';
import { getCodeByFilePath, getImportsByCode, writeFile } from '../utils';
import { modulesAnalysisMarkdown } from '../helpers';
import { ModulesAnalysisType } from '../types';

const pluginName = 'ModulesAnalysis';

class ModulesAnalysis implements ModulesAnalysisType.IModulesAnalysis {
  private cwd = process.cwd() + '\\';
  private acceptType: Array<string> = [];
  private ignoreModules: Array<string> = [];
  private packageNodeModules: string[] = [];
  private outputType: 'json' | 'markdown';

  constructor(options: ModulesAnalysisType.options) {
    this.acceptType = options?.acceptType || ['vue', 'js', 'jsx', 'tsx', 'ts'];
    this.ignoreModules = options?.ignoreModules || ['vue', 'vue-router'];
    this.outputType = options?.outputType || 'json';

    this.packageNodeModules = this.getPackageNodeModules();
  }

  getPackageNodeModules() {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), './package.json'), {
        encoding: 'utf-8'
      })
    );

    const packageNodeModules = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)];
    return packageNodeModules;
  }

  calculateModuleUseInfo(
    filesModuleMap: Map<
      string,
      Array<{
        filePath: string;
        useType: string;
      }>
    >
  ) {
    const moduleInfo: Array<{
      name: string;
      total: number;
      files: Array<{
        filePath: string;
        useType: string;
      }>;
    }> = [];

    filesModuleMap.forEach((value, key) => {
      if (!this.ignoreModules.includes(key) && this.packageNodeModules.includes(key)) {
        moduleInfo.push({
          name: key,
          total: value.length,
          files: value
        });
      }
    });

    return moduleInfo;
  }

  isAcceptFile(file: string) {
    if (file.includes('node_modules')) {
      return false;
    }

    return this.acceptType.includes(file.split('.')?.pop() || '');
  }

  async getImportsFilesMap(files: Array<string>) {
    const importsFilesMap = new Map<
      string,
      Array<{
        filePath: string;
        useType: string;
      }>
    >();
    const importsPromises = files.map(async file => {
      const code = getCodeByFilePath(file);
      const imports = await getImportsByCode(code);
      if (imports.length) {
        imports.forEach(importElement => {
          const { value, useType } = importElement;
          const nodeModuleFilesMapValue = importsFilesMap?.get(value) || [];
          importsFilesMap.set(value, [
            ...nodeModuleFilesMapValue,
            {
              filePath: file.replace(this.cwd, ''),
              useType
            }
          ]);
        });
      }
    });
    await Promise.all(importsPromises);

    return importsFilesMap;
  }

  outPutFile(content: any) {
    if (this.outputType === 'markdown') {
      writeFile(`./${pluginName}.md`, modulesAnalysisMarkdown(content));
    }
    writeFile(`./${pluginName}.json`, JSON.stringify(content));
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(pluginName, async stats => {
      const filesPath = [...stats.compilation.fileDependencies].filter(filePath => this.isAcceptFile(filePath));
      const filesModuleMap = await this.getImportsFilesMap(filesPath);
      const result = this.calculateModuleUseInfo(filesModuleMap);

      this.outPutFile(result);
    });
  }
}

export default ModulesAnalysis;
