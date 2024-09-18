import { CodeBlockExecutor } from "../../src/parser/Artf/CodeBlockExecutor";
describe("CodeBlockExecutor", () => {
    let executor = new CodeBlockExecutor();
    beforeEach(() => {
        executor = new CodeBlockExecutor();
    });
    test("should add and retrieve executable blocks", () => {
        const block = {
            language: "javascript",
            code: 'console.log("Hello");',
        };
        executor.addExecutableBlock(block);
        expect(executor.getExecutableBlocks()).toContainEqual(block);
    });
    test("should execute JavaScript code block", async () => {
        const block = {
            language: "javascript",
            code: "return x + y;",
        };
        const variables = { x: 5, y: 3 };
        const result = await executor.executeCodeBlocks([block], variables);
        expect(result).toEqual([{ type: "code_block", value: "JavaScript: 8" }]);
    });
    test("should execute Python code block", async () => {
        const block = { language: "python", code: "print(x * y)" };
        const variables = { x: 4, y: 7 };
        const result = await executor.executeCodeBlocks([block], variables);
        expect(result).toEqual([{ type: "code_block", value: "Python: 28" }]);
    });
    test("should throw error for unsupported language", async () => {
        const block = { language: "ruby", code: 'puts "Hello"' };
        await expect(executor.executeCodeBlocks([block], {})).rejects.toThrow("Unsupported language: ruby");
    });
});
