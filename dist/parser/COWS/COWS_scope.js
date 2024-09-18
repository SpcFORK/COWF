"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowScope = void 0;
const COWS_static_1 = require("./COWS_static");
class CowScope {
    constructor(name, stack, parent = null) {
        this.name = name;
        this.stack = stack;
        this.parent = parent;
        this.values = new Map(Object.entries(new COWS_static_1.CowStatics()));
        this.children = [];
        this.bucket = [];
        if (parent)
            parent.children.push(this);
    }
}
exports.CowScope = CowScope;
