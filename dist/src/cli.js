import { COWFParser } from "./parser/COWFParser.js";
import { handleError } from "./utils/errorHandler.js";
import { readFileInChunks } from "./utils/fileUtils.js";
import { ArtfParser } from "./parser/Artf/ArtfParser.js";
/**
 * Runs the COWF CLI tool
 * @param filePath - The path to the COWF file
 * @param options - CLI options
 * @param options.verbose - If true, enables verbose logging
 * @param options.results - If true, logs results of the COWF parser
 * @param options.language - The language to use for ARTF parsing
 */
export async function runCLI(filePath, options = {}) {
    try {
        const parser = new COWFParser();
        const chunkGenerator = readFileInChunks(filePath);
        const resultGenerator = parser.parseStream(chunkGenerator);
        let sectionCount = 0;
        let results = [];
        for await (const result of resultGenerator) {
            sectionCount++;
            if (options.verbose) {
                console.log(`Parsed section ${sectionCount}:`);
            }
            if (options.logResult) {
                console.log(result);
            }
            if (options.results) {
                results.push(JSON.stringify(result));
            }
            // Handle ARTF parsing with specified language
            if (result.format === 'artf' && options.language) {
                const artfParser = new ArtfParser();
                const artfResult = await artfParser.execute(result.content, options.language);
                console.log('ARTF Execution Result:', artfResult);
            }
        }
        if (options.verbose) {
            console.log(`Parsed ${sectionCount} sections.`);
        }
        if (options.results) {
            console.log(results);
        }
    }
    catch (error) {
        handleError(error);
    }
}
