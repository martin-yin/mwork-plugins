const pluginName = 'SafeDeleteFile'

const fs = require('node:fs')
const path = require('node:path')
const ignorejs = require('ignore')

class SafeDeleteFile {
    constructor(options = null) {
        this.folderPath = options?.folderPath || path.join(process.cwd(), '/src')
        this.ignore = ignorejs().add(['node_modules', '.git'].concat(options?.ignore || []))
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
        const differenceFiles = allFolderFiles.filter((item) => !afterCompileFiles.includes(item))
        return differenceFiles
    }

    apply(compiler) {
        compiler.hooks.done.tap(pluginName, (stats) => {
            const safeDeleteFile = this.getFilesDifference(this.allFolderFiles, [...stats.compilation.fileDependencies])
            fs.writeFileSync('./safeDeleteFile.json', JSON.stringify(safeDeleteFile))
        })
    }
}

module.exports = SafeDeleteFile
