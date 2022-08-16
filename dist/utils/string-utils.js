"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asciiToHex = exports.toHex = exports.fromHex = void 0;
const fromHex = (hex) => Buffer.from(hex, 'hex');
exports.fromHex = fromHex;
const toHex = (bytes) => Buffer.from(bytes).toString('hex');
exports.toHex = toHex;
const asciiToHex = (ascii) => (0, exports.toHex)(Buffer.from(ascii, 'ascii'));
exports.asciiToHex = asciiToHex;
