import { StackType } from "../../src/parser/Artf/types";
import { VariableParser } from "../../src/parser/Artf/VariableParser";

describe("VariableParser", () => {
  let parser: VariableParser;

  beforeEach(() => {
    parser = new VariableParser();
  });

  test("should parse integer variables", () => {
    parser.parseVariable("=# x 10");
    expect(parser.getVariables()).toEqual({ x: 10 });
  });

  test("should parse float variables", () => {
    parser.parseVariable("=. y 3.14");
    expect(parser.getVariables()).toEqual({ y: 3.14 });
  });

  test("should parse string variables", () => {
    parser.parseVariable('=$ message "Hello, world!"');
    expect(parser.getVariables()).toEqual({ message: "Hello, world!" });
  });

  test("should parse array variables", () => {
    parser.parseVariable("=] numbers 1 2 3 4 5");
    expect(parser.getVariables()).toEqual({ numbers: [1, 2, 3, 4, 5] });
  });

  test("should update variables and return correct stack item", () => {
    const result = parser.updateVariables("x", 42);
    expect(result).toEqual({
      type: StackType.variable,
      value: "x = 42",
    });
    expect(parser.getVariables()).toEqual({ x: 42 });
  });

  test("should get all variables after multiple parse operations", () => {
    parser.parseVariable("=# a 1");
    parser.parseVariable("=. b 2.5");
    parser.parseVariable('=$ c "test"');
    parser.parseVariable("=] d 3 4 5");
    expect(parser.getVariables()).toEqual({
      a: 1,
      b: 2.5,
      c: "test",
      d: [3, 4, 5],
    });
  });

  test("should return correct StackItem when updating variables", () => {
    const result = parser.updateVariables("x", 42);
    expect(result).toEqual({
      type: StackType.variable,
      value: "x = 42",
    });
  });

  test("should handle boolean and null values", () => {
    parser.parseVariable("=# bool_true true");
    parser.parseVariable("=# bool_false false");
    parser.parseVariable("=# null_value null");
    expect(parser.getVariables()).toEqual({
      bool_true: true,
      bool_false: false,
      null_value: null,
    });
  });

  test("should handle complex nested structures", () => {
    parser.parseVariable('=] nested 1 "two" true null');
    expect(parser.getVariables()).toEqual({
      nested: [1, "two", true, null],
    });
  });
});
