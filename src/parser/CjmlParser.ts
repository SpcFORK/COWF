import { NOOP } from "cowcst";
import { COWFParseResult } from "../types/COWFTypes";

export type CjmlContent = Record<string, any>;

export class CjmlParser {
  constructor(public ENV: () => Record<string, any> = NOOP) {}

  parse(content: string): COWFParseResult<CjmlContent> {
    const lines = content.trim().split("\n");
    const result: { [key: string]: any } = {};
    let currentObject: { [key: string]: any } = result;
    const objectStack: { [key: string]: any }[] = [result];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.endsWith("{")) {
        const key = trimmedLine.slice(0, -1).trim();
        currentObject[key] = {};
        objectStack.push(currentObject);
        currentObject = currentObject[key];
      } else if (trimmedLine === "}" || trimmedLine === "};") {
        objectStack.pop();
        currentObject = objectStack[objectStack.length - 1];
      } else if (trimmedLine.includes(":")) {
        const [key, value] = trimmedLine.split(":");
        currentObject[key.trim()] = this.parseValue(value.trim());
      } else if (trimmedLine.endsWith(";")) {
        // Handle empty objects or properties without values
        const key = trimmedLine.slice(0, -1).trim();
        if (!(key in currentObject)) {
          currentObject[key] = "";
        }
      }
    }

    return {
      format: "cjml",
      content: result,
    };
  }

  private parseValue(value: string): any {
    if (value === "") return "";
    if (!isNaN(Number(value))) return Number(value);
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);
    return value;
  }
}
