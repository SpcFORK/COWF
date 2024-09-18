export class VariableParser {
    constructor() {
        this.variables = {};
    }
    parseVariable(line) {
        const [operator, key, ...valueParts] = line.split(" ");
        const value = valueParts.join(" ");
        switch (operator) {
            case "=#":
                this.updateVariables(key, parseInt(value, 10));
                break;
            case "=.":
                this.updateVariables(key, parseFloat(value));
                break;
            case "=$":
                this.updateVariables(key, value.replace(/"/g, ""));
                break;
            case "=]":
                this.updateVariables(key, valueParts.map((v) => this.parseValue(v)));
                break;
        }
    }
    updateVariables(varName, value) {
        this.variables[varName] = value;
        return { type: "variable", value: `${varName} = ${JSON.stringify(value)}` };
    }
    parseValue(value) {
        if (value === "true")
            return true;
        if (value === "false")
            return false;
        if (value === "null")
            return null;
        if (!isNaN(Number(value)))
            return Number(value);
        return value.replace(/"/g, "");
    }
    getVariables() {
        return this.variables;
    }
}
