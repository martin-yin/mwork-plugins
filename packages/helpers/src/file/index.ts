import fs from 'node:fs';
import path from 'node:path';
import Ignore from 'ignore';
import type { Ignore as IgnoreType } from 'ignore';
/**
 * @desc 判断文件是否在允许的范围内
 * @returns
 */
export function isFileInAllowedTypes(filePath: string, allowedTypes: Array<string>) {
    if (filePath.includes('node_modules')) {
        return false;
    }

    return allowedTypes.includes(filePath.split('.')?.pop() || '');
}

/**
 * @desc 初始化 Ignore
 * @param ignores
 * @returns
 */
export function initIgnoreTool(ignores: Array<string>) {
    return Ignore().add(['node_modules'].concat(ignores || []));
}

/**
 * @desc 获取当前项目下所有的文件
 * @param folderPath
 * @returns Array<string>
 */
export function getFilesInFolder(folderPath: string, ignore: IgnoreType): Array<string> {
    const files: Array<string> = [];

    function traverseDirectory(currentPath: string) {
        const items = fs.readdirSync(currentPath);
        items.forEach(item => {
            const itemPath = path.join(currentPath, item);
            const stat = fs.statSync(itemPath);
            const relativePath = path.relative(folderPath, itemPath);
            if (stat.isFile() && !ignore.ignores(relativePath)) {
                files.push(itemPath);
            } else if (stat.isDirectory() && !ignore.ignores(relativePath)) {
                traverseDirectory(itemPath);
            }
        });
    }

    traverseDirectory(folderPath);
    return files;
}

/**
 * @decs 获取数组的差集
 * @param files 
 * @param fileDependencies 
 * @returns 
 */
export function getNonDependentFiles(files: Array<string>, fileDependencies: Array<string>) {
    const differenceFiles = files.filter(item => !fileDependencies.includes(item));
    return differenceFiles;
}
