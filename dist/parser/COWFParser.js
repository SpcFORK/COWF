"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COWFParser = void 0;
const CtxtParser_1 = require("./CtxtParser");
const ArtfParser_1 = require("./Artf/ArtfParser");
const HtmfParser_1 = require("./HtmfParser");
const RoutParser_1 = require("./RoutParser");
const YamlParser_1 = require("./YamlParser");
const PYParser_1 = require("./PYParser");
const JSParser_1 = require("./JSParser");
class COWFParser {
    constructor() {
        this.parsers = new Map();
        this.sectionMarker = "=)";
        this.buffer = "";
        this.bufferSize = 100 * 1024 * 1024; // 100MB
        this.circularBuffer = new Array(20).fill("");
        this.currentBufferIndex = 0;
        this.ENV = {};
        Object.entries(COWFParser.parsersMap).forEach(([format, ParserClass]) => this.parsers.set(format, new ParserClass(() => this.ENV)));
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
        const format = (firstNewlineIndex !== -1 ? section.slice(0, firstNewlineIndex) : section).trim();
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
exports.COWFParser = COWFParser;
COWFParser.parsersMap = {
    txt: CtxtParser_1.CtxtParser,
    artf: ArtfParser_1.ArtfParser,
    htmf: HtmfParser_1.HtmfParser,
    rout: RoutParser_1.RoutParser,
    yaml: YamlParser_1.YamlParser,
    py: PYParser_1.PYParser,
    js: JSParser_1.JSParser,
};
