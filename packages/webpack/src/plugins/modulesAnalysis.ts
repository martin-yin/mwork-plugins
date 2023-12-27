import {
  calculateModulesUseInfo,
  getImportsFilesMap,
  getPackageNodeModules,
  isFileInAllowedTypes,
  modulesAnalysisMarkdown
} from '@mwork-plugins/helpers';
import { IModulesAnalysis, ModulesAnalysisOptions, ModulesUseInfoType } from '@mwork-plugins/types/src';
import { writeFile } from '@mwork-plugins/utils';
import { Compiler } from 'webpack';

const pluginName = 'ModulesAnalysis';

class ModulesAnalysis implements IModulesAnalysis {
  private enable: boolean = false;
  private cwd = process.cwd();
  private allowedTypes: Array<string> = [];
  private ignoreModules: Array<string> = [];
  private nodeModules: Array<string> = [];
  private outputType: 'json' | 'markdown';
  private extraModules: Array<string> = [];

  constructor(options: ModulesAnalysisOptions) {
    this.enable = options.enable;
    this.allowedTypes = options?.allowedTypes || ['vue', 'js', 'jsx', 'tsx', 'ts'];
    this.ignoreModules = options?.ignoreModules || ['vue', 'vue-router'];
    this.outputType = options?.outputType || 'json';
    this.extraModules = options?.extraModules || [];
    this.nodeModules = getPackageNodeModules(this.cwd, this.extraModules);
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
      const filesPath = [...stats.compilation.fileDependencies].filter(filePath =>
        isFileInAllowedTypes(filePath, this.allowedTypes));
      const filesModuleMap = await getImportsFilesMap(this.cwd, filesPath);
      const modulesUseInfo = calculateModulesUseInfo(filesModuleMap, this.ignoreModules, this.nodeModules);
      this.outPutFile(modulesUseInfo);
    });
  }
}

export default ModulesAnalysis;
