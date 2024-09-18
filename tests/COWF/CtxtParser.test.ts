import { CtxtParser } from "../../src/parser/CtxtParser";

const content1 = "Hello, world!";
const content2 = `Line 1
Line 2
Line 3`;
const content3 = "  \n  Hello, world!  \n  ";
const content4 = "";

describe("CtxtParser", () => {
  let parser: CtxtParser;
  let env = <any>{}

  beforeEach(() => {
    env = {}
    parser = new CtxtParser(() => env);
  });

  test("should parse simple text content", () => {
    const result = parser.parse(content1);
    expect(result.format).toBe("ctxt");
    expect(result.content).toBe(content1);
  });

  test("should handle multi-line text content", () => {
    const result = parser.parse(content2);
    expect(result.format).toBe("ctxt");
    expect(result.content).toBe(content2);
  });

  test("should trim leading and trailing whitespace", () => {
    const result = parser.parse(content3);
    expect(result.format).toBe("ctxt");
    expect(result.content).toBe(content1);
  });

  test("should return empty string for empty input", () => {
    const result = parser.parse(content4);
    expect(result.format).toBe("ctxt");
    expect(result.content).toBe("");
  });
});
