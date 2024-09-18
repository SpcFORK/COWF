import { createErrorNS } from "./COWS_errors";
import { COWSInstructionType } from "./COWS_instruction";
import { CowNode } from "./COWS_node";
import { CowScope } from "./COWS_scope";
import { CowSM } from "./COWS_sm";
import { MakeInstParams, MakeInstFunction } from "./COWS_types";

export type CowSTDKey = COWSInstructionType | keyof typeof COWSInstructionType;
export type CowSTDType = {
  [K in CowSTDKey]: MakeInstFunction;
};

export class CowPrim {
  static readonly C_TRUE = true;
  static readonly C_FALSE = false;

  static readonly C_LOWER = "abcdefghijklmnopqrstuvwxyz";
  static readonly C_UPPER = this.C_LOWER.toLowerCase();
  static readonly C_NUMBER = Array.from({ length: 10 }, (_, i) => i);
  static readonly C_SYMBL = "#$%&*+-./:<=>?@^_`{|}~";

  static readonly C_CHARS =
    this.C_LOWER + this.C_UPPER + this.C_NUMBER + this.C_SYMBL;

  static readonly C_CHARS_LEN = CowPrim.C_CHARS.length;
}

export class CowCore extends CowPrim {
  static makeInst(
    instFunc: ({ rest, scope, node, ens, values }: MakeInstParams) => any,
  ): MakeInstFunction {
    return (rest, scope, node, t) => {
      const ens = createErrorNS(
        instFunc.name || instFunc.constructor.name,
        node,
      );
      return instFunc(CowStatics.makeInstParams(rest, scope, node, ens, t));
    };
  }

  protected static makeInstParams(
    rest: any[],
    scope: CowScope,
    node: CowNode,
    ens: (msg: string) => never,
    t: CowSM,
  ): MakeInstParams {
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

  static handleNoName(rest: any[], ens: any): void {
    if (!rest[0]) ens("No name found");
  }

  static handleNoValue(rest: any[], ens: any): void {
    if (!rest[1]) ens("No value found");
  }

  /** Internal Function to handle jump */
  protected jumpTo(i: number, scope: CowScope, t: CowSM) {
    const so = scope.stack.find((n) => n.thisReg == i);
    if (!so) throw new Error(`No scope found at ${i}`);
    t.iterateAndRun(scope.stack, scope, so);
  }
}

export class CowSTD extends CowCore implements CowSTDType {
  static translateKey<K extends CowSTDKey>(key: K): CowSTDKey {
    return typeof key === "string"
      ? (COWSInstructionType[key as keyof typeof COWSInstructionType] as any)
      : (key as any);
  }

  translateInstruction<K extends CowSTDKey>(key: K): MakeInstFunction {
    return this[CowSTD.translateKey(key)] as MakeInstFunction;
  }

  /** Instruction for assignment (ASG) */
  protected instASG = ({ rest, ens, values }: MakeInstParams) => {
    const [, name, , value] = rest;
    CowSTD.handleNoName(rest, ens);
    CowSTD.handleNoValue(rest, ens);
    values.set(name, Number(value) || value);
  };

  ASG = CowStatics.makeInst(this.instASG);
  0 = this.translateInstruction(0);

  // ---

  /** Instruction for TAP */
  protected instTAP = ({ rest, ens, bucket }: MakeInstParams) => {
    const [, value] = rest;
    CowSTD.handleNoValue(rest, ens);
    bucket.push(value);
  };

  TAP = CowStatics.makeInst(this.instTAP);
  1 = this.translateInstruction(1);

  // ---

  /** Instruction for PUT */
  protected instPUT = ({ rest, ens, values, bucket }: MakeInstParams) => {
    const [, name] = rest;
    CowSTD.handleNoName(rest, ens);
    values.set(name, bucket);
  };

  PUT = CowStatics.makeInst(this.instPUT);
  2 = this.translateInstruction(2);

  // ---

  /** Instruction for REC */
  protected instREC = ({ rest, ens, values, scope }: MakeInstParams) => {
    const [, name] = rest;
    CowSTD.handleNoName(rest, ens);
    const stackRes = values.get(name);
    if (!stackRes) ens(`No value found for ${name}`);
    scope.bucket = stackRes;
  };

  REC = CowStatics.makeInst(this.instREC);
  3 = this.translateInstruction(3);

  // ---

  /** Instruction for CLR */
  protected instCLR = ({ rest, ens, values }: MakeInstParams) => {
    const [, name] = rest;
    CowSTD.handleNoName(rest, ens);
    values.delete(name);
  };

  CLR = CowStatics.makeInst(this.instCLR);
  4 = this.translateInstruction(4);

  // ---

  /** Instruction for UBCK */
  protected instUBCK = ({ scope }: MakeInstParams) => {
    scope.bucket = [];
  };

  UBCK = CowStatics.makeInst(this.instUBCK);
  5 = this.translateInstruction(5);

  // ---

  /** Instruction for PRT */
  protected instPRT = ({ rest, ens, values }: MakeInstParams) => {
    const [, name] = rest;
    CowSTD.handleNoName(rest, ens);
    console.log(values.get(name));
  };

  PRT = CowStatics.makeInst(this.instPRT);
  6 = this.translateInstruction(6);

  // ---

  /** Instruction for PRB */
  protected instPRB = ({ rest, ens, scope }: MakeInstParams) => {
    const [, name] = rest;
    CowSTD.handleNoName(rest, ens);
    console.log(scope.bucket, name);
    console.log(scope.bucket[name]);
  };

  PRB = CowStatics.makeInst(this.instPRB);
  7 = this.translateInstruction(7);

  // ---

  /** Instruction for SWP */
  protected instSWP = ({ rest, ens, bucket, scope }: MakeInstParams) => {
    const [, i1, i2] = rest;
    CowSTD.handleNoName(rest, ens); // Will handle this duplicate check
    if (i1 === undefined) ens("No i1 found");
    if (i2 === undefined) ens("No i2 found");
    [bucket[i1], bucket[i2]] = [bucket[i2], bucket[i1]];
    scope.bucket = bucket;
  };

  SWP = CowStatics.makeInst(this.instSWP);
  8 = this.translateInstruction(8);

  // ---

  /** Instruction for JMP */
  protected instJMP = ({ rest, ens, scope, t }: MakeInstParams) => {
    const [, i] = rest;
    CowSTD.handleNoName(rest, ens);
    this.jumpTo(i, scope, t);
  };

  JMP = CowStatics.makeInst(this.instJMP);
  9 = this.translateInstruction(9);

  // ---

  /** Instruction for THEN */
  protected instTHEN = ({ rest, ens, scope, bucket, t }: MakeInstParams) => {
    const [, i] = rest;
    CowSTD.handleNoName(rest, ens);
    if (!bucket) ens("No bucket found");
    if (scope.bucket.every((v) => !!v)) this.jumpTo(i, scope, t);
  };

  THEN = CowStatics.makeInst(this.instTHEN);
  10 = this.translateInstruction(10);

  // ---

  /** Instruction for DOJ */
  protected instDOJ = ({ rest, ens, bucket }: MakeInstParams) => {
    const [ws, ...restOf] = rest;
    if (!ws) bucket.map(eval);
    else
      for (const i of restOf) {
        const item = bucket[i];
        if (item) bucket[i] = new Function("return " + item)();
        else ens("No item found: " + i);
      }
  };

  DOJ = CowStatics.makeInst(this.instDOJ);
  11 = this.translateInstruction(11);

  // ---

  /** Instruction for ADD */
  protected instADD = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, , b] = rest;
    if (!ws) {
      a = bucket.pop();
      b = bucket.pop();
    }
    if (a && b) bucket.push(a + b);
    else ens("No a or b found");
  };

  ADD = CowStatics.makeInst(this.instADD);
  12 = this.translateInstruction(12);

  // ---

  /** Instruction for SUB */
  protected instSUB = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, , b] = rest;
    if (!ws) {
      b = bucket.pop();
      a = bucket.pop();
    }
    if (a && b) bucket.push(a - b);
    else ens("No a or b found");
  };

  SUB = CowStatics.makeInst(this.instSUB);
  13 = this.translateInstruction(13);

  // ---

  /** Instruction for PUSH */
  protected instPUSH = ({ rest, bucket }: MakeInstParams) => {
    const [, value] = rest;
    bucket.push(value);
  };

  PUSH = CowStatics.makeInst(this.instPUSH);
  14 = this.translateInstruction(14);

  // ---

  /** Instruction for MUL */
  protected instMUL = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, , b] = rest;
    if (!ws) {
      a = bucket.pop();
      b = bucket.pop();
    }
    if (a && b) bucket.push(a * b);
    else ens("No a or b found");
  };

  MUL = CowStatics.makeInst(this.instMUL);
  15 = this.translateInstruction(15);

  // ---

  /** Instruction for DIV */
  protected instDIV = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, , b] = rest;
    if (!ws) {
      b = bucket.pop();
      a = bucket.pop();
    }
    if (a && b) {
      if (b == 0) ens("Division by zero");
      bucket.push(a / b);
    } else ens("No a or b found");
  };

  DIV = CowStatics.makeInst(this.instDIV);
  16 = this.translateInstruction(16);

  // MOV - Move data between registers or memory
  protected instMOV = ({ rest, ens, values }: MakeInstParams) => {
    const [, dest, src] = rest;
    if (!dest || !src) ens("Missing destination or source for MOV");
    values.set(dest, values.get(src) || src);
  };

  MOV = CowStatics.makeInst(this.instMOV);
  17 = this.translateInstruction(17);

  // CMP - Compare two values
  protected instCMP = ({ rest, ens, values, bucket }: MakeInstParams) => {
    const [, a, b] = rest;
    if (!a || !b) ens("Missing operands for CMP");
    const valA = values.get(a) || a;
    const valB = values.get(b) || b;
    bucket.push(valA === valB ? 0 : valA > valB ? 1 : -1);
  };

  CMP = CowStatics.makeInst(this.instCMP);
  18 = this.translateInstruction(18);

  // JNE - Jump if not equal
  protected instJNE = ({ rest, ens, scope, bucket, t }: MakeInstParams) => {
    const [, i] = rest;
    if (!i) ens("Missing jump target for JNE");
    if (bucket[bucket.length - 1] !== 0) this.jumpTo(i, scope, t);
  };

  JNE = CowStatics.makeInst(this.instJNE);
  19 = this.translateInstruction(19);

  // AND - Bitwise AND operation
  protected instAND = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, b] = rest;
    if (!ws) {
      b = bucket.pop();
      a = bucket.pop();
    }
    if (a === undefined || b === undefined) ens("Missing operands for AND");
    bucket.push(a & b);
  };

  AND = CowStatics.makeInst(this.instAND);
  20 = this.translateInstruction(20);

  // OR - Bitwise OR operation
  protected instOR = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, b] = rest;
    if (!ws) {
      b = bucket.pop();
      a = bucket.pop();
    }
    if (a === undefined || b === undefined) ens("Missing operands for OR");
    bucket.push(a | b);
  };

  OR = CowStatics.makeInst(this.instOR);
  21 = this.translateInstruction(21);

  // XOR - Bitwise XOR operation
  protected instXOR = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, a, b] = rest;
    if (!ws) {
      b = bucket.pop();
      a = bucket.pop();
    }
    if (a === undefined || b === undefined) ens("Missing operands for XOR");
    bucket.push(a ^ b);
  };

  XOR = CowStatics.makeInst(this.instXOR);
  22 = this.translateInstruction(22);

  // SHL - Shift left
  protected instSHL = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, value, shift] = rest;
    if (!ws) {
      shift = bucket.pop();
      value = bucket.pop();
    }
    if (value === undefined || shift === undefined)
      ens("Missing operands for SHL");
    bucket.push(value << shift);
  };

  SHL = CowStatics.makeInst(this.instSHL);
  23 = this.translateInstruction(23);

  // SHR - Shift right
  protected instSHR = ({ rest, ens, bucket }: MakeInstParams) => {
    let [ws, value, shift] = rest;
    if (!ws) {
      shift = bucket.pop();
      value = bucket.pop();
    }
    if (value === undefined || shift === undefined)
      ens("Missing operands for SHR");
    bucket.push(value >> shift);
  };

  SHR = CowStatics.makeInst(this.instSHR);
  24 = this.translateInstruction(24);

  // RET - Return from subroutine
  protected instRET = ({ scope, t }: MakeInstParams) => {
    const returnAddress = scope.stack.pop()?.returnReg;
    if (returnAddress !== undefined) {
      this.jumpTo(returnAddress, scope, t);
    }
  };

  RET = CowStatics.makeInst(this.instRET);
  25 = this.translateInstruction(25);

  // POP - Pop value from stack
  protected instPOP = ({ bucket }: MakeInstParams) => {
    return bucket.pop();
  };

  POP = CowStatics.makeInst(this.instPOP);
  26 = this.translateInstruction(26);

  // INC - Increment value
  protected instINC = ({ rest, ens, values }: MakeInstParams) => {
    const [, name] = rest;
    if (!name) ens("Missing operand for INC");
    const value = values.get(name);
    if (value === undefined) ens(`Variable ${name} not found`);
    values.set(name, value + 1);
  };

  INC = CowStatics.makeInst(this.instINC);
  27 = this.translateInstruction(27);

  // DEC - Decrement value
  protected instDEC = ({ rest, ens, values }: MakeInstParams) => {
    const [, name] = rest;
    if (!name) ens("Missing operand for DEC");
    const value = values.get(name);
    if (value === undefined) ens(`Variable ${name} not found`);
    values.set(name, value - 1);
  };

  DEC = CowStatics.makeInst(this.instDEC);
  28 = this.translateInstruction(28);

  // NEG - Negate value
  protected instNEG = ({ rest, ens, values }: MakeInstParams) => {
    const [, name] = rest;
    if (!name) ens("Missing operand for NEG");
    const value = values.get(name);
    if (value === undefined) ens(`Variable ${name} not found`);
    values.set(name, -value);
  };

  NEG = CowStatics.makeInst(this.instNEG);
  29 = this.translateInstruction(29);
}

export class CowStatics extends CowSTD {}
