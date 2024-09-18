"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowNode = void 0;
class CowNode {
    constructor(code, thisReg, nextReg, stack) {
        this.code = code;
        this.thisReg = thisReg;
        this.nextReg = nextReg;
        this.stack = stack;
        stack.push(this);
        this.index = stack.length - 1;
    }
    get next() {
        if (this._next)
            return this._next;
        const nextNode = this.findNextReg(this.nextReg, this.index);
        if (nextNode) {
            this._next = nextNode;
            nextNode._prev = this;
        }
        return this._next;
    }
    get prev() {
        return this._prev;
    }
    findNextReg(reg, i) {
        return this.stack.slice(i).find((s) => s.thisReg === reg);
    }
    findReg(reg) {
        return this.stack.find((s) => s.thisReg === reg);
    }
    removeNext() {
        if (this._next)
            this._next._prev = undefined;
        this._next = undefined;
    }
    removePrev() {
        if (this._prev)
            this._prev._next = undefined;
        this._prev = undefined;
    }
}
exports.CowNode = CowNode;
