export class OperationParser {
    constructor() {
        this.operations = [];
    }
    parseOperationLine(line, isAsync = false) {
        if (line.startsWith(":>") || line.startsWith("$>")) {
            const [_, name, ...args] = line.slice(2).trim().split(" ");
            this.operations.push(`callSubroutine:${name}:${args.join(',')}`);
        }
        else {
            this.operations.push(line);
        }
    }
    parseOperation(operation) {
        if (operation.startsWith("callSubroutine:")) {
            return {
                type: "subroutine",
                value: operation.slice("callSubroutine:".length),
            };
        }
        else if (operation.startsWith("asyncSubroutine:")) {
            return {
                type: "asyncSubroutine",
                value: operation.slice("asyncSubroutine:".length),
            };
        }
        else if (operation.startsWith("<=")) {
            return { type: "assignment", value: operation.slice(2).trim() };
        }
        else {
            return { type: "general", value: operation };
        }
    }
    getOperations() {
        return this.operations;
    }
}
