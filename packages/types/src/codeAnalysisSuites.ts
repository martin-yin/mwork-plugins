import { ModulesAnalysisOptions } from "./modulesAnalysisType"
import { SafeDeleteFileOptions } from "./safeDeleteFileType";

export type CodeAnalysisSuitesOptions = {
    enable: boolean;
    modulesAnalysis?: Omit<ModulesAnalysisOptions, 'enable' | 'outputType'>;
    safeDeleteFile?: Omit<SafeDeleteFileOptions, 'enable' | 'outputType'>;
}