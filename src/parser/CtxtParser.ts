import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";
import { NOOP } from "cowcst"

export class CtxtParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {
    ENV().ctxt ||= CtxtParser.createEnvScope();
  }

  static createEnvScope(): COWFEnvScope<COWFParseResult<string>[]> {
    return {
      scope: "ctxt",
      value: [],
    };
  }

  parse(content: string): COWFParseResult<string> {
    const lines = content.trim().split("\n");
    const body = lines.join("\n");

    return {
      format: "txt",
      content: body,
    };
  }
}
