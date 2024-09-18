"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileInChunks = exports.readFile = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
async function readFile(filePath) {
    try {
        return await fs_1.promises.readFile(path.resolve(filePath), "utf-8");
    }
    catch (error) {
        throw new Error(`Error reading file: ${error.message}`);
    }
}
exports.readFile = readFile;
async function* readFileInChunks(filePath) {
    try {
        const fileStream = await fs_1.promises.open(path.resolve(filePath), "r");
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
exports.readFileInChunks = readFileInChunks;
