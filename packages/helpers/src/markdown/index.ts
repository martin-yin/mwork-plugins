import json2md from 'json2md';
import { ModulesUseInfoType, ModulesAnalysisMarkdownContentType } from '@mwork-plugins/types';

/**
 * @desc 可以安全删除的文件
 * @param content
 * @returns
 */
export function safeDeleteFileMarkdown(content: Array<string>): string {
  const markdownContent = content.map(item => {
    return { p: `${item}` };
  });

  return json2md([{ h1: `SafeDeleteFile 扫描结果` }, { blockquote: '以下文件也许可以安全删除' }, ...markdownContent]);
}

/**
 * @desc modules 使用情况分析
 * @param content
 * @returns
 */
export function modulesAnalysisMarkdown(content: ModulesUseInfoType) {
  const markdownContent: ModulesAnalysisMarkdownContentType = [];
  markdownContent.push({ h1: `ModulesAnalysis 分析结果` });

  content.forEach(item => {
    markdownContent.push({ h2: item.name });
    markdownContent.push({ h3: `使用次数: ${item.total}` });
    item.files.forEach(({ filePath, useType }: any) => {
      markdownContent.push({ p: `文件: ${filePath}` });
      markdownContent.push({ p: `使用方式：${useType}` });
    });
  });

  return json2md(markdownContent);
}
