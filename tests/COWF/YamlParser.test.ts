import { YamlParser } from "../../src/parser/YamlParser";

const content1 = `
key1: value1
key2: 42
key3: true
key4: null
`;

const content2 = `
parent:
  child1: value1
  child2:
    grandchild1: 42
    grandchild2: true
sibling: hello
`;

const content3 = `
# This is a comment
key1: value1
# Another comment
key2: 42
`;

describe("YamlParser", () => {
  let parser: YamlParser;
  let env = <any>{};

  beforeEach(() => {
    env = {};
    parser = new YamlParser(() => env);
  });

  test("should parse simple YAML content", () => {
    const result = parser.parse(content1);
    expect(result.format).toBe("yaml");
    expect(result.content).toEqual({
      key1: "value1",
      key2: 42,
      key3: true,
      key4: null,
    });
  });

  test("should handle nested YAML content", () => {
    const result = parser.parse(content2);
    expect(result.format).toBe("yaml");
    expect(result.content).toEqual({
      parent: {
        child1: "value1",
        child2: {
          grandchild1: 42,
          grandchild2: true,
        },
      },
      sibling: "hello",
    });
  });

  test("should ignore comments", () => {
    const result = parser.parse(content3);
    expect(result.format).toBe("yaml");
    expect(result.content).toEqual({
      key1: "value1",
      key2: 42,
    });
  });
});
