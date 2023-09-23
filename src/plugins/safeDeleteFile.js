const fs = require('node:fs')
const path = require('node:path')
const ignorejs = require('ignore')
const json2md = require('json2md')

const pluginName = 'SafeDeleteFile'

class SafeDeleteFile {
    constructor(options = null) {
        this.folderPath = options?.folderPath || path.join(process.cwd(), '/src')
        this.ignore = ignorejs().add(['node_modules', '.git'].concat(options?.ignore || []))
        this.outputType = options?.outputType || 'json'
        this.allFolderFiles = this.getAllFilesInFolder(this.folderPath)
    }

    getAllFilesInFolder(folderPath) {
        const files = []
        const { ignore } = this
        function traverseDirectory(currentPath) {
            const items = fs.readdirSync(currentPath)
            items.forEach((item) => {
                const itemPath = path.join(currentPath, item)
                const stat = fs.statSync(itemPath)
                const relativePath = path.relative(folderPath, itemPath)
                if (stat.isFile()) {
                    !ignore.ignores(relativePath) && files.push(itemPath)
                } else if (stat.isDirectory() && !ignore.ignores(relativePath)) {
                    traverseDirectory(itemPath)
                }
            })
        }
        traverseDirectory(folderPath)
        return files
    }


    getFilesDifference(allFolderFiles, afterCompileFiles) {
        const cwd = process.cwd() + '\\';
        const differenceFiles = allFolderFiles.filter((item) => !afterCompileFiles.includes(item)).map((filePath) => filePath.replace(cwd, ''))
        return differenceFiles
    }

    outputTypeResult(result) {
        if (this.outputType === 'markdown') {
            this.outputResultWithMarkdown(result)
            return
        }
        this.outputResultWithJson(result)
    }

    outputResultWithJson(result) {
        fs.writeFileSync('./safeDeleteFile.json', JSON.stringify(result))
    }

    outputResultWithMarkdown(result) {
        const markdownContent = result.map((item) => {
            return { p: `${item}` }
        })
        fs.writeFileSync('./safeDeleteFile.md', json2md([{ h1: `${pluginName}扫描结果` }, { blockquote: "以下文件也许可以安全删除" }, ...markdownContent]))
    }

    apply(compiler) {
        compiler.hooks.done.tap(pluginName, (stats) => {
            const safeDeleteFile = this.getFilesDifference(this.allFolderFiles, [...stats.compilation.fileDependencies])
            this.outputTypeResult(safeDeleteFile)
        })
    }
}

module.exports = SafeDeleteFile
