export enum COWSInstructionType {
  ASG,
  TAP,
  PUT,
  REC,
  CLR,
  UBCK,
  PRT,
  PRB,
  SWP,
  JMP,
  THEN,
  DOJ,
  ADD,
  SUB,
  PUSH,
  MUL,
  DIV,
  MOV,
  CMP,
  JNE,
  AND,
  OR,
  XOR,
  SHL,
  SHR,
  RET,
  POP,
  INC,
  DEC,
  NEG,
}

export interface COWSInstruction {
  type: COWSInstructionType;
  value?: any;
}

export function createInstruction(
  type: COWSInstructionType,
  value?: any,
): COWSInstruction {
  return { type, value };
}
