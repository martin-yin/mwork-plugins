import json2md from 'json2md';
import { Compiler } from 'webpack';

export abstract class IModulesAnalysis {
  /**
   * @desc 输出结果，输出方式根据 outputType 配置决定。
   * @param content
   */
  abstract outPutFile(content: ModulesUseInfoType): void;
  /**
   * @desc webpack apply
   * @param compiler
   */
  apply(compiler: Compiler): void { }
}

/**
 * @desc 初始化参数
 */
export type ModulesAnalysisOptions = {
  enable: boolean;
  allowedTypes: Array<string>;
  ignoreModules: Array<string>;
  outputType: 'json' | 'markdown';
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
