export type COWFFormat =
  | "txt"
  | "cjml"
  | "artf"
  | "htmf"
  | "rout"
  | "yaml"
  | "";

export interface COWFParseResult<T = any> {
  format: string;
  content: T;
}

export interface COWFEnvScope<T = any> {
  scope: string;
  value: T;
}
