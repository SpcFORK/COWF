// Make sure this is in a global declaration file, for instance, `src/types/vm-browserify.d.ts`

declare module "vm-browserify" {
  export class Script {
    code: string;
    static createContext(context: any): Context;

    constructor(code: string);
    runInContext(context: Context): any;
    runInThisContext(): any;
    runInNewContext(context: any): any;
  }

  export class Context {}

  export function isContext(context: any): boolean;
  export function createScript(code: string): Script;
  export function createContext(context: any): Context;

  export type ForEachCallback<T> = (item: T, index: number, array: T[]) => void;

  export function indexOf<T>(xs: T[], item: T): number;
  export function Object_keys<T>(obj: T): string[];
  export function forEach<T>(xs: T[], fn: ForEachCallback<T>): void;

  export function defineProp(obj: any, name: string, value: any): void;

  export const globals: string[];
}
