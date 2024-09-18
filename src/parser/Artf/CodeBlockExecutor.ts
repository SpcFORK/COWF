import { Options, PythonShell } from "python-shell";

import * as vm from "vm";
import * as bvm from "vm-browserify";

import { SubroutineManager } from "./SubroutineManager";
import { ExecutableBlock, StackItem, Block } from "./types";

export class CodeBlockExecutor {
  private executableBlocks: ExecutableBlock[] = [];

  private langIsPY(block: ExecutableBlock) {
    return block.language.trim().toLowerCase() === "python";
  }

  private langIsJS(block: ExecutableBlock) {
    return block.language.trim().toLowerCase() === "javascript";
  }

  constructor(
    public isGlobal = false,
    private subroutineManager: SubroutineManager = new SubroutineManager(),
  ) {}

  createPythonBoilerplate(code: string): string {
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

  createJSBoilerplate(code: string): string {
    return `(async () => { ${code} })()`.trim();
  }

  addExecutableBlock(block: ExecutableBlock): void {
    this.executableBlocks.push(block);
  }

  async executeCodeBlocks(
    blocks: ExecutableBlock[],
    variables: Record<string, any>,
    stack: StackItem[],
  ): Promise<StackItem[]> {
    for (const block of blocks) {
      let blockRes = SubroutineManager.createCodeBlock("");
      let error: unknown;
      try {
        const result = await this.executeBlock(block, variables);
        blockRes.value = `${block.language}: ${JSON.stringify(result)}`;
      } catch (e) {
        error = e;
      }

      stack.push(blockRes);
      if (error) return Promise.reject(error);
    }

    return stack;
  }

  private async executeBlock(
    block: ExecutableBlock,
    variables: Record<string, any>,
  ): Promise<any> {
    let isJS = this.langIsJS(block);
    if (isJS) {
      const jsCode = this.removeArtfSyntax(block.code);
      const executionResult = await this.executeJavaScriptCode(
        jsCode,
        variables,
        block.args,
      );
      return executionResult;
    }

    let isPY = this.langIsPY(block);
    if (isPY) {
      const pythonCode = this.removeArtfSyntax(block.code);
      const executionResult = await this.executePythonCode(
        pythonCode,
        variables,
        block.args,
      );
      return executionResult;
    }

    throw new Error(`Unsupported language: ${block.language}`);
  }

  private removeArtfSyntax(code: string): string {
    return code
      .split("\n")
      .filter((line) => !line.trim().match(/^[=:!]/))
      .join("\n");
  }

  async executeJavaScriptCode(
    code: string,
    context: Record<string, any>,
    args?: string,
  ): Promise<any> {
    const sandbox: Record<string, any> = this.makeJSEnv(context);

    if (args) {
      const argNames = args.split(",").map((arg) => arg.trim());
      argNames.forEach((argName) => {
        if (!(argName in sandbox)) sandbox[argName] = undefined;
      });
    }

    const doVMParse = (
      vm: typeof import("vm") | typeof import("vm-browserify"),
    ) => {
      const script = new vm.Script(this.createJSBoilerplate(code));
      return script.runInContext(vm.createContext(sandbox));
    };

    try {
      return doVMParse(vm);
    } catch {
      return doVMParse(bvm);
    }
  }

  private makeJSEnv(context: Record<string, any>): Record<string, any> {
    return Object.assign(
      this.isGlobal ? globalThis : {},
      {
        console: console,
      },
      context,
    );
  }

  private makePYEnv(args: string | undefined, variables: Record<string, any>) {
    const parsedArgs = args ? args.split(",").map((arg) => arg.trim()) : [];

    const options: Options = {
      mode: "text",
      pythonOptions: ["-u"],
      args: [JSON.stringify(variables)].concat(parsedArgs),
    };
    return options;
  }

  private pyReadyEnvPromise(
    err: Error | null,
    reject: (reason?: any) => void,
    results: string[] | undefined,
    resolve: (value: unknown) => void,
  ) {
    if (err) {
      return reject(err);
    }

    const lastResult = results ? results[results.length - 1] : "";
    try {
      const parsedResult = JSON.parse(lastResult);
      let result = String(
        parsedResult.result !== null
          ? parsedResult.result
          : parsedResult.output,
      );

      // Parse the result as number, if it is a numeric string
      if (!isNaN(result as any)) result = parseFloat(result) as any;

      resolve(result);
    } catch (parseError) {
      reject(new Error(`Failed to parse Python output: ${lastResult}`));
    }
  }

  async executePythonCode(
    code: string,
    variables: Record<string, any>,
    args?: string,
  ): Promise<any> {
    const options: Options = this.makePYEnv(args, variables);

    const pythonCode = this.createPythonBoilerplate(code);

    return new Promise((resolve, reject) => {
      PythonShell.runString(
        pythonCode,
        options,
        (err: Error | null, results?: string[]) =>
          this.pyReadyEnvPromise(err, reject, results, resolve),
      );
    });
  }

  getExecutableBlocks(): ExecutableBlock[] {
    return this.executableBlocks;
  }
}
