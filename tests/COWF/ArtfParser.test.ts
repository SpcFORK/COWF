import { ArtfParser } from "../../src/parser/Artf/ArtfParser";
import { StackType } from "../../src/parser/Artf/types";

// describe("ArtfParser", () => {
//   let parser: ArtfParser;
//   let env = <any>{};

//   beforeEach(() => {
//     env = {};
//     parser = new ArtfParser(() => env);
//   });

//   test("should parse variables and operations", () => {
//     const content = `
//     =# x 10
//     =. y 3.14
//     =$ message "Hello, world!"
//     =] list 1 2 3
//     x + y
//     `;
//     const result = parser.parse(content);
//     expect(result.variables).toEqual({
//       x: 10,
//       y: 3.14,
//       message: "Hello, world!",
//       list: [1, 2, 3],
//     });

//     expect(result.stack).toEqual(
//       expect.arrayContaining([
//         { type: StackType.variable, value: "x = 10" },
//         { type: StackType.variable, value: "y = 3.14" },
//         { type: StackType.variable, value: 'message = "Hello, world!"' },
//         { type: StackType.variable, value: "list = [1,2,3]" },
//         { type: StackType.operation, value: "x + y" },
//       ]),
//     );
//   });

//   test("should parse and execute named language blocks with parameters", async () => {
//     const content = `
// =# x 10
// =# y 20
//   --- jsFunc a,b
//   == JavaScript a,b
//   console.log(a + b)
//   ==
//   ---
//   :> jsFunc x y
//     `;
//     const result = await parser.execute(content);
//     expect(result).toEqual(
//       expect.arrayContaining([
//         [StackType.variable, "a = 5"],
//         [StackType.variable, "b = 3"],
//         [StackType.code_block, "javascript: undefined"],
//       ]),
//     );
//   });

//   test("should parse and execute named language blocks with parameters", async () => {
//     const content = `
//   --- jsFunc a,b
//   == JavaScript a,b
//   console.log(a + b)
//   ==
//   ---
//   :> jsFunc 5 3
//     `;
//     const result = await parser.execute(content);
//     expect(result).toEqual(
//       expect.arrayContaining([
//         [StackType.variable, "a = 5"],
//         [StackType.variable, "b = 3"],
//         [StackType.code_block, "javascript: undefined"],
//       ]),
//     );
//   });

//   test("should handle nested named language blocks", async () => {
//     const content = `
//   --- outer a
//   =# b 2
//   :> inner a b
//   << result
//   ---

//   --- inner x y
//   == JavaScript x,y
//   return x * y;
//   ==
//   << result
//   ---

//   :> outer 5
//     `;
//     const result = await parser.execute(content);
//     expect(result).toEqual(
//       expect.arrayContaining([
//         [StackType.variable, "a = 5"],
//         [StackType.variable, "b = 2"],
//         [StackType.variable, "x = 5"],
//         [StackType.variable, "y = 2"],
//         [StackType.code_block, "javascript: 10"],
//         [StackType.return, "10"],
//       ]),
//     );
//   });

//   test("should handle subroutines with default parameter values", async () => {
//     const content = `
// --- greet name="World"
// <= message "Hello, " + name + "!"
// << message
// ---

// :> greet
// :> greet "John"
//     `;
//     const result = await parser.execute(content);
//     expect(result).toEqual(
//       expect.arrayContaining([
//         [StackType.variable, `name = "World"`],
//         [StackType.variable, `message = "Hello, World!"`],
//         [StackType.return, `"Hello, World!"`],
//         [StackType.variable, `name = "John"`],
//         [StackType.variable, `message = "Hello, John!"`],
//         [StackType.return, `"Hello, John!"`],
//       ]),
//     );
//   });

//   test("should handle async subroutines", async () => {
//     const content = `
//     --- $ asyncOperation
//     <= result await new Promise(resolve => resolve(1))
//     << result
//     ---

//     $> asyncOperation
//     `;
//     const result = await parser.execute(content);
//     expect(result).toEqual(
//       expect.arrayContaining([]),
//     );
//   });

//   test("should throw error on maximum recursion depth", async () => {
//     const content = `
//   --- recursiveFunction n
//   :> recursiveFunction n
//   << n
//   ---
//   :> recursiveFunction 1
//     `;
//     await expect(parser.execute(content)).rejects.toThrow(
//       "Maximum recursion depth exceeded",
//     );
//   });
// });
