import { SubroutineManager } from "../../src/parser/Artf/SubroutineManager";
describe("SubroutineManager", () => {
    let manager = new SubroutineManager();
    beforeEach(() => {
        manager = new SubroutineManager();
    });
    test("should parse subroutine definition", () => {
        manager.parseSubroutineDefinition("--- addNumbers a b");
        const subroutine = manager.getSubroutine("addNumbers");
        expect(subroutine).toBeDefined();
        expect(subroutine === null || subroutine === void 0 ? void 0 : subroutine.params).toEqual(["a", "b"]);
    });
    test("should add lines to subroutine", () => {
        manager.parseSubroutineDefinition("--- addNumbers a b");
        manager.addLineToSubroutine("addNumbers", "<= result a + b");
        manager.addLineToSubroutine("addNumbers", "<< result");
        const subroutine = manager.getSubroutine("addNumbers");
        expect(subroutine === null || subroutine === void 0 ? void 0 : subroutine.code).toBe("<= result a + b\n<< result\n");
    });
    test("should throw error when adding line to non-existent subroutine", () => {
        expect(() => {
            manager.addLineToSubroutine("nonExistent", "some code");
        }).toThrow("Subroutine 'nonExistent' not found");
    });
    test("should get subroutine name from definition line", () => {
        const name = manager.getSubroutineName("--- calculateSum x y z");
        expect(name).toBe("calculateSum");
    });
    test("should get all subroutines", () => {
        manager.parseSubroutineDefinition("--- addNumbers a b");
        manager.parseSubroutineDefinition("--- multiplyNumbers x y");
        const allSubroutines = manager.getAllSubroutines();
        expect(Object.keys(allSubroutines)).toHaveLength(2);
        expect(allSubroutines).toHaveProperty("addNumbers");
        expect(allSubroutines).toHaveProperty("multiplyNumbers");
    });
});
