import fs from "fs";
import path from "path";
import axios from "axios";

export const setIcon = async (
    identifier: string,
    name: string,
    url: string
): Promise<string | null> => {
    const type = identifier.toLowerCase();
    const dir = path.resolve("public", "icons", type);
    const filePath = path.join(dir, `${name}.png`);

    try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, response.data);

        return `/icons/${type}/${name}.png`; // Web-accessible path
    } catch (err) {
        console.error("Failed to set icon:", err);
        return null;
    }
};

export const removeIcon = (identifier: string, name: string): boolean => {
    const type = identifier.toLowerCase();
    const filePath = path.resolve("public", "icons", type, `${name}.png`);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
    } catch (err) {
        console.error("Failed to remove icon:", err);
    }

    return false;
};
