import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";
import { NOOP } from "cowcst";

export type CtxtParserResult = COWFParseResult<string>;
export type CtxtParserEnv = COWFEnvScope<CtxtParserResult[]>;

export class CtxtParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.setupScope();
  }

  static ext = "ctxt";
  static createEnvScope(): CtxtParserEnv {
    return {
      scope: this.ext,
      value: [],
    };
  }

  setupScope(): CtxtParserEnv {
    return (this.ENV().ctxt ||= CtxtParser.createEnvScope());
  }

  pushToScope(content: CtxtParserResult): CtxtParserResult {
    this.setupScope().value.push(content);
    return content;
  }

  parse(content: string): CtxtParserResult {
    const lines = content.trim().split("\n");
    const body = lines.join("\n");

    return this.pushToScope({
      format: CtxtParser.ext,
      content: body,
    });
  }
}
