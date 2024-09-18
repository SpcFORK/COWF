export interface StackItem<T = number> {
  type: T;
  value: string;
}

export interface Block {
  code: string;
  language: string;
}

export interface ExecutableBlock extends Block {
  name?: string;
  args?: string;
}

export interface SubroutineParam {
  name: string;
  default?: string;
}

export interface Subroutine extends Block {
  params: SubroutineParam[];
  isAsync: boolean;
  isThread: boolean;
}

export enum StackType {
  "subroutine",
  "asyncSubroutine",
  "thread",
  "assignment",
  "variable",
  "operation",
  "return",
  "code_block",
  "general",
}

export enum CoreBlocks {
  "anon",
  "Assignment",
  "ExecAssig",
  "ExecGOp",
}
