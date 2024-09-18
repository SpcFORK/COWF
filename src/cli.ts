import { COWFParser } from "./parser/COWFParser.js";
import { COWFParseResult } from "./types/COWFTypes.js";
import { handleError } from "./utils/errorHandler.js";
import { readFileInChunks } from "./utils/fileUtils.js";
import { ArtfParser } from "./parser/Artf/ArtfParser.js";

/**
 * Runs the COWF CLI tool
 * @param filePath - The path to the COWF file
 * @param options - CLI options
 *
 * @param options.verbose - If true, enables verbose logging
 * @param options.results - If true, logs results of the COWF parser
 * @param options.language - The language to use for ARTF parsing
 * @param options.pretty - If true, pretty-prints the COWF AST
 * @param options.isGlobal - If true, enables global variables
 */
export async function runCLI(
  filePath: string,
  options: Partial<{
    verbose: boolean;
    logResult: boolean;
    results: boolean;
    language: string;
    pretty: boolean;
    isGlobal: boolean;
  }> = {},
): Promise<void> {
  try {
    const parser = new COWFParser();
    const chunkGenerator = readFileInChunks(filePath);
    const resultGenerator = parser.parseStream(chunkGenerator);

    let sectionCount = 0;
    let results: string[] = [];
    for await (const result of resultGenerator) {
      sectionCount++;

      if (options.verbose) {
        console.log(`Parsed section ${sectionCount}:`);
      }

      if (options.logResult) {
        console.log(result);
      }

      if (options.results) {
        results.push(JSON.stringify(result, null, options.pretty ? 2 : 0));
      }

      // Handle ARTF parsing with specified language
      if (result.format === "artf" && options.language) {
        const artfParser = new ArtfParser();
        const artfResult = await artfParser.execute(
          result.content,
          options.language,
        );
        console.log("ARTF Execution Result:", artfResult);
      }
    }

    if (options.verbose) {
      console.log(`Parsed ${sectionCount} sections.`);
    }

    if (options.results) {
      console.log(results);
    }
  } catch (error) {
    handleError(error as Error);
  }
}
