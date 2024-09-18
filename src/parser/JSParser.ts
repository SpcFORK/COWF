import { NOOP } from "cowcst";
import { VM } from "vm2";

export class JSParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    ENV().js ||= JSParser.createEnvScope();
  }

  static createEnvScope(): Record<string, any> {
    return {
      scope: "js",
      value: [],
    };
  }

  parse(content: string): any {
    const vm = new VM({
      sandbox: this.ENV(),
    });
    return vm.run(content);
  }
}
