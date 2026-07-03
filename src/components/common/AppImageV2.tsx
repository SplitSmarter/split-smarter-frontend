import React, { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";
import { CACHE_FOLDER } from "@/src/constants/system";
import { ImageCacheManager } from "@/src/utils/system/ImageCacheManager";
import { deviceStore } from "@/src/store/deviceStore";

interface AppImageV2Props extends ExpoImageProps {
    id: string;
    url?: string | null;
    uri?: string | null;
    expiryInDays?: number;
    fallbackComponent?: React.ReactNode;
}

export const AppImageV2 = ({
                               id,
                               url,
                               uri,
                               expiryInDays = 7,
                               fallbackComponent,
                               placeholder = "|rF?hV%2WCj[ayj[a|j[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[",
                               transition = 200,
                               style,
                               ...props
                           }: AppImageV2Props) => {
    // 🚀 FIX 1: Initialize state directly with the local file fallback URI if the remote URL is not available.
    // This removes the layout rendering lag across state frame updates.
    const [source, setSource] = useState<{ uri: string } | null>(() => {
        if (!url && uri) return { uri };
        if (url && (url.startsWith('file://') || url.startsWith('content://') || url.startsWith('ph://'))) {
            return { uri: url };
        }
        return null;
    });

    const [error, setError] = useState(false);
    const platform = deviceStore((state) => state.platform);

    useEffect(() => {
        const triggerFallback = () => {
            if (uri) {
                setError(false);
                setSource({ uri });
            } else {
                setError(true);
            }
        };

        if (!url || url.startsWith('file://') || url.startsWith('content://') || url.startsWith('ph://')) {
            if (url) {
                setError(false);
                setSource({ uri: url });
            } else {
                triggerFallback();
            }
            return;
        }

        const processCache = async () => {
            const path = `${CACHE_FOLDER}${id}.png`;
            const localUri = platform === 'android' ? path : `file://${path}`;

            try {
                await ImageCacheManager.ensureCacheDir();
                const fileInfo = await FileSystem.getInfoAsync(path);

                let shouldDownload = !fileInfo.exists;

                if (fileInfo.exists && fileInfo.modificationTime) {
                    const ageInDays = (Date.now() - (fileInfo.modificationTime * 1000)) / (1000 * 3600 * 24);
                    if (ageInDays > expiryInDays) shouldDownload = true;
                }

                if (!shouldDownload) {
                    await ImageCacheManager.updateManifest(id);
                    setSource({ uri: localUri });
                } else {
                    const download = await FileSystem.downloadAsync(url, path);
                    if (download.status === 200) {
                        const sizeBytes = download.headers['Content-Length'] ? parseInt(download.headers['Content-Length']) : 0;
                        await ImageCacheManager.updateManifest(id, sizeBytes);
                        setSource({ uri: download.uri });
                    } else {
                        throw new Error("Download failed");
                    }
                }
            } catch (err) {
                const fileInfo = await FileSystem.getInfoAsync(path);
                if (fileInfo.exists) {
                    setSource({ uri: localUri });
                } else {
                    triggerFallback();
                }
            } finally {
                ImageCacheManager.purgeCache();
            }
        };

        processCache();
    }, [id, url, uri]);

    if (error && fallbackComponent) {
        return <>{fallbackComponent}</>;
    }

    return (
        <ExpoImage
            source={source}
            placeholder={placeholder}
            transition={transition}
            // 🚀 FIX 2: Explicitly pass width/height styles to override Native layout drops.
            style={[{ width: '100%', height: '100%' }, style]}
            {...props}
        />
    );
};