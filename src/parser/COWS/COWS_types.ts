import { createErrorNS } from "./COWS_errors";
import { CowNode } from "./COWS_node";
import { CowScope } from "./COWS_scope";
import { CowSM } from "./COWS_sm";

export type MakeInstParams = {
  rest: any[];
  scope: CowScope;
  node: CowNode;
  ens: ReturnType<typeof createErrorNS>;
  values: CowScope["values"];
  bucket: CowScope["bucket"];
  t: CowSM;
};

export type MakeInstFunction = (
  rest: any[],
  scope: CowScope,
  node: CowNode,
  t: CowSM,
) => any;
