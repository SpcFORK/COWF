import { CodeBlockExecutor } from "../../src/parser/Artf/CodeBlockExecutor";
import {
  ExecutableBlock,
  StackItem,
  StackType,
} from "../../src/parser/Artf/types";
describe("CodeBlockExecutor", () => {
  let executor: CodeBlockExecutor;

  beforeEach(() => {
    executor = new CodeBlockExecutor();
  });

  test("should add and retrieve executable blocks", () => {
    const block: ExecutableBlock = {
      language: "javascript",
      code: 'console.log("Hello");',
    };
    executor.addExecutableBlock(block);
    expect(executor.getExecutableBlocks()).toContainEqual(block);
  });

  test("should execute JavaScript code block", async () => {
    const block: ExecutableBlock = {
      language: "javascript",
      code: "return x + y;",
    };
    const variables = { x: 5, y: 3 };
    const context: StackItem[] = [];
    const result = await executor.executeCodeBlocks(
      [block],
      variables,
      context,
    );
    expect(result).toEqual(
      expect.arrayContaining([
        { type: StackType.code_block, value: "javascript: 8" },
      ]),
    );
  });

  test("should execute Python code block", async () => {
    const block: ExecutableBlock = { language: "python", code: "print(x * y)" };
    const variables = { x: 4, y: 7 };
    const context: StackItem[] = [];
    const result = await executor.executeCodeBlocks(
      [block],
      variables,
      context,
    );
    expect(result).toEqual(
      expect.arrayContaining([
        { type: StackType.code_block, value: "python: 28" },
      ]),
    );
  });

  test("should throw error for unsupported language", async () => {
    const block: ExecutableBlock = { language: "ruby", code: 'puts "Hello"' };
    const context: StackItem[] = [];
    await expect(
      executor.executeCodeBlocks([block], {}, context),
    ).rejects.toThrow("Unsupported language: ruby");
  });
});
