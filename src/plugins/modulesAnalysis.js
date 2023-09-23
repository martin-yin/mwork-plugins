const fs = require('node:fs')
const path = require('node:path')
const swc = require('@swc/core')
const vueCompiler = require('@vue/compiler-dom');
const json2md = require('json2md')

const pluginName = "ModulesAnalysis"

class ModulesAnalysis {
  constructor(options) {
    this.acceptType = options?.acceptType || ['vue', 'js', 'jsx', 'tsx', 'ts']
    this.ignoreModules = options?.ignoreModules || ['vue', 'vue-router']
    this.outputType = options?.outputType || 'json'
    this.packageNodeModules = this.getPackageNodeModules();
  }

  getImportOrRequireName(value) {
    const regexp = /\//g;
    if (!regexp.test(value)) {
      return value
    }
    return value.split('/')[0] || null
  }

  isNodeModule(value) {
    return this.packageNodeModules?.includes(value) || false
  }


  getModules(ast) {
    const modules = [];
    ast.forEach((element) => {
      let value = null
      let useType = 'import'

      if (element.type === 'ImportDeclaration') {
        value = element.source.value
      }

      if (element.type === 'VariableDeclaration') {
        const { init } = element?.declarations[0]
        if (init?.callee?.value === 'require') {
          value = init?.arguments[0]?.expression?.value
          useType = 'require'
        }
      }
      const module = this.getImportOrRequireName(value)
      module && modules.push({ useType, value: module })
    })

    return modules
  }

  getPackageNodeModules() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json'), {
      encoding: 'utf-8',
    }))

    const packageNodeModules = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies)]
    return packageNodeModules
  }

  getScriptCode(filePath) {
    const code = fs.readFileSync(filePath, {
      encoding: 'utf-8',
    });

    if (!filePath.endsWith('.vue')) {
      return code;
    }

    let scriptCode = ''
    const { children } = vueCompiler.parse(code);
    children.forEach((element) => {
      if (element?.tag === 'script') {
        scriptCode = element.children[0].content;
      }
    });
    return scriptCode
  }

  async parseCodeToAstByFilePath(filePath) {
    const code = this.getScriptCode(filePath);
    const { body } = await swc.parse(code, {
      syntax: 'typescript',
      comments: false,
      script: true,
      target: 'es5',
      isModule: true,
      tsx: true,
    });
    return body;
  }

  async getNodeModuleFilesMap(filePathList) {
    const cwd = process.cwd() + '\\';
    const nodeModuleFilesMap = new Map();
    const nodeModulePromises = filePathList.map(async (filePath) => {
      const ast = await this.parseCodeToAstByFilePath(filePath);
      const nodeModules = this.getModules(ast).filter((module) => this.isNodeModule(module.value))
      if (nodeModules.length) {
        nodeModules.forEach((module) => {
          const { value, useType } = module;
          const nodeModuleFilesMapValue = nodeModuleFilesMap?.get(value) || [];
          nodeModuleFilesMap.set(value, [...nodeModuleFilesMapValue, {
            filePath: filePath.replace(cwd, ''),
            useType
          }]);
        })
      }
    });
    await Promise.all(nodeModulePromises);
    return nodeModuleFilesMap;
  }

  calculateModuleUseInfo(filesModuleMap) {
    const moduleInfo = [];
    filesModuleMap.forEach((value, key) => {
      if (!this.ignoreModules.includes(key)) {
        moduleInfo.push({
          name: key,
          total: value.length,
          files: value
        })
      }
    })
    return moduleInfo
  }

  isAcceptFile(filePath) {
    if (filePath.includes('node_modules')) {
      return false
    }
    return this.acceptType.includes(filePath.split('.').pop())
  }

  outputTypeResult(result) {
    if (this.outputType === 'markdown') {
      this.outputResultWithMarkdown(result)
      return
    }
    this.outputResultByJson(result)
  }

  outputResultWithMarkdown(result) {
    const markdownContent = []
    result.forEach((item) => {
      markdownContent.push({ h2: item.name })
      markdownContent.push({ h3: `使用次数: ${item.total}` })
      item.files.forEach(({ filePath, useType }) => {
        markdownContent.push({ p: `文件: ${filePath}` })
        markdownContent.push({ p: `使用方式：${useType}` })
      })
    })
    fs.writeFileSync('./modulesAnalysis.md', json2md([{ h1: `${pluginName}分析结果` }, ...markdownContent]))
  }

  outputResultByJson(result) {
    fs.writeFileSync('./modulesAnalysis.json', JSON.stringify(result))
  }

  apply(compiler) {
    compiler.hooks.done.tap(pluginName, async (stats) => {
      const filesPath = [...stats.compilation.fileDependencies].filter((filePath) => this.isAcceptFile(filePath))
      const filesModuleMap = await this.getNodeModuleFilesMap(filesPath)
      const moduleUseInfo = this.calculateModuleUseInfo(filesModuleMap);
      this.outputTypeResult(moduleUseInfo)
    })
  }
}

module.exports = ModulesAnalysis
