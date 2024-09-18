import { NOOP } from "cowcst";
import { PythonShell, PythonShellError } from "python-shell";
import { COWFParseResult, COWFEnvScope } from "../types/COWFTypes";

export type PYParserResult = COWFParseResult<Promise<string>>;
export type PYParserEnv = COWFEnvScope<PYParserResult[]>;

export class PYParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.setupScope();
  }

  static ext = "pyf"
  static createEnvScope(): PYParserEnv {
    return {
      scope: this.ext,
      value: [],
    };
  }

  setupScope(): PYParserEnv {
    return (this.ENV().py ||= PYParser.createEnvScope());
  }

  pushToScope(content: PYParserResult): PYParserResult {
    this.setupScope().value.push(content);
    return content;
  }

  parse(content: string): PYParserResult {
    try {
      const results = this.runPythonShell(content, this.ENV());
      return this.pushToScope({
        format: "result",
        content: results.then((t) => (t ? t.join("\n") : "")),
      });
    } catch (err) {
      throw err;
    }
  }

  private runPythonShell(
    content: string,
    env: ReturnType<typeof this.ENV>,
  ): Promise<string[]> {
    return new Promise((resolve, reject) =>
      PythonShell.runString(content, { env }, (err, results) =>
        this.handleEnv(err, reject, resolve, results),
      ),
    );
  }

  private handleEnv(
    err: PythonShellError,
    reject: (reason?: any) => void,
    resolve: (value: string[] | PromiseLike<string[]>) => void,
    results: any[] | undefined,
  ) {
    if (err) reject(err);
    else resolve(results || []);
  }
}
