import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {Image as ExpoImage, ImageProps as ExpoImageProps} from 'expo-image';
import {Iconify} from 'react-native-iconify';
import {CACHE_FOLDER} from '@/src/constants/system';
import {ImageCacheManager} from '@/src/utils/system/ImageCacheManager';
import {deviceStore} from '@/src/store/deviceStore';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

interface AppImageV2Props extends ExpoImageProps {
    id: string;
    url?: string | null;
    uri?: string | null;
    expiryInDays?: number;
    /** Explicit entity fallback (e.g. EntityFallbackIcon). When omitted, uses built-in photo. */
    fallbackComponent?: React.ReactNode;
}

export const AppImageV2 = ({
    id,
    url,
    uri,
    expiryInDays = 7,
    fallbackComponent,
    placeholder = '|rF?hV%2WCj[ayj[a|j[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[',
    transition = 200,
    style,
    onError: onErrorProp,
    ...props
}: AppImageV2Props) => {
    const [source, setSource] = useState<{uri: string} | null>(() => {
        if (!url && uri) return {uri};
        if (
            url &&
            (url.startsWith('file://') ||
                url.startsWith('content://') ||
                url.startsWith('ph://'))
        ) {
            return {uri: url};
        }
        return null;
    });

    const [error, setError] = useState(false);
    const platform = deviceStore((state) => state.platform);
    const isDark = themeStore((state) => state.theme === 'dark');
    const iconColor = isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter;

    useEffect(() => {
        const triggerFallback = () => {
            if (uri) {
                setError(false);
                setSource({uri});
            } else {
                setError(true);
            }
        };

        if (
            !url ||
            url.startsWith('file://') ||
            url.startsWith('content://') ||
            url.startsWith('ph://')
        ) {
            if (url) {
                setError(false);
                setSource({uri: url});
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
                    const ageInDays =
                        (Date.now() - fileInfo.modificationTime * 1000) /
                        (1000 * 3600 * 24);
                    if (ageInDays > expiryInDays) shouldDownload = true;
                }

                if (!shouldDownload) {
                    await ImageCacheManager.updateManifest(id);
                    setError(false);
                    setSource({uri: localUri});
                } else {
                    const download = await FileSystem.downloadAsync(url, path);
                    if (download.status === 200) {
                        const sizeBytes = download.headers['Content-Length']
                            ? parseInt(download.headers['Content-Length'], 10)
                            : 0;
                        await ImageCacheManager.updateManifest(id, sizeBytes);
                        setError(false);
                        setSource({uri: download.uri});
                    } else {
                        throw new Error('Download failed');
                    }
                }
            } catch {
                const fileInfo = await FileSystem.getInfoAsync(path);
                if (fileInfo.exists) {
                    setError(false);
                    setSource({uri: localUri});
                } else {
                    triggerFallback();
                }
            } finally {
                ImageCacheManager.purgeCache();
            }
        };

        void processCache();
    }, [id, url, uri, expiryInDays, platform]);

    const handleImageError = (event: any) => {
        setError(true);
        onErrorProp?.(event);
    };

    if (error) {
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
            style={[{width: '100%', height: '100%'}, style]}
            onError={handleImageError}
            {...props}
        />
    );
};
