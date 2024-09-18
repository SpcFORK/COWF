import { CowScope } from "./COWS_scope";
import { CowNode } from "./COWS_node";

export class CowSM {
  stack: CowNode[] = [];
  i: number = 0;

  createInstruction(code: string, thisReg: number, nextReg: number) {
    return new CowNode(code, thisReg, nextReg, this.stack);
  }

  load(stack: CowNode[] | [string, number, number][]) {
    if (!stack.every((element: any) => Array.isArray(element))) {
      for (const node of stack as CowNode[]) {
        this.createInstruction(node.code, node.thisReg, node.nextReg);
      }
    } else {
      for (const [code, thisReg, nextReg] of stack as [
        string,
        number,
        number,
      ][]) {
        this.createInstruction(code, thisReg, nextReg);
      }
    }

    return this.stack;
  }

  run() {
    const stackClone = this.stack.slice();
    const scope = new CowScope("global", stackClone);

    if (!stackClone.length) return;

    return this.iterateAndRun(stackClone, scope);
  }

  iterateAndRun(
    stackClone: CowNode[],
    scope: CowScope,
    node: CowNode = stackClone[0],
  ) {
    let currentNode: CowNode | undefined = node;
    while (currentNode) {
      this.executeInstruction(scope, currentNode);
      currentNode = currentNode.next;
    }

    return scope.bucket[scope.bucket.length - 1];
  }

  executeInstruction(scope: CowScope, instr: CowNode, t: CowSM = this) {
    const [name, ...rest] = instr.code.split(/\b/);
    const variable = scope.values.get(name);
    if (variable) this.invokeMethod(variable, rest, scope, instr, t);
    else throw new Error(`Instruction ${name} not found`);
  }

  invokeMethod(
    method: any,
    rest: any[],
    scope: CowScope,
    instr: CowNode,
    t: CowSM,
  ) {
    const methodType = typeof method;
    if (methodType === "function") return method(rest, scope, instr, t);
    this.pushToScope(method, rest, scope);
  }

  pushToScope(value: any, rest: any[], scope: CowScope) {
    let currentValue = value;
    const isNotSpace = (s: string) => s.trim().length > 0;
    if (typeof value === "object") {
      for (const item of rest) {
        if (item in value && isNotSpace(item)) {
          currentValue = value[item];
        }
      }
    }

    scope.bucket.push(currentValue);
  }
}
