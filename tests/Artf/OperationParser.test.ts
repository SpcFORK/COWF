// tests/Artf/OperationParser.test.ts

import { OperationParser } from "../../src/parser/Artf/OperationParser";
import { SubroutineManager } from "../../src/parser/Artf/SubroutineManager";
import { StackItem, StackType } from "../../src/parser/Artf/types";

describe("OperationParser", () => {
  let parser: OperationParser;
  let stack: StackItem[];

  beforeEach(() => {
    parser = new OperationParser();
    stack = [];
  });

  test("should parse subroutine operations", () => {
    parser.parseOperationLine(":> addNumbers 5 3", stack);
    parser.parseOperationLine("x + y", stack);
    parser.parseOperationLine("<= result z * 2", stack);
    expect(stack).toEqual(
      expect.arrayContaining([
        SubroutineManager.createOperationStackItem(
          `${StackType.subroutine}:addNumbers:5,3`,
        ),
        SubroutineManager.createOperationStackItem("x + y"),
        SubroutineManager.createAssignmentStackItem("result z * 2"),
      ]),
    );
  });

  test("should parse subroutine call operation", () => {
    parser.parseOperationLine(":> addNumbers 5 3", stack);
    expect(parser.getOperations()).toEqual(
      expect.arrayContaining([`${StackType.subroutine}:addNumbers:5,3`]),
    );
  });

  test("should parse general operation", () => {
    parser.parseOperationLine("x + y", stack);
    expect(parser.getOperations()).toEqual(expect.arrayContaining(["x + y"]));
  });
});

test("should correctly identify operation types", () => {
  let parser = new OperationParser();
  expect(
    parser.parseOperation(`${StackType.subroutine}:addNumbers:5,3`),
  ).toEqual({
    type: StackType.subroutine,
    value: "addNumbers:5,3",
  });

  expect(parser.parseOperation("<= result x + y")).toEqual({
    type: StackType.assignment,
    value: "result x + y",
  });

  expect(parser.parseOperation("console.log(x)")).toEqual({
    type: StackType.general,
    value: "console.log(x)",
  });
});
