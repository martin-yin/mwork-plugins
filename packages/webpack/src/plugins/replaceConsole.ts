import type { Compiler } from "webpack";

const pluginName = 'ReplaceConsole';

class ReplaceConsole {
    private enable: boolean = false;
    constructor(options: {
        enable: boolean
    }) {
        this.enable = options.enable;
    }

    apply(compiler: Compiler) {
        if (!this.enable) {
            return;
        }

        let entrys = Object.keys(compiler.options.entry);
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            compilation.hooks.optimizeChunkAssets.tap(pluginName, (chunks) => {
                chunks.forEach((chunk) => {
                    if (entrys.includes(chunk.id as string)) {
                        chunk.files.forEach((file) => {
                            let originalCode = compilation.assets[file].source();
                            let injectedCode = `
                                window.mconsole = { ...console }
                                const type = ['log', 'info', 'error', 'warn']
                                type.forEach((item) => {
                                    window.console[item] = (...args) => { }
                                })
                            `;
                            let modifiedCode = originalCode + '\n' + injectedCode;
                            compilation.assets[file] = {
                                source: () => modifiedCode,
                                size: () => modifiedCode.length
                            } as any;
                        });
                    }
                });
            });
        });
    }
}

export default ReplaceConsole