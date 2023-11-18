import {
  calculateModulesUseInfo,
  getImportsFilesMap,
  getPackageNodeModules,
  modulesAnalysisMarkdown
} from '@mwork-plugins/helpers';
import { IModulesAnalysis, ModulesAnalysisOptions, ModulesUseInfoType } from '@mwork-plugins/types/src';
import { writeFile } from '@mwork-plugins/utils';
import { Compiler } from 'webpack';

const pluginName = 'ModulesAnalysis';

class ModulesAnalysis implements IModulesAnalysis {
  private enable: boolean = false;
  private cwd = process.cwd();
  private acceptType: Array<string> = [];
  private ignoreModules: Array<string> = [];
  private nodeModules: Array<string> = [];
  private outputType: 'json' | 'markdown';
  private extraModules: Array<string> = [];

  constructor(options: ModulesAnalysisOptions) {
    this.enable = options.enable;
    this.acceptType = options?.acceptType || ['vue', 'js', 'jsx', 'tsx', 'ts'];
    /**
     * @desc 用于判断哪些 node 包会被忽略。
     */
    this.ignoreModules = options?.ignoreModules || ['vue', 'vue-router'];
    this.outputType = options?.outputType || 'json';
    this.extraModules = options?.extraModules || [];
    this.nodeModules = getPackageNodeModules(this.cwd, this.extraModules);
  }

  isAcceptFile(file: string) {
    if (file.includes('node_modules')) {
      return false;
    }

    return this.acceptType.includes(file.split('.')?.pop() || '');
  }

  outPutFile(content: ModulesUseInfoType) {
    if (this.outputType === 'markdown') {
      writeFile(`./${pluginName}.md`, modulesAnalysisMarkdown(content));
      return;
    }
    writeFile(`./${pluginName}.json`, JSON.stringify(content));
  }

  apply(compiler: Compiler) {
    if (!this.enable) {
      return;
    }

    compiler.hooks.done.tap(pluginName, async stats => {
      const filesPath = [...stats.compilation.fileDependencies].filter(filePath => this.isAcceptFile(filePath));
      const filesModuleMap = await getImportsFilesMap(this.cwd, filesPath);
      const modulesUseInfo = calculateModulesUseInfo(filesModuleMap, this.ignoreModules, this.nodeModules);

      debugger;
      this.outPutFile(modulesUseInfo);
    });
  }
}

export default ModulesAnalysis;
