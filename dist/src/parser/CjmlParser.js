export class CjmlParser {
    parse(content) {
        const lines = content.trim().split("\n");
        const result = {};
        let currentObject = result;
        const objectStack = [result];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.endsWith("{")) {
                const key = trimmedLine.slice(0, -1).trim();
                currentObject[key] = {};
                objectStack.push(currentObject);
                currentObject = currentObject[key];
            }
            else if (trimmedLine === "}" || trimmedLine === "};") {
                objectStack.pop();
                currentObject = objectStack[objectStack.length - 1];
            }
            else if (trimmedLine.includes(":")) {
                const [key, value] = trimmedLine.split(":");
                currentObject[key.trim()] = this.parseValue(value.trim());
            }
            else if (trimmedLine.endsWith(";")) {
                // Handle empty objects or properties without values
                const key = trimmedLine.slice(0, -1).trim();
                if (!(key in currentObject)) {
                    currentObject[key] = "";
                }
            }
        }
        return {
            format: "cjml",
            content: result,
        };
    }
    parseValue(value) {
        if (value === "")
            return "";
        if (!isNaN(Number(value)))
            return Number(value);
        if (value.startsWith('"') && value.endsWith('"'))
            return value.slice(1, -1);
        return value;
    }
}
