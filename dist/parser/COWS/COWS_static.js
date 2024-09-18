"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CowStatics = exports.CowSTD = exports.CowCore = exports.CowPrim = void 0;
const COWS_errors_1 = require("./COWS_errors");
const COWS_instruction_1 = require("./COWS_instruction");
class CowPrim {
}
exports.CowPrim = CowPrim;
_a = CowPrim;
CowPrim.C_TRUE = true;
CowPrim.C_FALSE = false;
CowPrim.C_LOWER = "abcdefghijklmnopqrstuvwxyz";
CowPrim.C_UPPER = _a.C_LOWER.toLowerCase();
CowPrim.C_NUMBER = Array.from({ length: 10 }, (_, i) => i);
CowPrim.C_SYMBL = "#$%&*+-./:<=>?@^_`{|}~";
CowPrim.C_CHARS = _a.C_LOWER + _a.C_UPPER + _a.C_NUMBER + _a.C_SYMBL;
CowPrim.C_CHARS_LEN = CowPrim.C_CHARS.length;
class CowCore extends CowPrim {
    static makeInst(instFunc) {
        return (rest, scope, node, t) => {
            const ens = (0, COWS_errors_1.createErrorNS)(instFunc.name || instFunc.constructor.name, node);
            return instFunc(CowStatics.makeInstParams(rest, scope, node, ens, t));
        };
    }
    static makeInstParams(rest, scope, node, ens, t) {
        return {
            rest,
            scope,
            node,
            ens,
            t,
            values: scope.values,
            bucket: scope.bucket,
        };
    }
    static handleNoName(rest, ens) {
        if (!rest[0])
            ens("No name found");
    }
    static handleNoValue(rest, ens) {
        if (!rest[1])
            ens("No value found");
    }
    /** Internal Function to handle jump */
    jumpTo(i, scope, t) {
        const so = scope.stack.find((n) => n.thisReg == i);
        if (!so)
            throw new Error(`No scope found at ${i}`);
        t.iterateAndRun(scope.stack, scope, so);
    }
}
exports.CowCore = CowCore;
class CowSTD extends CowCore {
    constructor() {
        super(...arguments);
        /** Instruction for assignment (ASG) */
        this.instASG = ({ rest, ens, values }) => {
            const [, name, , value] = rest;
            CowSTD.handleNoName(rest, ens);
            CowSTD.handleNoValue(rest, ens);
            values.set(name, Number(value) || value);
        };
        this.ASG = CowStatics.makeInst(this.instASG);
        this[0] = this.translateInstruction(0);
        // ---
        /** Instruction for TAP */
        this.instTAP = ({ rest, ens, bucket }) => {
            const [, value] = rest;
            CowSTD.handleNoValue(rest, ens);
            bucket.push(value);
        };
        this.TAP = CowStatics.makeInst(this.instTAP);
        this[1] = this.translateInstruction(1);
        // ---
        /** Instruction for PUT */
        this.instPUT = ({ rest, ens, values, bucket }) => {
            const [, name] = rest;
            CowSTD.handleNoName(rest, ens);
            values.set(name, bucket);
        };
        this.PUT = CowStatics.makeInst(this.instPUT);
        this[2] = this.translateInstruction(2);
        // ---
        /** Instruction for REC */
        this.instREC = ({ rest, ens, values, scope }) => {
            const [, name] = rest;
            CowSTD.handleNoName(rest, ens);
            const stackRes = values.get(name);
            if (!stackRes)
                ens(`No value found for ${name}`);
            scope.bucket = stackRes;
        };
        this.REC = CowStatics.makeInst(this.instREC);
        this[3] = this.translateInstruction(3);
        // ---
        /** Instruction for CLR */
        this.instCLR = ({ rest, ens, values }) => {
            const [, name] = rest;
            CowSTD.handleNoName(rest, ens);
            values.delete(name);
        };
        this.CLR = CowStatics.makeInst(this.instCLR);
        this[4] = this.translateInstruction(4);
        // ---
        /** Instruction for UBCK */
        this.instUBCK = ({ scope }) => {
            scope.bucket = [];
        };
        this.UBCK = CowStatics.makeInst(this.instUBCK);
        this[5] = this.translateInstruction(5);
        // ---
        /** Instruction for PRT */
        this.instPRT = ({ rest, ens, values }) => {
            const [, name] = rest;
            CowSTD.handleNoName(rest, ens);
            console.log(values.get(name));
        };
        this.PRT = CowStatics.makeInst(this.instPRT);
        this[6] = this.translateInstruction(6);
        // ---
        /** Instruction for PRB */
        this.instPRB = ({ rest, ens, scope }) => {
            const [, name] = rest;
            CowSTD.handleNoName(rest, ens);
            console.log(scope.bucket, name);
            console.log(scope.bucket[name]);
        };
        this.PRB = CowStatics.makeInst(this.instPRB);
        this[7] = this.translateInstruction(7);
        // ---
        /** Instruction for SWP */
        this.instSWP = ({ rest, ens, bucket, scope }) => {
            const [, i1, i2] = rest;
            CowSTD.handleNoName(rest, ens); // Will handle this duplicate check
            if (i1 === undefined)
                ens("No i1 found");
            if (i2 === undefined)
                ens("No i2 found");
            [bucket[i1], bucket[i2]] = [bucket[i2], bucket[i1]];
            scope.bucket = bucket;
        };
        this.SWP = CowStatics.makeInst(this.instSWP);
        this[8] = this.translateInstruction(8);
        // ---
        /** Instruction for JMP */
        this.instJMP = ({ rest, ens, scope, t }) => {
            const [, i] = rest;
            CowSTD.handleNoName(rest, ens);
            this.jumpTo(i, scope, t);
        };
        this.JMP = CowStatics.makeInst(this.instJMP);
        this[9] = this.translateInstruction(9);
        // ---
        /** Instruction for THEN */
        this.instTHEN = ({ rest, ens, scope, bucket, t }) => {
            const [, i] = rest;
            CowSTD.handleNoName(rest, ens);
            if (!bucket)
                ens("No bucket found");
            if (scope.bucket.every((v) => !!v))
                this.jumpTo(i, scope, t);
        };
        this.THEN = CowStatics.makeInst(this.instTHEN);
        this[10] = this.translateInstruction(10);
        // ---
        /** Instruction for DOJ */
        this.instDOJ = ({ rest, ens, bucket }) => {
            const [ws, ...restOf] = rest;
            if (!ws)
                bucket.map(eval);
            else
                for (const i of restOf) {
                    const item = bucket[i];
                    if (item)
                        bucket[i] = new Function("return " + item)();
                    else
                        ens("No item found: " + i);
                }
        };
        this.DOJ = CowStatics.makeInst(this.instDOJ);
        this[11] = this.translateInstruction(11);
        // ---
        /** Instruction for ADD */
        this.instADD = ({ rest, ens, bucket }) => {
            let [ws, a, , b] = rest;
            if (!ws) {
                a = bucket.pop();
                b = bucket.pop();
            }
            if (a && b)
                bucket.push(a + b);
            else
                ens("No a or b found");
        };
        this.ADD = CowStatics.makeInst(this.instADD);
        this[12] = this.translateInstruction(12);
        // ---
        /** Instruction for SUB */
        this.instSUB = ({ rest, ens, bucket }) => {
            let [ws, a, , b] = rest;
            if (!ws) {
                b = bucket.pop();
                a = bucket.pop();
            }
            if (a && b)
                bucket.push(a - b);
            else
                ens("No a or b found");
        };
        this.SUB = CowStatics.makeInst(this.instSUB);
        this[13] = this.translateInstruction(13);
        // ---
        /** Instruction for PUSH */
        this.instPUSH = ({ rest, bucket }) => {
            const [, value] = rest;
            bucket.push(value);
        };
        this.PUSH = CowStatics.makeInst(this.instPUSH);
        this[14] = this.translateInstruction(14);
        // ---
        /** Instruction for MUL */
        this.instMUL = ({ rest, ens, bucket }) => {
            let [ws, a, , b] = rest;
            if (!ws) {
                a = bucket.pop();
                b = bucket.pop();
            }
            if (a && b)
                bucket.push(a * b);
            else
                ens("No a or b found");
        };
        this.MUL = CowStatics.makeInst(this.instMUL);
        this[15] = this.translateInstruction(15);
        // ---
        /** Instruction for DIV */
        this.instDIV = ({ rest, ens, bucket }) => {
            let [ws, a, , b] = rest;
            if (!ws) {
                b = bucket.pop();
                a = bucket.pop();
            }
            if (a && b) {
                if (b == 0)
                    ens("Division by zero");
                bucket.push(a / b);
            }
            else
                ens("No a or b found");
        };
        this.DIV = CowStatics.makeInst(this.instDIV);
        this[16] = this.translateInstruction(16);
        // MOV - Move data between registers or memory
        this.instMOV = ({ rest, ens, values }) => {
            const [, dest, src] = rest;
            if (!dest || !src)
                ens("Missing destination or source for MOV");
            values.set(dest, values.get(src) || src);
        };
        this.MOV = CowStatics.makeInst(this.instMOV);
        this[17] = this.translateInstruction(17);
        // CMP - Compare two values
        this.instCMP = ({ rest, ens, values, bucket }) => {
            const [, a, b] = rest;
            if (!a || !b)
                ens("Missing operands for CMP");
            const valA = values.get(a) || a;
            const valB = values.get(b) || b;
            bucket.push(valA === valB ? 0 : valA > valB ? 1 : -1);
        };
        this.CMP = CowStatics.makeInst(this.instCMP);
        this[18] = this.translateInstruction(18);
        // JNE - Jump if not equal
        this.instJNE = ({ rest, ens, scope, bucket, t }) => {
            const [, i] = rest;
            if (!i)
                ens("Missing jump target for JNE");
            if (bucket[bucket.length - 1] !== 0)
                this.jumpTo(i, scope, t);
        };
        this.JNE = CowStatics.makeInst(this.instJNE);
        this[19] = this.translateInstruction(19);
        // AND - Bitwise AND operation
        this.instAND = ({ rest, ens, bucket }) => {
            let [ws, a, b] = rest;
            if (!ws) {
                b = bucket.pop();
                a = bucket.pop();
            }
            if (a === undefined || b === undefined)
                ens("Missing operands for AND");
            bucket.push(a & b);
        };
        this.AND = CowStatics.makeInst(this.instAND);
        this[20] = this.translateInstruction(20);
        // OR - Bitwise OR operation
        this.instOR = ({ rest, ens, bucket }) => {
            let [ws, a, b] = rest;
            if (!ws) {
                b = bucket.pop();
                a = bucket.pop();
            }
            if (a === undefined || b === undefined)
                ens("Missing operands for OR");
            bucket.push(a | b);
        };
        this.OR = CowStatics.makeInst(this.instOR);
        this[21] = this.translateInstruction(21);
        // XOR - Bitwise XOR operation
        this.instXOR = ({ rest, ens, bucket }) => {
            let [ws, a, b] = rest;
            if (!ws) {
                b = bucket.pop();
                a = bucket.pop();
            }
            if (a === undefined || b === undefined)
                ens("Missing operands for XOR");
            bucket.push(a ^ b);
        };
        this.XOR = CowStatics.makeInst(this.instXOR);
        this[22] = this.translateInstruction(22);
        // SHL - Shift left
        this.instSHL = ({ rest, ens, bucket }) => {
            let [ws, value, shift] = rest;
            if (!ws) {
                shift = bucket.pop();
                value = bucket.pop();
            }
            if (value === undefined || shift === undefined)
                ens("Missing operands for SHL");
            bucket.push(value << shift);
        };
        this.SHL = CowStatics.makeInst(this.instSHL);
        this[23] = this.translateInstruction(23);
        // SHR - Shift right
        this.instSHR = ({ rest, ens, bucket }) => {
            let [ws, value, shift] = rest;
            if (!ws) {
                shift = bucket.pop();
                value = bucket.pop();
            }
            if (value === undefined || shift === undefined)
                ens("Missing operands for SHR");
            bucket.push(value >> shift);
        };
        this.SHR = CowStatics.makeInst(this.instSHR);
        this[24] = this.translateInstruction(24);
        // RET - Return from subroutine
        this.instRET = ({ scope, t }) => {
            const returnAddress = scope.stack.pop()?.returnReg;
            if (returnAddress !== undefined) {
                this.jumpTo(returnAddress, scope, t);
            }
        };
        this.RET = CowStatics.makeInst(this.instRET);
        this[25] = this.translateInstruction(25);
        // POP - Pop value from stack
        this.instPOP = ({ bucket }) => {
            return bucket.pop();
        };
        this.POP = CowStatics.makeInst(this.instPOP);
        this[26] = this.translateInstruction(26);
        // INC - Increment value
        this.instINC = ({ rest, ens, values }) => {
            const [, name] = rest;
            if (!name)
                ens("Missing operand for INC");
            const value = values.get(name);
            if (value === undefined)
                ens(`Variable ${name} not found`);
            values.set(name, value + 1);
        };
        this.INC = CowStatics.makeInst(this.instINC);
        this[27] = this.translateInstruction(27);
        // DEC - Decrement value
        this.instDEC = ({ rest, ens, values }) => {
            const [, name] = rest;
            if (!name)
                ens("Missing operand for DEC");
            const value = values.get(name);
            if (value === undefined)
                ens(`Variable ${name} not found`);
            values.set(name, value - 1);
        };
        this.DEC = CowStatics.makeInst(this.instDEC);
        this[28] = this.translateInstruction(28);
        // NEG - Negate value
        this.instNEG = ({ rest, ens, values }) => {
            const [, name] = rest;
            if (!name)
                ens("Missing operand for NEG");
            const value = values.get(name);
            if (value === undefined)
                ens(`Variable ${name} not found`);
            values.set(name, -value);
        };
        this.NEG = CowStatics.makeInst(this.instNEG);
        this[29] = this.translateInstruction(29);
    }
    static translateKey(key) {
        return typeof key === "string"
            ? COWS_instruction_1.COWSInstructionType[key]
            : key;
    }
    translateInstruction(key) {
        return this[CowSTD.translateKey(key)];
    }
}
exports.CowSTD = CowSTD;
class CowStatics extends CowSTD {
}
exports.CowStatics = CowStatics;
