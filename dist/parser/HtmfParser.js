"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmfParser = void 0;
const cowcst_1 = require("cowcst");
class HtmfParser {
    constructor(ENV = cowcst_1.NOOP) {
        var _a;
        this.ENV = ENV;
        this.root = null;
        this.currentElement = null;
        this.elementMap = new Map();
        (_a = ENV()).ctxt || (_a.ctxt = HtmfParser.createEnvScope());
    }
    static createEnvScope() {
        return {
            scope: "htmf",
            value: [],
        };
    }
    parse(content) {
        const lines = content.trim().split("\n");
        this.root = null;
        this.currentElement = null;
        this.elementMap.clear();
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("=>"))
                this.parseElement(trimmedLine);
            else if (trimmedLine.startsWith("<+"))
                this.addChildren(trimmedLine);
            else if (trimmedLine.startsWith("!"))
                continue; // Ignore comments
            else
                this.addContent(trimmedLine);
        }
        return {
            format: "htmf",
            content: this.root,
        };
    }
    parseElement(line) {
        const [_, name, tag, ...attrParts] = line.split(" ");
        const attributes = {};
        attrParts.forEach((attr) => {
            const [key, value] = attr.split("=");
            if (key && value)
                attributes[key] = value.replace(/"/g, "");
        });
        const element = {
            tag,
            name,
            attributes,
            children: [],
            content: "",
        };
        if (!this.root)
            this.root = element;
        this.currentElement = element;
        this.elementMap.set(name, element);
    }
    addChildren(line) {
        const [_, parentName, ...childrenNames] = line.split(" ");
        const parentElement = this.elementMap.get(parentName);
        if (parentElement) {
            childrenNames.forEach((childName) => {
                const childElement = this.elementMap.get(childName);
                if (childElement)
                    parentElement.children.push(childElement);
            });
        }
    }
    addContent(line) {
        if (this.currentElement) {
            this.currentElement.content += line + "\n";
        }
    }
}
exports.HtmfParser = HtmfParser;
