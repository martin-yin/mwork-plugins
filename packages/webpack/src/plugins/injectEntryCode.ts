import type { Compiler } from "webpack";

const pluginName = 'InjectEntryCode';

class InjectEntryCode {
    private enable: boolean = false;
    private injectCode = '';

    constructor(options: {
        enable: boolean
        injectCode: string
    }) {
        this.enable = options.enable;
        this.injectCode = options.injectCode;
    }

    apply(compiler: Compiler) {
        if (!this.enable && !this.injectCode.length) {
            return;
        }

        let entrys = Object.keys(compiler.options.entry);
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            compilation.hooks.optimizeChunkAssets.tap(pluginName, (chunks) => {
                chunks.forEach((chunk) => {
                    if (entrys.includes(chunk.id as string)) {
                        chunk.files.forEach((file) => {
                            let originalCode = compilation.assets[file].source();

                            let modifiedCode = originalCode + '\n' + this.injectCode;
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

export default InjectEntryCode