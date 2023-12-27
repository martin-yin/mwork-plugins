import { getFilesInFolder, getNonDependentFiles, initIgnoreTool, safeDeleteFileMarkdown } from '@mwork-plugins/helpers';
import { ISafeDeleteFile, SafeDeleteFileOptions } from '@mwork-plugins/types';
import { writeFile } from '@mwork-plugins/utils';
import path from 'node:path';
import type { Compiler } from 'webpack';

const pluginName = 'SafeDeleteFile';

class SafeDeleteFile implements ISafeDeleteFile {
  private enable: boolean = false;
  // private cwd = process.cwd();
  private outputType: string;
  private files: Array<string>;

  constructor(options: SafeDeleteFileOptions) {
    this.enable = options.enable;
    this.outputType = options?.outputType || 'json';
    const folderPath = options?.folderPath || path.join(process.cwd(), '/src');
    const ignore = initIgnoreTool(options.ignore);
    this.files = getFilesInFolder(folderPath, ignore);
  }

  /**
   * @desc 输出文件
   * @param content
   */
  outPutFile(content: Array<string>) {
    if (this.outputType === 'markdown') {
      writeFile(`./${pluginName}.md`, safeDeleteFileMarkdown(content));
      return;
    }
    writeFile(`./${pluginName}.json`, JSON.stringify(content));
  }

  apply(compiler: Compiler) {
    if (!this.enable) {
      return;
    }
    compiler.hooks.done.tap(pluginName, stats => {
      // 获取到差异文件，差异文件就是没有使用到的文件。
      const result = getNonDependentFiles(this.files, [...stats.compilation.fileDependencies]);
      this.outPutFile(result);
    });
  }
}

export default SafeDeleteFile;
