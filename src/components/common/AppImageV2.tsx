import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {Image as ExpoImage, ImageProps as ExpoImageProps} from 'expo-image';
import {Iconify} from 'react-native-iconify';
import {CACHE_FOLDER} from '@/src/constants/system';
import {ImageCacheManager} from '@/src/utils/system/ImageCacheManager';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

function isLocalUri(value: string): boolean {
    return (
        value.startsWith('file://') ||
        value.startsWith('content://') ||
        value.startsWith('ph://')
    );
}

interface AppImageV2Props extends ExpoImageProps {
    id: string;
    url?: string | null;
    uri?: string | null;
    expiryInDays?: number;
    /** Explicit entity fallback (e.g. EntityFallbackIcon). When omitted, uses built-in photo. */
    fallbackComponent?: React.ReactNode;
}

/**
 * Disk-backed image aligned with AppImage category-icon stability:
 * paint the remote URI immediately (expo-image memory-disk), no blurhash /
 * crossfade, warm FileSystem cache in the background without swapping source.
 */
export const AppImageV2 = ({
    id,
    url,
    uri,
    expiryInDays = 7,
    fallbackComponent,
    placeholder,
    transition = 0,
    style,
    onError: onErrorProp,
    cachePolicy = 'memory-disk',
    ...props
}: AppImageV2Props) => {
    const [source, setSource] = useState<{uri: string} | null>(() => {
        if (uri && !url) return {uri};
        if (url) return {uri: url};
        return null;
    });
    const [error, setError] = useState(() => !url && !uri);

    const isDark = themeStore((state) => state.theme === 'dark');
    const iconColor = isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter;

    useEffect(() => {
        if (!url) {
            if (uri) {
                setError(false);
                setSource({uri});
            } else {
                setError(true);
                setSource(null);
            }
            return;
        }

        if (isLocalUri(url)) {
            setError(false);
            setSource({uri: url});
            return;
        }

        // Paint remote immediately — same stable path as add-expense category AppImage.
        setError(false);
        setSource({uri: url});

        const warmDiskCache = async () => {
            const path = `${CACHE_FOLDER}${id}.png`;

            try {
                await ImageCacheManager.ensureCacheDir();
                const fileInfo = await FileSystem.getInfoAsync(path);

                let shouldDownload = !fileInfo.exists;
                if (fileInfo.exists && fileInfo.modificationTime) {
                    const ageInDays =
                        (Date.now() - fileInfo.modificationTime * 1000) /
                        (1000 * 3600 * 24);
                    if (ageInDays > expiryInDays) shouldDownload = true;
                }

                if (!shouldDownload) {
                    await ImageCacheManager.updateManifest(id);
                    return;
                }

                const download = await FileSystem.downloadAsync(url, path);
                if (download.status === 200) {
                    const sizeBytes = download.headers['Content-Length']
                        ? parseInt(download.headers['Content-Length'], 10)
                        : 0;
                    await ImageCacheManager.updateManifest(id, sizeBytes);
                }
                // Do not setSource(local) — remote→file swap flashes on remount.
            } catch {
                // Remote already on screen; disk warm is best-effort.
            } finally {
                ImageCacheManager.purgeCache();
            }
        };

        void warmDiskCache();
    }, [id, url, uri, expiryInDays]);

    const handleImageError = (event: any) => {
        setError(true);
        onErrorProp?.(event);
    };

    if (error || !source) {
        return (
            <View
                style={[
                    {
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                    style,
                ]}
            >
                {fallbackComponent ?? (
                    <Iconify icon="heroicons:photo" size={24} color={iconColor} />
                )}
            </View>
        );
    }

    return (
        <ExpoImage
            source={source}
            placeholder={placeholder}
            transition={transition}
            cachePolicy={cachePolicy}
            style={[{width: '100%', height: '100%'}, style]}
            onError={handleImageError}
            {...props}
        />
    );
};
