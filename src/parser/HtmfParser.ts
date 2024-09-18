import { NOOP } from "cowcst";
import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";

export interface HtmfElement {
  tag: string;
  name: string;
  attributes: Record<string, string>;
  children: HtmfElement[];
  content: string;
}

export type HtmfContent = string | HtmfElement[];

export class HtmfParser {
  private root: HtmfElement | null = null;
  private currentElement: HtmfElement | null = null;
  private elementMap: Map<string, HtmfElement> = new Map();

  constructor(public ENV: () => Record<string, any> = NOOP) {
    ENV().ctxt ||= HtmfParser.createEnvScope();
  }

  static createEnvScope(): COWFEnvScope<COWFParseResult<string>[]> {
    return {
      scope: "htmf",
      value: [],
    };
  }

  parse(content: string): COWFParseResult<HtmfContent> {
    const lines = content.trim().split("\n");
    this.root = null;
    this.currentElement = null;
    this.elementMap.clear();

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("=>")) this.parseElement(trimmedLine);
      else if (trimmedLine.startsWith("<+")) this.addChildren(trimmedLine);
      else if (trimmedLine.startsWith("!"))
        continue; // Ignore comments
      else this.addContent(trimmedLine);
    }

    return {
      format: "htmf",
      content: <any>this.root,
    };
  }

  private parseElement(line: string): void {
    const [_, name, tag, ...attrParts] = line.split(" ");
    const attributes: Record<string, string> = {};
    attrParts.forEach((attr) => {
      const [key, value] = attr.split("=");
      if (key && value) attributes[key] = value.replace(/"/g, "");
    });

    const element: HtmfElement = {
      tag,
      name,
      attributes,
      children: [],
      content: "",
    };

    if (!this.root) this.root = element;
    this.currentElement = element;
    this.elementMap.set(name, element);
  }

  private addChildren(line: string): void {
    const [_, parentName, ...childrenNames] = line.split(" ");
    const parentElement = this.elementMap.get(parentName);
    if (parentElement) {
      childrenNames.forEach((childName) => {
        const childElement = this.elementMap.get(childName);
        if (childElement) parentElement.children.push(childElement);
      });
    }
  }

  private addContent(line: string): void {
    if (this.currentElement) {
      this.currentElement.content += line + "\n";
    }
  }
}
