export function encodeUint64BE(num: number): Buffer {
    const UINT_32_MAX = Math.pow(2, 32);

    const buf = Buffer.allocUnsafe(8);
    const offset = 0;

    const top = Math.floor(num / UINT_32_MAX);
    const rem = num - top * UINT_32_MAX;

    buf.writeUInt32BE(top, offset);
    buf.writeUInt32BE(rem, offset + 4);
    return buf;
}
