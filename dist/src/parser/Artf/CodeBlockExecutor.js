import { VM } from "vm2";
import { PythonShell } from "python-shell";
export class CodeBlockExecutor {
    constructor() {
        this.executableBlocks = [];
    }
    addExecutableBlock(block) {
        this.executableBlocks.push(block);
    }
    async executeCodeBlocks(blocks, variables) {
        let stack = [];
        for (const block of blocks) {
            try {
                if (block.language.toLowerCase() === "javascript") {
                    const jsCode = this.removeArtfSyntax(block.code);
                    const executionResult = await this.executeJavaScriptCode(jsCode, variables);
                    stack.push({
                        type: "code_block",
                        value: `JavaScript: ${JSON.stringify(executionResult)}`,
                    });
                }
                else if (block.language.toLowerCase() === "python") {
                    const pythonCode = this.removeArtfSyntax(block.code);
                    const executionResult = await this.executePythonCode(pythonCode, variables);
                    stack.push({
                        type: "code_block",
                        value: `Python: ${executionResult.trim()}`,
                    });
                }
                else {
                    throw new Error(`Unsupported language: ${block.language}`);
                }
            }
            catch (error) {
                console.error(`Error executing ${block.language} code:`, error);
                stack.push({
                    type: "code_block",
                    value: `${block.language} execution error: ${error.message}`,
                });
            }
        }
        return stack;
    }
    removeArtfSyntax(code) {
        return code
            .split("\n")
            .filter((line) => !line.trim().match(/^[=:!]/))
            .join("\n");
    }
    async executeJavaScriptCode(code, context) {
        const vm = new VM({
            sandbox: {
                ...context,
                console: console,
            },
        });
        return vm.run(`(() => { ${code} })()`);
    }
    async executePythonCode(code, variables) {
        const options = {
            mode: "text",
            pythonOptions: ["-u"],
            args: [JSON.stringify(variables)],
        };
        const pythonCode = `
import sys
import json
import builtins

variables = json.loads(sys.argv[1])
globals().update(variables)

for name in dir(builtins):
    globals()[name] = getattr(builtins, name)

exec('''
${code}
''')
    `;
        return new Promise((resolve, reject) => {
            PythonShell.runString(pythonCode, options, (err, results) => {
                if (err)
                    reject(err);
                else
                    resolve(results ? results.join("\n") : "");
            });
        });
    }
    getExecutableBlocks() {
        return this.executableBlocks;
    }
}
