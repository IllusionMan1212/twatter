import fs from "fs/promises";
import path from "path";

type DirType = "events" | "posts";

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
