import { Compiler } from 'webpack';

export namespace SafeDeleteFileType {
  export abstract class ISafeDeleteFile {
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
    apply(compiler: Compiler): void {}
  }
  export type options = {
    folderPath: string;
    ignore: string;
    outputType: string;
    allFolderFiles: Array<string>;
  };
}

export namespace ModulesAnalysisType {
  export abstract class IModulesAnalysis {
    abstract isAcceptFile(file: string): boolean;

    abstract getImportsFilesMap(files: Array<string>): any;

    abstract calculateModuleUseInfo(filesModuleMap: Map<any, any>): Array<{
      name: string;
      total: number;
      files: Array<string>;
    }>;

    abstract outPutFile(content: Array<string>): void;

    apply(compiler: Compiler): void {}
  }
  export type options = {
    acceptType: Array<string>;
    ignoreModules: Array<string>;
    outputType: 'json' | 'markdown';
    allFolderFiles: Array<string>;
  };
}
