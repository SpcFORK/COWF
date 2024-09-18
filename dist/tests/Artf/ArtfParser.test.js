import { ArtfParser } from "../../src/parser/Artf/ArtfParser";
describe("ArtfParser", () => {
    let parser = new ArtfParser();
    beforeEach(() => {
        parser = new ArtfParser();
    });
    test("should parse variables and operations", () => {
        const content = `
=# x 10
=. y 3.14
=$ message "Hello, world!"
=] list 1 2 3
x + y
    `;
        const result = parser.parse(content);
        expect(result.format).toBe("artf");
        expect(result.content.variables).toEqual({
            x: 10,
            y: 3.14,
            message: "Hello, world!",
            list: [1, 2, 3],
        });
        expect(result.content.operations).toEqual(["x + y"]);
    });
    test("should parse and execute subroutines with parameters", async () => {
        const content = `
=# x 5
=# y 3

--- addNumbers a b
<= result a + b
<< result
@@

:> addNumbers x y
console.log(result)
    `;
        const parseResult = parser.parse(content);
        expect(parseResult.format).toBe("artf");
        expect(parseResult.content.subroutines).toHaveProperty("addNumbers");
        expect(parseResult.content.operations).toContain("callSubroutine:addNumbers:x,y");
        const executionResult = await parser.execute(content);
        expect(executionResult).toEqual([
            ["variable", "x = 5"],
            ["variable", "y = 3"],
            ["subroutine", "Executing subroutine: addNumbers"],
            ["variable", "a = 5"],
            ["variable", "b = 3"],
            ["variable", "result = 8"],
            ["return", "8"],
            ["code_block", "JavaScript: undefined"],
        ]);
    });
    test("should handle nested subroutine calls", async () => {
        const content = `
--- outer a
=# b 2
:> inner a b
<< result
@@

--- inner x y
<= result x * y
<< result
@@

:> outer 5
console.log(result)
    `;
        const executionResult = await parser.execute(content);
        expect(executionResult).toEqual([
            ["subroutine", "Executing subroutine: outer"],
            ["variable", "a = 5"],
            ["variable", "b = 2"],
            ["subroutine", "Executing subroutine: inner"],
            ["variable", "x = 5"],
            ["variable", "y = 2"],
            ["variable", "result = 10"],
            ["return", "10"],
            ["return", "10"],
            ["code_block", "JavaScript: undefined"],
        ]);
    });
    test("should execute JavaScript code", async () => {
        const content = `
=# x 10
=# y 20
== JavaScript
console.log(x + y)
==
    `;
        const result = await parser.execute(content, "JavaScript");
        expect(result).toEqual([
            ["variable", "x = 10"],
            ["variable", "y = 20"],
            ["code_block", "JavaScript: undefined"],
        ]);
    });
    test("should execute Python code", async () => {
        const content = `
=# x 10
=# y 20
== Python
print(x * y)
==
    `;
        const result = await parser.execute(content, "Python");
        expect(result).toEqual([
            ["variable", "x = 10"],
            ["variable", "y = 20"],
            ["code_block", "Python: 200"],
        ]);
    });
    test("should handle complex subroutine execution", async () => {
        const content = `
--- calculateSum numbers
=# total 0
=] numbers 1 2 3 4 5
== JavaScript
for (let num of numbers) {
  total += num;
}
==
<< total
@@

:> calculateSum [1, 2, 3, 4, 5]
console.log(result)
    `;
        const executionResult = await parser.execute(content);
        expect(executionResult).toEqual([
            ["subroutine", "Executing subroutine: calculateSum"],
            ["variable", "numbers = [1,2,3,4,5]"],
            ["variable", "total = 0"],
            ["code_block", "JavaScript: undefined"],
            ["return", "15"],
            ["code_block", "JavaScript: undefined"],
        ]);
    });
    test("should handle subroutines with default parameter values", async () => {
        const content = `
--- greet name="World"
<= message "Hello, " + name + "!"
<< message
@@

:> greet
:> greet "John"
    `;
        const executionResult = await parser.execute(content);
        expect(executionResult).toEqual([
            ["subroutine", "Executing subroutine: greet"],
            ["variable", 'name = "World"'],
            ["variable", 'message = "Hello, World!"'],
            ["return", '"Hello, World!"'],
            ["subroutine", "Executing subroutine: greet"],
            ["variable", 'name = "John"'],
            ["variable", 'message = "Hello, John!"'],
            ["return", '"Hello, John!"'],
        ]);
    });
    test("should handle async subroutines", async () => {
        const content = `
--- $ asyncOperation
<= result await new Promise(resolve => setTimeout(() => resolve("Async result"), 100))
<< result
@@

$> asyncOperation
console.log(result)
    `;
        const executionResult = await parser.execute(content);
        expect(executionResult).toEqual([
            ["asyncSubroutine", "Executing async subroutine: asyncOperation"],
            ["variable", 'result = "Async result"'],
            ["return", '"Async result"'],
            ["code_block", "JavaScript: undefined"],
        ]);
    });
    test("should throw error on maximum recursion depth", async () => {
        const content = `
--- recursiveFunction n
:> recursiveFunction n
<< n
@@

:> recursiveFunction 1
    `;
        await expect(parser.execute(content)).rejects.toThrow("Maximum recursion depth exceeded");
    });
});
