export function createResultBase({ format = "none", content = Array.from(arguments), }) {
    return { format, content };
}
export function createResult(format, content) {
    return createResultBase({ format, content });
}
