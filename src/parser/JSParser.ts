import * as vm from "vm";
import * as bvm from "vm-browserify";

import { NOOP } from "cowcst";
import { COWFParseResult, COWFEnvScope } from "../types/COWFTypes";

export type JSParserResult = COWFParseResult<string>;
export type JSParserEnv = COWFEnvScope<JSParserResult[]>;

export class JSParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.setupScope();
  }

  static ext = "jsf";
  static createEnvScope(): JSParserEnv {
    return {
      scope: this.ext,
      value: [],
    };
  }

  setupScope(): JSParserEnv {
    return (this.ENV().js ||= JSParser.createEnvScope());
  }

  pushToScope(content: JSParserResult): JSParserResult {
    this.setupScope().value.push(content);
    return content;
  }

  parse(content: string): JSParserResult {
    const doVMParse = (
      vm: typeof import("vm") | typeof import("vm-browserify"),
    ) => {
      const scriptRes = new vm.Script(content).runInContext(
        vm.createContext(this.makeSandbox()),
      );
      return this.pushToScope({
        format: "result",
        content: scriptRes || this.setupScope(),
      });
    };

    try {
      return doVMParse(vm);
    } catch {
      return doVMParse(bvm);
    }
  }

  pushVar(v: any) {
    this.setupScope().value.push({
      format: "variable",
      content: v,
    });
  }

  makeSandbox() {
    return {
      COWF_env: this.ENV.bind(this),
      COWF_JS_env: this.setupScope.bind(this),
      pushToScope: this.pushToScope.bind(this),
      pushVar: this.pushVar.bind(this),
    };
  }
}
