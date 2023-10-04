import fs from 'node:fs';
import path from 'node:path';
import { writeFile } from '../utils';
import { safeDeleteFileMarkdown } from '../helpers';
import type { Compiler } from 'webpack';
import Ignore from 'ignore';
import { ISafeDeleteFile, SafeDeleteFileOptions } from '../types';

const pluginName = 'SafeDeleteFile';

class SafeDeleteFile implements ISafeDeleteFile {
  folderPath: string;
  ignore: any;
  outputType: string;
  files: Array<string>;
  cwd: string;

  constructor(options: SafeDeleteFileOptions) {
    this.cwd = process.cwd();
    this.folderPath = options?.folderPath || path.join(process.cwd(), '/src');
    this.ignore = Ignore().add(['node_modules', '.git'].concat(options?.ignore || []));
    this.outputType = options?.outputType || 'json';
    this.files = this.getFilesByFolder(this.folderPath);
  }

  /**
   * @desc 获取文件
   * @param folderPath
   * @returns Array<string>
   */
  getFilesByFolder(folderPath: string) {
    const files: Array<string> = [];
    const { ignore } = this;
    function traverseDirectory(currentPath: string) {
      const items = fs.readdirSync(currentPath);
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        const relativePath = path.relative(folderPath, itemPath);
        if (stat.isFile()) {
          !ignore.ignores(relativePath) && files.push(itemPath);
        } else if (stat.isDirectory() && !ignore.ignores(relativePath)) {
          traverseDirectory(itemPath);
        }
      });
    }
    traverseDirectory(folderPath);
    return files;
  }

  /**
   * @desc
   * @param fileDependencies
   * @returns Array<string>
   */
  getDifferenceFiles(fileDependencies: Array<string>) {
    const differenceFiles = this.files
      .filter(item => !fileDependencies.includes(item))
      .map(filePath => filePath.replace(this.cwd, ''));

    return differenceFiles;
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
    compiler.hooks.done.tap(pluginName, stats => {
      const result = this.getDifferenceFiles([...stats.compilation.fileDependencies]);
      this.outPutFile(result);
    });
  }
}

export default SafeDeleteFile;
