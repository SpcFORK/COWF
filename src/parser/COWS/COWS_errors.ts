import { CowNode } from "./COWS_node";

export class CowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CowError";
  }

  stack?: string | undefined;
  cause?: unknown;
  name: string;

  logError() {
    console.error(this);
  }

  throwError(): never {
    throw this;
  }
}

export const createError = (
  fnName: string,
  msg: string,
  node: CowNode,
): never => {
  const error = new CowError(`${fnName}: ${msg}`);
  error.stack = `Node at: ${node.index}:${node.thisReg}-${node.nextReg}\n- CSM`;
  error.cause = `Node at: ${node.index}:${node.thisReg}-${node.nextReg}\n- CSM`;
  error.name = "CowSM-Error";
  return error.throwError();
};

export const createErrorNS = (fnName: string, node: CowNode) => (msg: string) =>
  createError(fnName, msg, node);
