import { NOOP } from "cowcst";
import { COWFEnvScope, COWFParseResult } from "../types/COWFTypes";

export class Route {
  constructor(
    public path: string = "",
    public files: string[] = [],
    public directive: string = "",
  ) {
    this.path = path.replace(/"/g, "");
  }
}

export type RoutContent = string | Route[];

export type RoutParserResult = COWFParseResult<RoutContent>;
export type RoutParserEnv = COWFEnvScope<RoutParserResult[]>;

export class RoutParser {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;

  constructor(public ENV: () => Record<string, any> = NOOP) {
    this.setupScope();
  }

  static ext = "rout"
  static createEnvScope(): RoutParserEnv {
    return {
      scope: this.ext,
      value: [],
    };
  }

  setupScope(): RoutParserEnv {
    return (this.ENV().rout ||= RoutParser.createEnvScope());
  }

  pushToScope(content: RoutParserResult): RoutParserResult {
    this.setupScope().value.push(content);
    return content;
  }

  parse(content: string): RoutParserResult {
    const lines = content.trim().split("\n");
    this.routes = [];
    this.currentRoute = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("=.")) this.parseRoute(trimmedLine);
      else if (trimmedLine.startsWith("+.")) this.addFile(trimmedLine);
      else if (trimmedLine.startsWith("!"))
        continue; // Ignore comments
      else if (trimmedLine.startsWith("=>"))
        this.handleRoutingDirective(trimmedLine);
    }

    return this.pushToScope({
      format: RoutParser.ext,
      content: this.routes,
    });
  }

  private parseRoute(line: string): void {
    const [_, name, path] = line.split(" ");
    this.currentRoute = new Route(path);
    this.routes.push(this.currentRoute);
  }

  private addFile(line: string): void {
    if (this.currentRoute) {
      const [_, name, ...pathParts] = line.split(" ");
      const filePath = pathParts.join(" ").replace(/"/g, "");
      this.currentRoute.files.push(filePath);
    }
  }

  private handleRoutingDirective(line: string): void {
    if (this.currentRoute) {
      // Remove the "=>" symbol from the directive
      this.currentRoute.directive = line.trim().substring(2).trim();
    }
  }
}
