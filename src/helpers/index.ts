import json2md from 'json2md';

export function safeDeleteFileMarkdown(content: Array<string>) {
  const markdownContent = content.map(item => {
    return { p: `${item}` };
  });

  return json2md([{ h1: `SafeDeleteFile 扫描结果` }, { blockquote: '以下文件也许可以安全删除' }, ...markdownContent]);
}

export function modulesAnalysisMarkdown(content: any) {
  const markdownContent: any = [];

  content.forEach((item: any) => {
    markdownContent.push({ h2: item.name });
    markdownContent.push({ h3: `使用次数: ${item.total}` });
    item.files.forEach(({ filePath, useType }: any) => {
      markdownContent.push({ p: `文件: ${filePath}` });
      markdownContent.push({ p: `使用方式：${useType}` });
    });
  });

  return json2md([{ h1: `ModulesAnalysis 分析结果` }, ...markdownContent]);
}
