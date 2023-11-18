import json2md from 'json2md';
import { Compiler } from 'webpack';

export abstract class IModulesAnalysis {
  /**
   * @desc 用于判断哪些文件可以被解析。
   * @param file
   */
  abstract isAcceptFile(file: string): boolean;

  /**
   * @desc 输出结果，输出方式根据 outputType 配置决定。
   * @param content
   */
  abstract outPutFile(content: ModulesUseInfoType): void;
  /**
   * @desc webpack apply
   * @param compiler
   */
  apply(compiler: Compiler): void {}
}

/**
 * @desc 初始化参数
 */
export type ModulesAnalysisOptions = {
  enable: boolean;
  acceptType: Array<string>;
  ignoreModules: Array<string>;
  outputType: 'json' | 'markdown';
  allFolderFiles: Array<string>;
  extraModules: Array<string>;
};

export type ImportsFilesMapType = Map<
  string,
  Array<{
    filePath: string;
    useType: string;
  }>
>;

export type ModuleUseInfoType = {
  name: string;
  total: number;
  files: Array<{
    filePath: string;
    useType: string;
  }>;
};

export type ModulesUseInfoType = Array<ModuleUseInfoType>;

export type ModulesAnalysisMarkdownContentType = json2md.DataObject | json2md.DataObject[] | string | string[];
