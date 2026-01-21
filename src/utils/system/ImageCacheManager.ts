import * as FileSystem from 'expo-file-system';
import { CACHE_FOLDER } from "@/src/constants/system";

const MANIFEST_PATH = `${CACHE_FOLDER}manifest.json`;
const MAX_CACHE_SIZE_MB = 50;

interface CacheEntry {
    id: string;
    lastAccessed: number;
    hitCount: number;
    size: number;
}

export const ImageCacheManager = {
    async ensureCacheDir() {
        const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
        }
    },

    async updateManifest(id: string, size: number = 0) {
        try {
            await this.ensureCacheDir(); // Check dir before writing manifest
            const content = await FileSystem.readAsStringAsync(MANIFEST_PATH).catch(() => "{}");
            const manifest: Record<string, CacheEntry> = JSON.parse(content);

            manifest[id] = {
                id,
                lastAccessed: Date.now(),
                hitCount: (manifest[id]?.hitCount || 0) + 1,
                size: size || manifest[id]?.size || 0
            };

            await FileSystem.writeAsStringAsync(MANIFEST_PATH, JSON.stringify(manifest));
        } catch (e) {
            console.error("Manifest update failed", e);
        }
    },

    async purgeCache() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
            if (!dirInfo.exists) return;

            const content = await FileSystem.readAsStringAsync(MANIFEST_PATH).catch(() => "{}");
            const manifest: Record<string, CacheEntry> = JSON.parse(content);

            // Calculate total size
            const entries = Object.values(manifest);
            const totalSize = entries.reduce((acc, curr) => acc + curr.size, 0);

            if (totalSize > MAX_CACHE_SIZE_MB * 1024 * 1024) {
                // Sort by frequency (primary) and recency (secondary)
                const sorted = entries.sort((a, b) => {
                    if (a.hitCount !== b.hitCount) return a.hitCount - b.hitCount;
                    return a.lastAccessed - b.lastAccessed;
                });

                // Remove the bottom 20% of low-usage files
                const toRemove = sorted.slice(0, Math.ceil(sorted.length * 0.2));
                for (const item of toRemove) {
                    await FileSystem.deleteAsync(`${CACHE_FOLDER}${item.id}.png`, { idempotent: true });
                    delete manifest[item.id];
                }
                await FileSystem.writeAsStringAsync(MANIFEST_PATH, JSON.stringify(manifest));
            }
        } catch (e) {
            console.warn("Cache purge failed", e);
        }
    }
};