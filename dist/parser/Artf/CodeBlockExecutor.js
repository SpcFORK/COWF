"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeBlockExecutor = void 0;
const python_shell_1 = require("python-shell");
const vm2_1 = require("vm2");
const SubroutineManager_1 = require("./SubroutineManager");
class CodeBlockExecutor {
    constructor(isGlobal = false, subroutineManager = new SubroutineManager_1.SubroutineManager()) {
        this.isGlobal = isGlobal;
        this.subroutineManager = subroutineManager;
        this.executableBlocks = [];
    }
    langIsPY(block) {
        return block.language.trim().toLowerCase() === "python";
    }
    langIsJS(block) {
        return block.language.trim().toLowerCase() === "javascript";
    }
    createPythonBoilerplate(code) {
        return `
import sys
import json
import builtins

variables = json.loads(sys.argv[1])
globals().update(variables)

for name in dir(builtins):
    globals()[name] = getattr(builtins, name)

result = None
output = ""

def custom_print(*args, **kwargs):
    global output
    output += " ".join(map(str, args)) + "\\n"

print_original = print
print = custom_print

exec('''
${code}
''')

print_original(json.dumps({"result": result, "output": output.strip()}))
    `.trim();
    }
    createJSBoilerplate(code) {
        return `(async () => { ${code} })()`.trim();
    }
    addExecutableBlock(block) {
        this.executableBlocks.push(block);
    }
    async executeCodeBlocks(blocks, variables, stack) {
        for (const block of blocks) {
            let blockRes = SubroutineManager_1.SubroutineManager.createCodeBlock("");
            let error;
            try {
                const result = await this.executeBlock(block, variables);
                blockRes.value = `${block.language}: ${JSON.stringify(result)}`;
            }
            catch (e) {
                error = e;
            }
            stack.push(blockRes);
            if (error)
                return Promise.reject(error);
        }
        return stack;
    }
    async executeBlock(block, variables) {
        let isJS = this.langIsJS(block);
        if (isJS) {
            const jsCode = this.removeArtfSyntax(block.code);
            const executionResult = await this.executeJavaScriptCode(jsCode, variables, block.args);
            return executionResult;
        }
        let isPY = this.langIsPY(block);
        if (isPY) {
            const pythonCode = this.removeArtfSyntax(block.code);
            const executionResult = await this.executePythonCode(pythonCode, variables, block.args);
            return executionResult;
        }
        throw new Error(`Unsupported language: ${block.language}`);
    }
    removeArtfSyntax(code) {
        return code
            .split("\n")
            .filter((line) => !line.trim().match(/^[=:!]/))
            .join("\n");
    }
    async executeJavaScriptCode(code, context, args) {
        const sandbox = this.makeJSEnv(context);
        if (args) {
            const argNames = args.split(",").map((arg) => arg.trim());
            argNames.forEach((argName) => {
                if (!(argName in sandbox))
                    sandbox[argName] = undefined;
            });
        }
        const vm = new vm2_1.VM({ sandbox });
        return vm.run(this.createJSBoilerplate(code));
    }
    makeJSEnv(context) {
        return Object.assign(this.isGlobal ? globalThis : {}, {
            console: console,
        }, context);
    }
    makePYEnv(args, variables) {
        const parsedArgs = args ? args.split(",").map((arg) => arg.trim()) : [];
        const options = {
            mode: "text",
            pythonOptions: ["-u"],
            args: [JSON.stringify(variables)].concat(parsedArgs),
        };
        return options;
    }
    pyReadyEnvPromise(err, reject, results, resolve) {
        if (err) {
            return reject(err);
        }
        const lastResult = results ? results[results.length - 1] : "";
        try {
            const parsedResult = JSON.parse(lastResult);
            let result = String(parsedResult.result !== null
                ? parsedResult.result
                : parsedResult.output);
            // Parse the result as number, if it is a numeric string
            if (!isNaN(result))
                result = parseFloat(result);
            resolve(result);
        }
        catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${lastResult}`));
        }
    }
    async executePythonCode(code, variables, args) {
        const options = this.makePYEnv(args, variables);
        const pythonCode = this.createPythonBoilerplate(code);
        return new Promise((resolve, reject) => {
            python_shell_1.PythonShell.runString(pythonCode, options, (err, results) => this.pyReadyEnvPromise(err, reject, results, resolve));
        });
    }
    getExecutableBlocks() {
        return this.executableBlocks;
    }
}
exports.CodeBlockExecutor = CodeBlockExecutor;
