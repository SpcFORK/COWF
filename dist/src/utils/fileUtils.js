import { promises as fs } from "fs";
import * as path from "path";
export async function readFile(filePath) {
    try {
        return await fs.readFile(path.resolve(filePath), "utf-8");
    }
    catch (error) {
        throw new Error(`Error reading file: ${error.message}`);
    }
}
export async function* readFileInChunks(filePath) {
    try {
        const fileStream = await fs.open(path.resolve(filePath), "r");
        const readChunkSize = 1024;
        const buffer = Buffer.alloc(readChunkSize);
        while (true) {
            const { bytesRead } = await fileStream.read(buffer, 0, readChunkSize, null);
            if (bytesRead === 0)
                break;
            yield buffer.subarray(0, bytesRead).toString("utf-8");
        }
        await fileStream.close();
    }
    catch (error) {
        throw new Error(`Error reading file: ${error.message}`);
    }
}
