export * from './code';
import { writeFileSync } from 'fs';

// Todo: 暂时留在这里
export function writeFile(filePath: string, content: string) {
  writeFileSync(filePath, content);
}
