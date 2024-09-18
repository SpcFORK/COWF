export class CtxtParser {
    parse(content) {
        const lines = content.trim().split('\n');
        const body = lines.join('\n');
        return {
            format: 'txt',
            content: body
        };
    }
}
