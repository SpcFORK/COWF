import { OperationParser } from "../../src/parser/Artf/OperationParser";
describe("OperationParser", () => {
    let parser = new OperationParser();
    beforeEach(() => {
        parser = new OperationParser();
    });
    test("should parse subroutine call operation", () => {
        parser.parseOperationLine(":> addNumbers 5 3");
        expect(parser.getOperations()).toContain("callSubroutine:addNumbers:5,3");
    });
    test("should parse general operation", () => {
        parser.parseOperationLine("x + y");
        expect(parser.getOperations()).toContain("x + y");
    });
    test("should correctly identify operation types", () => {
        expect(parser.parseOperation("callSubroutine:addNumbers:5,3")).toEqual({
            type: "subroutine",
            value: "addNumbers:5,3",
        });
        expect(parser.parseOperation("<= result x + y")).toEqual({
            type: "assignment",
            value: "result x + y",
        });
        expect(parser.parseOperation("console.log(x)")).toEqual({
            type: "general",
            value: "console.log(x)",
        });
    });
    test("should handle multiple operations", () => {
        parser.parseOperationLine(":> addNumbers 5 3");
        parser.parseOperationLine("x + y");
        parser.parseOperationLine("<= result z * 2");
        const operations = parser.getOperations();
        expect(operations).toContain("callSubroutine:addNumbers:5,3");
        expect(operations).toContain("x + y");
        expect(operations).toContain("<= result z * 2");
    });
});
