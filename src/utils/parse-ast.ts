const swc = require('@swc/core');

async function parseCode(code: string) {
  const { body } = await swc.parse(code, {
    syntax: 'typescript',
    comments: false,
    script: true,
    target: 'es5',
    isModule: true,
    tsx: true
  });
  return body;
}

export { parseCode };
