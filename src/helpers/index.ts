import json2md from 'json2md';

export function safeDeleteFileMarkdown(content: Array<string>) {
  const markdownContent = content.map(item => {
    return { p: `${item}` };
  });

  return json2md([{ h1: `SafeDeleteFile 扫描结果` }, { blockquote: '以下文件也许可以安全删除' }, ...markdownContent]);
}
