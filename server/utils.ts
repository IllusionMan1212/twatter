import fs from "fs/promises";
import path from "path";
type DirType = "events" | "posts";

export const Magic = {
    PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    GIF87a: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    GIF89a: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
};

export const traversalSafeRm = async (type: DirType, filepath: string) => {
    // if the filepath contains a slash or an encoded slash then stop.
    if (filepath.match(/\/|%2F/gi) !== null) {
        return;
    }

    await fs.rm(path.join(__dirname, `cdn/${type}`, filepath), {
        force: true,
        recursive: true,
    });
};

function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function tsEnumToPrismaEnum<T>(tsEnum: T, value: string): string {
    const entry = Object.entries(tsEnum as ArrayLike<string>).filter(([_, _value]) => _value == value)[0];
    if (typeof entry === "undefined") return "";
    return entry[0];
}
