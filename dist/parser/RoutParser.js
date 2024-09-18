"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutParser = exports.Route = void 0;
const cowcst_1 = require("cowcst");
class Route {
    constructor(path = "", files = [], directive = "") {
        this.path = path;
        this.files = files;
        this.directive = directive;
        this.path = path.replace(/"/g, "");
    }
}
exports.Route = Route;
class RoutParser {
    constructor(ENV = cowcst_1.NOOP) {
        this.ENV = ENV;
        this.routes = [];
        this.currentRoute = null;
    }
    parse(content) {
        const lines = content.trim().split("\n");
        this.routes = [];
        this.currentRoute = null;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("=."))
                this.parseRoute(trimmedLine);
            else if (trimmedLine.startsWith("+."))
                this.addFile(trimmedLine);
            else if (trimmedLine.startsWith("!"))
                continue; // Ignore comments
            else if (trimmedLine.startsWith("=>"))
                this.handleRoutingDirective(trimmedLine);
        }
        return {
            format: "rout",
            content: this.routes,
        };
    }
    parseRoute(line) {
        const [_, name, path] = line.split(" ");
        this.currentRoute = new Route(path);
        this.routes.push(this.currentRoute);
    }
    addFile(line) {
        if (this.currentRoute) {
            const [_, name, ...pathParts] = line.split(" ");
            const filePath = pathParts.join(" ").replace(/"/g, "");
            this.currentRoute.files.push(filePath);
        }
    }
    handleRoutingDirective(line) {
        if (this.currentRoute) {
            // Remove the "=>" symbol from the directive
            this.currentRoute.directive = line.trim().substring(2).trim();
        }
    }
}
exports.RoutParser = RoutParser;
