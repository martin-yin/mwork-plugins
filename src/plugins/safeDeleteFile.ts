import fs from 'node:fs';
import path from 'node:path';
import { writeFile } from '../utils';
import { safeDeleteFileMarkdown } from '../helpers';
import type { Compiler } from 'webpack';
import Ignore from 'ignore';

abstract class SafeDeleteFileIf {
  /**
   * @desc 根据传递进来的路径去获取路径下所有的文件。
   * @param folderPath
   */
  abstract getFilesByFolder(folderPath: string): Array<string>;
  /**
   * @desc 获取到差异文件，差异文件就是没有使用到的文件。
   * @param fileDependencies
   */
  abstract getDifferenceFiles(fileDependencies: Array<string>): Array<string>;
  /**
   * @desc 输出对比的结果，输出方式根据 outputType 配置决定。
   * @param content
   */
  abstract outPutFile(content: Array<string>): void;
  /**
   * @desc webpack apply
   * @param compiler
   */
  abstract apply(compiler: Compiler): void;
}

const pluginName = 'SafeDeleteFile';

class SafeDeleteFile extends SafeDeleteFileIf {
  folderPath: string;
  ignore: any;
  outputType: string;
  files: Array<string>;

  constructor(options: { folderPath: string; ignore: string; outputType: string; allFolderFiles: Array<string> }) {
    super();
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
    const cwd = process.cwd() + '\\';
    const differenceFiles = this.files
      .filter(item => !fileDependencies.includes(item))
      .map(filePath => filePath.replace(cwd, ''));

    return differenceFiles;
  }

  /**
   * @desc 输出文件
   * @param content
   */
  outPutFile(content: Array<string>) {
    if (this.outputType === 'markdown') {
      writeFile(`./${pluginName}.md`, safeDeleteFileMarkdown(content));
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
