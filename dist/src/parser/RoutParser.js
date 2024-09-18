export class RoutParser {
    constructor() {
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
        this.currentRoute = {
            path: path.replace(/"/g, ""),
            files: [],
            directive: "",
        };
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
