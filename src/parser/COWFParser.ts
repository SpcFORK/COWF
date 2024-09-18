import { CtxtParser } from "./CtxtParser";
import { ArtfParser } from "./Artf/ArtfParser";
import { HtmfParser } from "./HtmfParser";
import { RoutParser } from "./RoutParser";
import { YamlParser } from "./YamlParser";
import { PYParser } from "./PYParser";
import { JSParser } from "./JSParser";
import { COWFFormat, COWFParseResult } from "../types/COWFTypes";

export class COWFParser {
  private parsers: Map<COWFFormat, any> = new Map();
  private sectionMarker: string = "=)";
  private buffer: string = "";
  private bufferSize: number = 100 * 1024 * 1024; // 100MB
  private circularBuffer: string[] = new Array(20).fill("");
  private currentBufferIndex: number = 0;

  private ENV: Record<string, any> = {};

  static parsersMap = {
    txt: CtxtParser,
    artf: ArtfParser,
    htmf: HtmfParser,
    rout: RoutParser,
    yaml: YamlParser,
    py: PYParser,
    js: JSParser,
  };

  constructor() {
    Object.entries(COWFParser.parsersMap).forEach(([format, ParserClass]: any[]) =>
      this.parsers.set(format as COWFFormat, new ParserClass(() => this.ENV)),
    );
  }

  parse<T = any>(content: string): COWFParseResult<T>[] {
    return Array.from(this.parseIterator(content));
  }

  async *parseStream<T = any>(
    chunks: AsyncIterable<string>,
  ): AsyncGenerator<COWFParseResult<T>> {
    for await (const chunk of chunks) {
      yield* this.processChunk<T>(chunk);
    }

    if (this.buffer.trim() !== "") {
      yield* this.processBuffer<T>(true);
    }
  }

  private *parseIterator(content: string): Generator<COWFParseResult> {
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

  private *processChunk<T = any>(chunk: string): Generator<COWFParseResult<T>> {
    this.addToCircularBuffer(chunk);
    this.buffer += chunk;
    yield* this.processBuffer(false);
  }

  private addToCircularBuffer(chunk: string): void {
    this.circularBuffer[this.currentBufferIndex] = chunk;
    this.currentBufferIndex =
      (this.currentBufferIndex + 1) % this.circularBuffer.length;
  }

  private *processBuffer<T = any>(
    isLastChunk: boolean,
  ): Generator<COWFParseResult<T>> {
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

  private parseSection<T = any>(section: string): COWFParseResult<T> {
    const firstNewlineIndex = section.indexOf("\n");
    const format = (
      firstNewlineIndex !== -1 ? section.slice(0, firstNewlineIndex) : section
    ).trim() as COWFFormat;

    const parser = this.parsers.get(format);

    if (!parser) {
      throw new Error(`Unsupported COWF format: ${format}`);
    }

    try {
      const content =
        firstNewlineIndex !== -1
          ? section.slice(firstNewlineIndex + 1).trim()
          : "";
      const parseResult = content === "" ? {} : parser.parse(content);
      return { format, content: parseResult };
    } catch (error) {
      console.error(
        `Error parsing ${format} section: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  public getCircularBufferContent(): string {
    return this.circularBuffer.join("");
  }
}
