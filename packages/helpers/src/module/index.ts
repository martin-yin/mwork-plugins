import { ImportsFilesMapType, ModulesUseInfoType } from '@mwork-plugins/types';
import { getCodeByFileExt, getImportsByCode } from '@mwork-plugins/utils';
import fs from 'node:fs';
import path from 'node:path';

export function getPackageNodeModules(cwd: string, node_modules: Array<string>) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, './package.json'), {
      encoding: 'utf-8'
    })
  );

  const packageNodeModules = [
    ...(packageJson?.peerDependencies ? Object.keys(packageJson.peerDependencies) : []),
    ...(packageJson?.dependencies ? Object.keys(packageJson.dependencies) : []),
    ...(packageJson?.devDependencies ? Object.keys(packageJson.devDependencies) : []),
    ...node_modules
  ];
  return packageNodeModules;
}

export async function getImportsFilesMap(cwd: string, files: Array<string>) {
  const importsFilesMap: ImportsFilesMapType = new Map();
  const importsPromises = files.map(async file => {
    const code = getCodeByFileExt(file);
    const imports = await getImportsByCode(code);
    if (imports.length) {
      imports.forEach(importElement => {
        const { value, useType } = importElement;
        const nodeModuleFilesMapValue = importsFilesMap?.get(value) || [];
        importsFilesMap.set(value, [
          ...nodeModuleFilesMapValue,
          {
            filePath: file.replace(cwd, ''),
            useType
          }
        ]);
      });
    }
  });
  await Promise.all(importsPromises);

  return importsFilesMap;
}

export function calculateModulesUseInfo(
  filesModuleMap: ImportsFilesMapType,
  ignoreModules: Array<string>,
  nodeModules: Array<string>
): ModulesUseInfoType {
  const modulesUseInfo: ModulesUseInfoType = [];

  filesModuleMap.forEach((value, key) => {
    if (!ignoreModules.includes(key) && nodeModules.includes(key)) {
      modulesUseInfo.push({
        name: key,
        total: value.length,
        files: value
      });
    }
  });

  return modulesUseInfo;
}
