export function fromHex(hex: string): Buffer {
    return Buffer.from(hex, 'hex');
}

export function toHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex');
}

export function asciiToHex(ascii: string): string {
    return toHex(Buffer.from(ascii, 'ascii'));
}
