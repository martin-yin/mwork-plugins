'use strict';

var fs2 = require('fs');
var path = require('path');
var core = require('@swc/core');
var json2md = require('json2md');
var Ignore = require('ignore');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var fs2__default = /*#__PURE__*/_interopDefault(fs2);
var path__default = /*#__PURE__*/_interopDefault(path);
var json2md__default = /*#__PURE__*/_interopDefault(json2md);
var Ignore__default = /*#__PURE__*/_interopDefault(Ignore);

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var vueCompiler = __require("@vue/compiler-dom");
function getScriptCode(path3) {
  const code = fs2__default.default.readFileSync(path3, {
    encoding: "utf-8"
  });
  return code;
}
function getVueScriptCode(path3) {
  const code = getScriptCode(path3);
  let scriptCode = "";
  if (!code) {
    return scriptCode;
  }
  const { children } = vueCompiler.parse(code);
  children.forEach((element) => {
    if (element?.tag === "script") {
      scriptCode = element.children[0].content;
    }
  });
  return scriptCode;
}
var codeMethods = {
  vue: getVueScriptCode,
  js: getScriptCode,
  jsx: getScriptCode,
  ts: getScriptCode,
  tsx: getScriptCode,
  unknow: () => ""
};
var codeMethodsProxy = new Proxy(codeMethods, {
  get: function(target, property) {
    if (property in target) {
      return target[property];
    }
    return target["unknow"];
  }
});
function getCodeByFilePath(filePath) {
  const extensions = filePath.split(".").pop();
  return codeMethodsProxy[extensions](filePath);
}
async function parseCode(code) {
  const { body } = await core.parse(code);
  return body;
}
function getImport(element) {
  if (element.type === "ImportDeclaration") {
    return {
      value: element.source.value,
      useType: "import"
    };
  }
  if (element.type === "VariableDeclaration") {
    const { init } = element?.declarations[0];
    if (init?.type === "CallExpression" && init?.callee.type === "Identifier" && init.arguments[0]?.expression.type === "StringLiteral") {
      return {
        value: init?.arguments[0]?.expression?.value,
        useType: "require"
      };
    }
  }
  return null;
}
async function getImportsByCode(code) {
  const imports = [];
  const ast = await parseCode(code);
  ast.forEach((element) => {
    let value = getImport(element);
    if (value) {
      imports.push({ ...value });
    }
  });
  return imports;
}
function writeFile(filePath, content) {
  fs2.writeFileSync(filePath, content);
}
function safeDeleteFileMarkdown(content) {
  const markdownContent = content.map((item) => {
    return { p: `${item}` };
  });
  return json2md__default.default([{ h1: `SafeDeleteFile \u626B\u63CF\u7ED3\u679C` }, { blockquote: "\u4EE5\u4E0B\u6587\u4EF6\u4E5F\u8BB8\u53EF\u4EE5\u5B89\u5168\u5220\u9664" }, ...markdownContent]);
}
function modulesAnalysisMarkdown(content) {
  const markdownContent = [];
  markdownContent.push({ h1: `ModulesAnalysis \u5206\u6790\u7ED3\u679C` });
  content.forEach((item) => {
    markdownContent.push({ h2: item.name });
    markdownContent.push({ h3: `\u4F7F\u7528\u6B21\u6570: ${item.total}` });
    item.files.forEach(({ filePath, useType }) => {
      markdownContent.push({ p: `\u6587\u4EF6: ${filePath}` });
      markdownContent.push({ p: `\u4F7F\u7528\u65B9\u5F0F\uFF1A${useType}` });
    });
  });
  return json2md__default.default(markdownContent);
}
var pluginName = "SafeDeleteFile";
var SafeDeleteFile = class {
  folderPath;
  ignore;
  outputType;
  files;
  cwd;
  constructor(options) {
    this.cwd = process.cwd();
    this.folderPath = options?.folderPath || path__default.default.join(process.cwd(), "/src");
    this.ignore = Ignore__default.default().add(["node_modules", ".git"].concat(options?.ignore || []));
    this.outputType = options?.outputType || "json";
    this.files = this.getFilesByFolder(this.folderPath);
  }
  /**
   * @desc 获取文件
   * @param folderPath
   * @returns Array<string>
   */
  getFilesByFolder(folderPath) {
    const files = [];
    const { ignore } = this;
    function traverseDirectory(currentPath) {
      const items = fs2__default.default.readdirSync(currentPath);
      items.forEach((item) => {
        const itemPath = path__default.default.join(currentPath, item);
        const stat = fs2__default.default.statSync(itemPath);
        const relativePath = path__default.default.relative(folderPath, itemPath);
        if (stat.isFile()) {
          !ignore.ignores(relativePath) && files.push(itemPath);
        } else if (stat.isDirectory() && !ignore.ignores(relativePath)) {
          traverseDirectory(itemPath);
        }
      });
    }
    traverseDirectory(folderPath);
    return files;
  }
  /**
   * @desc
   * @param fileDependencies
   * @returns Array<string>
   */
  getDifferenceFiles(fileDependencies) {
    const differenceFiles = this.files.filter((item) => !fileDependencies.includes(item)).map((filePath) => filePath.replace(this.cwd, ""));
    return differenceFiles;
  }
  /**
   * @desc 输出文件
   * @param content
   */
  outPutFile(content) {
    if (this.outputType === "markdown") {
      writeFile(`./${pluginName}.md`, safeDeleteFileMarkdown(content));
      return;
    }
    writeFile(`./${pluginName}.json`, JSON.stringify(content));
  }
  apply(compiler) {
    compiler.hooks.done.tap(pluginName, (stats) => {
      const result = this.getDifferenceFiles([...stats.compilation.fileDependencies]);
      this.outPutFile(result);
    });
  }
};
var safeDeleteFile_default = SafeDeleteFile;
var pluginName2 = "ModulesAnalysis";
var ModulesAnalysis = class {
  cwd = process.cwd();
  acceptType = [];
  ignoreModules = [];
  packageNodeModules = [];
  outputType;
  constructor(options) {
    this.acceptType = options?.acceptType || ["vue", "js", "jsx", "tsx", "ts"];
    this.ignoreModules = options?.ignoreModules || ["vue", "vue-router"];
    this.outputType = options?.outputType || "json";
    this.packageNodeModules = this.getPackageNodeModules();
  }
  getPackageNodeModules() {
    const packageJson = JSON.parse(
      fs2__default.default.readFileSync(path__default.default.join(process.cwd(), "./package.json"), {
        encoding: "utf-8"
      })
    );
    const packageNodeModules = [
      ...packageJson?.peerDependencies ? Object.keys(packageJson.peerDependencies) : [],
      ...packageJson?.dependencies ? Object.keys(packageJson.dependencies) : [],
      ...packageJson?.devDependencies ? Object.keys(packageJson.devDependencies) : []
    ];
    return packageNodeModules;
  }
  calculateModulesUseInfo(filesModuleMap) {
    const modulesUseInfo = [];
    filesModuleMap.forEach((value, key) => {
      if (!this.ignoreModules.includes(key) && this.packageNodeModules.includes(key)) {
        modulesUseInfo.push({
          name: key,
          total: value.length,
          files: value
        });
      }
    });
    return modulesUseInfo;
  }
  isAcceptFile(file) {
    if (file.includes("node_modules")) {
      return false;
    }
    return this.acceptType.includes(file.split(".")?.pop() || "");
  }
  async getImportsFilesMap(files) {
    const importsFilesMap = /* @__PURE__ */ new Map();
    const importsPromises = files.map(async (file) => {
      const code = getCodeByFilePath(file);
      const imports = await getImportsByCode(code);
      if (imports.length) {
        imports.forEach((importElement) => {
          const { value, useType } = importElement;
          const nodeModuleFilesMapValue = importsFilesMap?.get(value) || [];
          importsFilesMap.set(value, [
            ...nodeModuleFilesMapValue,
            {
              filePath: file.replace(this.cwd, ""),
              useType
            }
          ]);
        });
      }
    });
    await Promise.all(importsPromises);
    return importsFilesMap;
  }
  outPutFile(content) {
    if (this.outputType === "markdown") {
      writeFile(`./${pluginName2}.md`, modulesAnalysisMarkdown(content));
      return;
    }
    writeFile(`./${pluginName2}.json`, JSON.stringify(content));
  }
  apply(compiler) {
    compiler.hooks.done.tap(pluginName2, async (stats) => {
      const filesPath = [...stats.compilation.fileDependencies].filter((filePath) => this.isAcceptFile(filePath));
      const filesModuleMap = await this.getImportsFilesMap(filesPath);
      const modulesUseInfo = this.calculateModulesUseInfo(filesModuleMap);
      this.outPutFile(modulesUseInfo);
    });
  }
};
var modulesAnalysis_default = ModulesAnalysis;

exports.ModulesAnalysis = modulesAnalysis_default;
exports.SafeDeleteFile = safeDeleteFile_default;
