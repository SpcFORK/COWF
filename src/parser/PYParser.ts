import { NOOP } from "cowcst";
import { PythonShell, PythonShellError } from "python-shell";

export class PYParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    ENV().py ||= PYParser.createEnvScope();
  }

  static createEnvScope(): Record<string, any> {
    return {
      scope: "py",
      value: []
    }
  }

  async parse(content: string): Promise<any> {
    try {
      const results = await this.runPythonShell(content, this.ENV());
      return results ? results.join("\n") : "";
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
