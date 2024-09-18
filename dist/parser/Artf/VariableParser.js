"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableParser = void 0;
const SubroutineManager_1 = require("./SubroutineManager");
class VariableParser {
    constructor() {
        this.variables = {};
    }
    parseVariable(variableDefinition) {
        const [assignmentOperator, name, ...valueParts] = variableDefinition.split(" ");
        let value;
        const valueStr = valueParts.join(" ");
        switch (assignmentOperator) {
            case "=#":
                value = this.parseValue(valueStr);
                break;
            case "=.":
                value = parseFloat(valueStr);
                break;
            case "=$":
                value = valueStr.match(/^".*"$/) ? JSON.parse(valueStr) : valueStr;
                break;
            case "=]":
                value = this.parseArray(valueParts);
                break;
            default:
                return null;
        }
        this.variables[name] = value;
        return SubroutineManager_1.SubroutineManager.createVariableStackItem(name, value);
    }
    parseAssignment(line) {
        const [varName, ...expression] = line.split(" ");
        const value = expression.join(" ");
        return { varName, value };
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
        if (value.startsWith('"') && value.endsWith('"'))
            return value.slice(1, -1);
        return value;
    }
    parseArray(values) {
        return values.map(this.parseValue.bind(this));
    }
    updateVariables(name, value) {
        this.variables[name] = value;
        return SubroutineManager_1.SubroutineManager.createVariableStackItem(name, value);
    }
    getVariables() {
        return this.variables;
    }
}
exports.VariableParser = VariableParser;
