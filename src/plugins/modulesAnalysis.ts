import fs from 'node:fs';
import path from 'node:path';
import { Compiler } from 'webpack';
import { getCodeByFilePath, getImportsByCode, writeFile } from '../utils';
import { modulesAnalysisMarkdown } from '../helpers';
import { IModulesAnalysis, ImportsFilesMapType, ModulesAnalysisOptions, ModulesUseInfoType } from '../types';

const pluginName = 'ModulesAnalysis';

class ModulesAnalysis implements IModulesAnalysis {
  private cwd = process.cwd();
  private acceptType: Array<string> = [];
  private ignoreModules: Array<string> = [];
  private packageNodeModules: string[] = [];
  private outputType: 'json' | 'markdown';

  constructor(options: ModulesAnalysisOptions) {
    this.acceptType = options?.acceptType || ['vue', 'js', 'jsx', 'tsx', 'ts'];
    /**
     * @desc 用于判断哪些 node 包会被忽略。
     */
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

    const packageNodeModules = [
      ...(packageJson?.peerDependencies ? Object.keys(packageJson.peerDependencies) : []),
      ...(packageJson?.dependencies ? Object.keys(packageJson.dependencies) : []),
      ...(packageJson?.devDependencies ? Object.keys(packageJson.devDependencies) : [])
    ];
    return packageNodeModules;
  }

  calculateModulesUseInfo(filesModuleMap: ImportsFilesMapType): ModulesUseInfoType {
    const modulesUseInfo: ModulesUseInfoType = [];

    filesModuleMap.forEach((value, key) => {
      if (!this.ignoreModules.includes(key) && this.packageNodeModules.includes(key)) {
        modulesUseInfo.push({
          name: key,
          total: value.length,
          files: value
        });
      }
    });

    return modulesUseInfo;
  }

  isAcceptFile(file: string) {
    if (file.includes('node_modules')) {
      return false;
    }

    return this.acceptType.includes(file.split('.')?.pop() || '');
  }

  async getImportsFilesMap(files: Array<string>) {
    const importsFilesMap: ImportsFilesMapType = new Map();
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

  outPutFile(content: ModulesUseInfoType) {
    if (this.outputType === 'markdown') {
      writeFile(`./${pluginName}.md`, modulesAnalysisMarkdown(content));
      return;
    }
    writeFile(`./${pluginName}.json`, JSON.stringify(content));
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap(pluginName, async stats => {
      const filesPath = [...stats.compilation.fileDependencies].filter(filePath => this.isAcceptFile(filePath));
      const filesModuleMap = await this.getImportsFilesMap(filesPath);
      const modulesUseInfo = this.calculateModulesUseInfo(filesModuleMap);

      this.outPutFile(modulesUseInfo);
    });
  }
}

export default ModulesAnalysis;
