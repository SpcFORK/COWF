import { CowStatics } from "./COWS_static";
import { CowNode } from "./COWS_node";

export class CowScope {
  values = new Map<string, any>(Object.entries(new CowStatics()));
  children: CowScope[] = [];
  bucket: any[] = [];

  constructor(
    public name: string,
    public stack: CowNode[],
    public parent: CowScope | null = null,
  ) {
    if (parent) parent.children.push(this);
  }
}
