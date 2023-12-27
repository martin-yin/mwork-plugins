import { CodeAnalysisSuitesOptions } from '@mwork-plugins/types/src/codeAnalysisSuites';
import type { Compiler } from 'webpack';

const pluginName = 'CodeAnalysisSuites';
/**
 * @desc 代码分析套件，构建结果将以 html 文件展示。
 * 功能均为配置项，当使用该插件的时候，功能4默认使用。
 * 当功能1不开启的时候 功能4中的  “未参与文件数量” 则不展示。
 * 其余功能根据options参数决定是否开启。
 * @todo
 * 等待实现功能：
 * 1. 构建信息展示（放到页面最顶部展示）：1.构建耗时 2.构建的总体积 3. 构建总参与文件数量 4. 未参与文件数量（如果开启未使用文件插件的话） 5. 资源数量
 * ===== 可复用已有代码 =====
 * 2. 未使用文件
 * 3. node_module 使用方式
 * ===== 可复用已有代码 =====
 * 4. vue 文件中 emit 的名称与文件位置（针对做统一 emit 使用）
 */
import path from 'node:path';
import {
    calculateModulesUseInfo,
    getFilesInFolder,
    getImportsFilesMap,
    getNonDependentFiles,
    getPackageNodeModules,
    initIgnoreTool,
    isFileInAllowedTypes
} from '@mwork-plugins/helpers';

class CodeAnalysisSuites {
    private modulesAnalysiOptions;
    private safeDeleteFileOptions;

    constructor(options: CodeAnalysisSuitesOptions) {
        // 初始化参数
        this.modulesAnalysiOptions = {
            allowedTypes: options?.modulesAnalysis?.allowedTypes || ['vue', 'js', 'jsx', 'tsx', 'ts'],
            ignoreModules: options?.modulesAnalysis?.ignoreModules || ['vue', 'vue-router'],
            extraModules: options?.modulesAnalysis?.extraModules || []
        };
        this.safeDeleteFileOptions = {
            folderPath: options?.safeDeleteFile?.folderPath || path.join(process.cwd(), '/src'),
            ignore: options?.safeDeleteFile?.ignore || []
        };
    }

    getSafeDeleteFileAnalysis(fileDependencies: Array<string>) {
        const { folderPath, ignore } = this.safeDeleteFileOptions;
        const ignoreTool = initIgnoreTool(ignore);
        const files = getFilesInFolder(folderPath, ignoreTool);
        return getNonDependentFiles(files, fileDependencies);
    }

    async getModulesAnalysis(fileDependencies: Array<string>) {
        const { allowedTypes, ignoreModules, extraModules } = this.modulesAnalysiOptions;
        const filesPath = fileDependencies.filter(filePath => isFileInAllowedTypes(filePath, allowedTypes));
        const filesModuleMap = await getImportsFilesMap(process.cwd(), filesPath);
        const nodeModules = getPackageNodeModules(process.cwd(), extraModules);
        const modulesUseInfo = calculateModulesUseInfo(filesModuleMap, ignoreModules, nodeModules);
        return modulesUseInfo;
    }

    apply(compiler: Compiler) {
        compiler.hooks.done.tap(pluginName, stats => {
            const safeDeleteFileAnalysis = this.getSafeDeleteFileAnalysis([...stats.compilation.fileDependencies]);
            const modulesAnalysis = this.getModulesAnalysis([...stats.compilation.fileDependencies]);
        });
    }
}

export default CodeAnalysisSuites;
