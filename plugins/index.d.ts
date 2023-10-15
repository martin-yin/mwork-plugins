import { Compiler } from 'webpack';

declare abstract class ISafeDeleteFile {
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
    apply(compiler: Compiler): void;
}
type SafeDeleteFileOptions = {
    folderPath: string;
    ignore: string;
    outputType: string;
    allFolderFiles: Array<string>;
};

declare abstract class IModulesAnalysis {
    /**
     * @desc 获取 package.json 中的包。
     */
    abstract getPackageNodeModules(): Array<string>;
    /**
     * @desc 用于判断哪些文件可以被解析。
     * @param file
     */
    abstract isAcceptFile(file: string): boolean;
    /**
     * @desc 获取文件中 import 与 require 引入的包 组件等……
     * @param files
     */
    abstract getImportsFilesMap(files: Array<string>): any;
    /**
     * @desc 计算 node 包使用的情况
     * @param filesModuleMap
     */
    abstract calculateModulesUseInfo(filesModuleMap: ImportsFilesMapType): ModulesUseInfoType;
    /**
     * @desc 输出结果，输出方式根据 outputType 配置决定。
     * @param content
     */
    abstract outPutFile(content: ModulesUseInfoType): void;
    /**
     * @desc webpack apply
     * @param compiler
     */
    apply(compiler: Compiler): void;
}
/**
 * @desc 初始化参数
 */
type ModulesAnalysisOptions = {
    acceptType: Array<string>;
    ignoreModules: Array<string>;
    outputType: 'json' | 'markdown';
    allFolderFiles: Array<string>;
};
type ImportsFilesMapType = Map<string, Array<{
    filePath: string;
    useType: string;
}>>;
type ModuleUseInfoType = {
    name: string;
    total: number;
    files: Array<{
        filePath: string;
        useType: string;
    }>;
};
type ModulesUseInfoType = Array<ModuleUseInfoType>;

declare class SafeDeleteFile implements ISafeDeleteFile {
    folderPath: string;
    ignore: any;
    outputType: string;
    files: Array<string>;
    cwd: string;
    constructor(options: SafeDeleteFileOptions);
    /**
     * @desc 获取文件
     * @param folderPath
     * @returns Array<string>
     */
    getFilesByFolder(folderPath: string): string[];
    /**
     * @desc
     * @param fileDependencies
     * @returns Array<string>
     */
    getDifferenceFiles(fileDependencies: Array<string>): string[];
    /**
     * @desc 输出文件
     * @param content
     */
    outPutFile(content: Array<string>): void;
    apply(compiler: Compiler): void;
}

declare class ModulesAnalysis implements IModulesAnalysis {
    private cwd;
    private acceptType;
    private ignoreModules;
    private packageNodeModules;
    private outputType;
    constructor(options: ModulesAnalysisOptions);
    getPackageNodeModules(): string[];
    calculateModulesUseInfo(filesModuleMap: ImportsFilesMapType): ModulesUseInfoType;
    isAcceptFile(file: string): boolean;
    getImportsFilesMap(files: Array<string>): Promise<ImportsFilesMapType>;
    outPutFile(content: ModulesUseInfoType): void;
    apply(compiler: Compiler): void;
}

export { ModulesAnalysis, SafeDeleteFile };
