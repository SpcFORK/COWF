import { COWFParser } from "../../src/parser/COWFParser";
import { createResult } from "../../src/utils/base";

const content1 = `=) txt

Hello, world!

=) artf

=# a 23
=# b 7
a + b

=) js

const a = 23;
const b = 7;
console.log(a + b);

=) yaml

key1: value1
key2:
  nested1: 42
  nested2: true
`;

const content2 = `=) unsupported
Some content
`;

const content3 = `=) txt
=) artf
=) yaml
`;

describe("COWFParser", () => {
  let parser: COWFParser;

  beforeEach(() => {
    parser = new COWFParser();
  });

  test("should parse multiple COWF sections including YAML", () => {
    const results = parser.parse(content1);

    expect(results).toHaveLength(3);
    const [txtResult, artfResult, yamlResult] = results;

    expect(txtResult.format).toBe("txt");
    expect(artfResult.format).toBe("artf");
    expect(yamlResult.format).toBe("yaml");

    // Check YAML parsing result
    expect(yamlResult.content).toEqual(
      createResult("yaml", {
        key1: "value1",
        key2: {
          nested1: 42,
          nested2: true,
        },
      }),
    );
  });

  test("should throw error for unsupported format", () => {
    expect(() => parser.parse(content2)).toThrow(
      "Unsupported COWF format: unsupported",
    );
  });

  test("should handle empty sections", () => {
    const results = parser.parse(content3);
    expect(results).toHaveLength(3);
    results.forEach((result) => expect(result.content).toEqual({}));
  });
});
