export class CowNode {
  index: number;
  private _next?: CowNode;
  private _prev?: CowNode;
  returnReg?: number;

  constructor(
    public code: string,
    public thisReg: number,
    public nextReg: number,
    public stack: CowNode[],
  ) {
    stack.push(this);
    this.index = stack.length - 1;
  }

  get next(): CowNode | undefined {
    if (this._next) return this._next;
    const nextNode = this.findNextReg(this.nextReg, this.index);
    if (nextNode) {
      this._next = nextNode;
      nextNode._prev = this;
    }
    return this._next;
  }

  get prev(): CowNode | undefined {
    return this._prev;
  }

  findNextReg(reg: number, i: number): CowNode | undefined {
    return this.stack.slice(i).find((s) => s.thisReg === reg);
  }

  findReg(reg: number): CowNode | undefined {
    return this.stack.find((s) => s.thisReg === reg);
  }

  removeNext() {
    if (this._next) this._next._prev = undefined;
    this._next = undefined;
  }

  removePrev() {
    if (this._prev) this._prev._next = undefined;
    this._prev = undefined;
  }
}
