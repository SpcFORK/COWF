import { SubroutineManager } from "../../src/parser/Artf/SubroutineManager";

describe("SubroutineManager", () => {
  let manager: SubroutineManager;

  beforeEach(() => {
    manager = new SubroutineManager();
  });

  test("should parse subroutine definition", () => {
    manager.parseSubroutineDefinition(`
--- addNumbers a b
`);
    const subroutine = manager.getSubroutine("addNumbers");
    expect(subroutine).toBeDefined();
    expect(subroutine?.params).toEqual([{ name: "a" }, { name: "b" }]);
  });

  test("should add lines to subroutine", () => {
    manager.parseSubroutineDefinition(`
--- addNumbers a b
<= result a + b
<< result
`);
    const subroutine = manager.getSubroutine("addNumbers");
    expect(subroutine?.code).toBe("<= result a + b\n<< result\n");
  });

  test("should throw error when adding line to non-existent subroutine", () => {
    expect(() => {
      manager.addLineToSubroutine("nonExistent", "some code");
    }).toThrow("Subroutine 'nonExistent' not found");
  });

  test("should get subroutine name from definition line", () => {
    const name = manager.getSubroutineName(`--- calculateSum x y z`);
    expect(name).toBe("calculateSum");
  });

  test("should get all subroutines", () => {
    manager.parseSubroutineDefinition(`
--- addNumbers a b
<= result a + b
<< result
---
--- multiplyNumbers x y
<= result x * y
<< result
`);
    const allSubroutines = manager.getAllSubroutines();
    expect(Object.keys(allSubroutines)).toHaveLength(2);
    expect(allSubroutines).toHaveProperty("addNumbers");
    expect(allSubroutines).toHaveProperty("multiplyNumbers");
  });

  test("should parse single line routine with arguments", () => {
    manager.parseSubroutineDefinition(`
--- SomeRoutine x
=# aValue x
--> SingleLineRoutine <arg1 arg2> code + arg1 + arg2
---
`);
    const subroutine = manager.getSubroutine("SomeRoutine");
    expect(subroutine?.code).toContain(
      "SingleLineRoutine <arg1 arg2> code + arg1 + arg2",
    );
  });

  test("should handle single line routine from the next non-empty line", () => {
    manager.parseSubroutineDefinition(`
--- AnotherRoutine x
=# anotherValue x
--> singleLine
code + anotherValue
---
`);
    const subroutine = manager.getSubroutine("AnotherRoutine");
    expect(subroutine).toBeDefined();
    expect(subroutine?.code).toContain("<= singleLine");
    expect(subroutine?.code).toContain("code + anotherValue");
  });

  test("should throw error when single line routine is missing code", () => {
    expect(() => {
      manager.parseSubroutineDefinition(`
--- BadRoutine x
--> 
`);
    }).toThrow("Single line routine is missing code.");
  });
});