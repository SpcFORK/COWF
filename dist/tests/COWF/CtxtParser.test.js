import { CtxtParser } from '../../src/parser/CtxtParser';
describe('CtxtParser', () => {
    let parser = new CtxtParser();
    beforeEach(() => {
        parser = new CtxtParser();
    });
    test('should parse simple text content', () => {
        const content = 'Hello, world!';
        const result = parser.parse(content);
        expect(result.format).toBe('txt');
        expect(result.content).toBe('Hello, world!');
    });
    test('should handle multi-line text content', () => {
        const content = `Line 1
  Line 2
  Line 3`;
        const result = parser.parse(content);
        expect(result.format).toBe('txt');
        expect(result.content).toBe(content);
    });
    test('should trim leading and trailing whitespace', () => {
        const content = '  \n  Hello, world!  \n  ';
        const result = parser.parse(content);
        expect(result.format).toBe('txt');
        expect(result.content).toBe('Hello, world!');
    });
    test('should return empty string for empty input', () => {
        const content = '';
        const result = parser.parse(content);
        expect(result.format).toBe('txt');
        expect(result.content).toBe('');
    });
});
