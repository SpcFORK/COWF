import { COWFParser } from "../../src/parser/COWFParser";
import { createResult } from "../../src/utils/base";
describe("COWFParser", () => {
    let parser = new COWFParser();
    beforeEach(() => {
        parser = new COWFParser();
    });
    test("should parse multiple COWF sections including YAML", () => {
        const content = `=) txt

Hello, world!

=) artf

=# a 23
=# b 7
a + b

=) yaml

key1: value1
key2:
  nested1: 42
  nested2: true
`;
        const results = parser.parse(content);
        expect(results).toHaveLength(3);
        const [txtResult, artfResult, yamlResult] = results;
        expect(txtResult.format).toBe("txt");
        expect(artfResult.format).toBe("artf");
        expect(yamlResult.format).toBe("yaml");
        // Check YAML parsing result
        expect(yamlResult.content).toEqual(createResult("yaml", {
            key1: "value1",
            key2: {
                nested1: 42,
                nested2: true,
            },
        }));
    });
    test("should throw error for unsupported format", () => {
        const content = `=) unsupported
Some content
`;
        expect(() => parser.parse(content)).toThrow("Unsupported COWF format: unsupported");
    });
    test("should handle empty sections", () => {
        const content = `=) txt
=) artf
=) yaml
`;
        const results = parser.parse(content);
        expect(results).toHaveLength(3);
        results.forEach((result) => expect(result.content).toEqual({}));
    });
});
