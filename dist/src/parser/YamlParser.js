export class YamlParser {
    parse(content) {
        const lines = content.trim().split('\n');
        const result = {};
        let currentObject = result;
        let indentStack = [result];
        let currentIndent = 0;
        for (const line of lines) {
            if (line.trim().startsWith('#'))
                continue; // Skip comments
            const match = line.match(/^(\s*)(.+?):\s*(.*)$/);
            if (match) {
                const [, indent, key, value] = match;
                const indentLevel = indent.length;
                if (indentLevel > currentIndent) {
                    indentStack.push(currentObject);
                    currentObject = currentObject[Object.keys(currentObject).pop()] = {};
                }
                else if (indentLevel < currentIndent) {
                    while (indentLevel < currentIndent) {
                        currentObject = indentStack.pop();
                        currentIndent -= 2;
                    }
                }
                currentObject[key] = this.parseValue(value);
                currentIndent = indentLevel;
            }
        }
        return {
            format: 'yaml',
            content: result
        };
    }
    parseValue(value) {
        if (value === '')
            return null;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        if (value === 'null')
            return null;
        if (!isNaN(Number(value)))
            return Number(value);
        if (value.startsWith('"') && value.endsWith('"'))
            return value.slice(1, -1);
        return value;
    }
}
