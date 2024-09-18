import { YamlParser } from '../../src/parser/YamlParser';
describe('YamlParser', () => {
    let parser = new YamlParser();
    beforeEach(() => {
        parser = new YamlParser();
    });
    test('should parse simple YAML content', () => {
        const content = `
  key1: value1
  key2: 42
  key3: true
  key4: null
    `;
        const result = parser.parse(content);
        expect(result.format).toBe('yaml');
        expect(result.content).toEqual({
            key1: 'value1',
            key2: 42,
            key3: true,
            key4: null
        });
    });
    test('should handle nested YAML content', () => {
        const content = `
  parent:
  child1: value1
  child2:
    grandchild1: 42
    grandchild2: true
  sibling: hello
    `;
        const result = parser.parse(content);
        expect(result.format).toBe('yaml');
        expect(result.content).toEqual({
            parent: {
                child1: 'value1',
                child2: {
                    grandchild1: 42,
                    grandchild2: true
                }
            },
            sibling: 'hello'
        });
    });
    test('should ignore comments', () => {
        const content = `
  # This is a comment
  key1: value1
  # Another comment
  key2: 42
    `;
        const result = parser.parse(content);
        expect(result.format).toBe('yaml');
        expect(result.content).toEqual({
            key1: 'value1',
            key2: 42
        });
    });
});
