import { CtxtParser } from "./CtxtParser";
import { ArtfParser } from "./Artf/ArtfParser";
import { HtmfParser } from "./HtmfParser";
import { RoutParser } from "./RoutParser";
import { YamlParser } from "./YamlParser";
export class COWFParser {
    constructor() {
        this.parsers = new Map();
        this.sectionMarker = "=)";
        this.buffer = "";
        this.bufferSize = 100 * 1024 * 1024; // 100MB
        this.circularBuffer = new Array(20).fill("");
        this.currentBufferIndex = 0;
        Object.entries(COWFParser.parsersMap).forEach(([format, ParserClass]) => this.parsers.set(format, new ParserClass()));
    }
    parse(content) {
        return Array.from(this.parseIterator(content));
    }
    async *parseStream(chunks) {
        for await (const chunk of chunks) {
            yield* this.processChunk(chunk);
        }
        if (this.buffer.trim() !== "") {
            yield* this.processBuffer(true);
        }
    }
    *parseIterator(content) {
        let start = 0;
        let end = content.indexOf(this.sectionMarker, start);
        while (end !== -1) {
            const section = content.slice(start, end).trim();
            if (section !== "") {
                yield this.parseSection(section);
            }
            start = end + this.sectionMarker.length;
            end = content.indexOf(this.sectionMarker, start);
        }
        const lastSection = content.slice(start).trim();
        if (lastSection !== "") {
            yield this.parseSection(lastSection);
        }
    }
    *processChunk(chunk) {
        this.addToCircularBuffer(chunk);
        this.buffer += chunk;
        yield* this.processBuffer(false);
    }
    addToCircularBuffer(chunk) {
        this.circularBuffer[this.currentBufferIndex] = chunk;
        this.currentBufferIndex =
            (this.currentBufferIndex + 1) % this.circularBuffer.length;
    }
    *processBuffer(isLastChunk) {
        let sectionEnd = this.buffer.indexOf(this.sectionMarker);
        while (sectionEnd !== -1) {
            const section = this.buffer.slice(0, sectionEnd).trim();
            if (section !== "") {
                yield this.parseSection(section);
            }
            this.buffer = this.buffer.slice(sectionEnd + this.sectionMarker.length);
            sectionEnd = this.buffer.indexOf(this.sectionMarker);
            if (this.buffer.length > this.bufferSize) {
                this.buffer = this.buffer.slice(-this.bufferSize);
            }
        }
        if (isLastChunk && this.buffer.trim() !== "") {
            yield this.parseSection(this.buffer.trim());
            this.buffer = "";
        }
    }
    parseSection(section) {
        const firstNewlineIndex = section.indexOf("\n");
        const format = (firstNewlineIndex !== -1
            ? section.slice(0, firstNewlineIndex)
            : section).trim();
        const parser = this.parsers.get(format);
        if (!parser) {
            throw new Error(`Unsupported COWF format: ${format}`);
        }
        try {
            const content = firstNewlineIndex !== -1
                ? section.slice(firstNewlineIndex + 1).trim()
                : "";
            const parseResult = content === "" ? {} : parser.parse(content);
            return { format, content: parseResult };
        }
        catch (error) {
            console.error(`Error parsing ${format} section: ${error.message}`);
            throw error;
        }
    }
    getCircularBufferContent() {
        return this.circularBuffer.join("");
    }
}
COWFParser.parsersMap = {
    txt: CtxtParser,
    artf: ArtfParser,
    htmf: HtmfParser,
    rout: RoutParser,
    yaml: YamlParser,
};
