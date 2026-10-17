import { CACHE_FOLDER } from "@/src/constants/system";
import { deviceStore } from "@/src/store/deviceStore";
import { themeStore } from "@/src/store/themeStore";
import { ImageCacheManager } from "@/src/utils/system/ImageCacheManager";
import { toSafeImageCacheId } from "@/src/utils/place/placePhotos";
import * as FileSystem from 'expo-file-system';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/src/constants/colors';

const IMAGE_SIZES = {
    xs: 24, sm: 32, md: 48, lg: 64, xl: 80, xxl: 120,
};

interface AppImageProps extends Omit<ExpoImageProps, 'source'> {
    id?: string;
    url?: string | null;
    source?: ExpoImageProps['source'];
    expiryInDays?: number;
    fallbackImage?: ExpoImageProps['source'];
    icon?: ReactNode;
    fallbackIcon?: ReactNode;
    renderOverlay?: ReactNode | ((dimension: number, isDark: boolean) => ReactNode);
    overlayPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
    size?: keyof typeof IMAGE_SIZES | number | 'full';
    variant?: 'circular' | 'square' | 'rounded' | 'rectangle';
    containerStyle?: ViewStyle;
    borderEnabled?: boolean;
    borderColor?: string;
    backgroundColor?: string;
    className?: string;
    /** Skip FileSystem download cache; load remote URI via expo-image (better for signed/place URLs). */
    skipDiskCache?: boolean;
}

function isImageContentType(contentType: string | undefined): boolean {
    if (!contentType) return true; // some CDNs omit it; don't reject
    return contentType.toLowerCase().startsWith('image/');
}

export const AppImage = ({
                             id,
                             url,
                             source: providedSource,
                             icon,
                             fallbackIcon,
                             renderOverlay,
                             overlayPosition = 'bottom-right',
                             expiryInDays = 7,
                             fallbackImage,
                             placeholder = "|rF?hV%2WCj[ayj[a|j[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[",
                             backgroundColor,
                             size = 'md',
                             variant = 'rounded',
                             transition = 300,
                             containerStyle,
                             borderEnabled,
                             borderColor,
                             className,
                             skipDiskCache = false,
                             onError: onErrorProp,
                             ...props
                         }: AppImageProps) => {
    const [source, setSource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const platform = deviceStore((state) => state.platform);
    const { theme } = themeStore();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    const isResponsive = size === 'full';
    const baseDimension = typeof size === 'number' ? size : (size === 'full' ? 0 : IMAGE_SIZES[size]);

    const width = isResponsive ? '100%' : (variant === 'rectangle' ? baseDimension * 1.5 : baseDimension);
    const height = isResponsive ? '100%' : baseDimension;

    const [useIconMode, setUseIconMode] = useState(!!icon || (!url && !!fallbackIcon));
    const [finalSource, setFinalSource] = useState<any>(null);

    const applyRemoteFallback = useCallback((remoteUrl: string) => {
        setSource({ uri: remoteUrl });
        setFinalSource(null);
        setUseIconMode(false);
    }, []);

    const applyTotalFailure = useCallback(() => {
        if (fallbackImage) {
            setFinalSource(fallbackImage);
            setUseIconMode(false);
            return;
        }
        setSource(null);
        setFinalSource(null);
        setUseIconMode(true);
    }, [fallbackImage]);

    const handleImageError = useCallback(
        (event: any) => {
            // Ignore errors from a null/empty source mount — ExpoImage can fire
            // onError before the remote URI is applied, which would sticky-fall back to icons.
            const active = finalSource || source;
            if (!active) {
                return;
            }
            onErrorProp?.(event);
            applyTotalFailure();
        },
        [applyTotalFailure, finalSource, onErrorProp, source],
    );

    useEffect(() => {
        let cancelled = false;

        setSource(null);
        setFinalSource(null);
        setLoading(true);
        setUseIconMode(!!icon || (!url && !!fallbackIcon));

        if (providedSource) {
            setFinalSource(providedSource);
            setUseIconMode(false);
            setLoading(false);
            return;
        }

        if (icon) {
            setUseIconMode(true);
            setLoading(false);
            return;
        }

        const processImage = async () => {
            const trimmedUrl = typeof url === 'string' ? url.trim() : '';

            // Remote-only path (signed place photos, etc.)
            if (skipDiskCache && trimmedUrl) {
                if (!cancelled) {
                    applyRemoteFallback(trimmedUrl);
                    setLoading(false);
                }
                return;
            }

            if (!id && trimmedUrl) {
                if (!cancelled) {
                    applyRemoteFallback(trimmedUrl);
                    setLoading(false);
                }
                return;
            }

            if (!trimmedUrl && !id && fallbackImage) {
                if (!cancelled) {
                    setFinalSource(fallbackImage);
                    setUseIconMode(false);
                    setLoading(false);
                }
                return;
            }

            if (!trimmedUrl || !id) {
                if (!cancelled) {
                    setUseIconMode(true);
                    setLoading(false);
                }
                return;
            }

            const cacheId = toSafeImageCacheId(String(id));
            const path = `${CACHE_FOLDER}${cacheId}.png`;
            const localUri = platform === 'android' ? path : `file://${path}`;

            try {
                await ImageCacheManager.ensureCacheDir();
                const fileInfo = await FileSystem.getInfoAsync(path);
                let isExpired = false;

                if (fileInfo.exists && fileInfo.modificationTime) {
                    const ageInDays = (Date.now() - (fileInfo.modificationTime * 1000)) / (1000 * 3600 * 24);
                    if (ageInDays > expiryInDays) isExpired = true;
                }

                if (fileInfo.exists && !isExpired) {
                    await ImageCacheManager.updateManifest(cacheId);
                    if (!cancelled) {
                        setSource({ uri: localUri });
                        setUseIconMode(false);
                    }
                } else {
                    try {
                        const download = await FileSystem.downloadAsync(trimmedUrl, path);
                        const contentType =
                            download.headers?.['Content-Type'] ||
                            download.headers?.['content-type'];

                        if (download.status === 200 && isImageContentType(contentType)) {
                            const sizeBytes = download.headers['Content-Length']
                                ? parseInt(download.headers['Content-Length'], 10)
                                : 0;
                            await ImageCacheManager.updateManifest(cacheId, sizeBytes);
                            if (!cancelled) {
                                setSource({ uri: download.uri });
                                setUseIconMode(false);
                            }
                        } else {
                            await FileSystem.deleteAsync(path, { idempotent: true });
                            throw new Error(
                                `Download failed status=${download.status} contentType=${contentType ?? 'n/a'}`,
                            );
                        }
                    } catch (downloadError) {
                        console.warn(`AppImage disk cache miss for ${cacheId}:`, downloadError);
                        if (fileInfo.exists) {
                            await ImageCacheManager.updateManifest(cacheId);
                            if (!cancelled) {
                                setSource({ uri: localUri });
                                setUseIconMode(false);
                            }
                        } else if (trimmedUrl) {
                            // Prefer live remote URI over blank icon when disk cache fails
                            if (!cancelled) applyRemoteFallback(trimmedUrl);
                        } else if (!cancelled) {
                            applyTotalFailure();
                        }
                    }
                }
            } catch (globalError) {
                console.error("Image processing error:", globalError);
                if (!cancelled) {
                    if (trimmedUrl) applyRemoteFallback(trimmedUrl);
                    else applyTotalFailure();
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    ImageCacheManager.purgeCache();
                }
            }
        };

        void processImage();

        return () => {
            cancelled = true;
        };
    }, [
        id,
        url,
        icon,
        providedSource,
        expiryInDays,
        skipDiskCache,
        platform,
        fallbackImage,
        applyRemoteFallback,
        applyTotalFailure,
    ]);

    const borderRadius = variant === 'circular'
        ? (typeof baseDimension === 'number' ? baseDimension / 2 : 999)
        : variant === 'rounded' || variant === 'rectangle' ? 6 : 0;

    const containerBaseStyle: ViewStyle = {
        width: width as any,
        height: height as any,
        borderRadius: borderRadius,
        overflow: 'hidden',
        backgroundColor: backgroundColor || colors.bg.darker,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: borderEnabled ? 1 : 0,
        borderColor: borderColor || colors.status.border,
    };

    return (
        <View
            className={className}
            style={(!className || isResponsive) ? { width: width as any, height: height as any } : undefined}
        >
            <View style={[containerBaseStyle, containerStyle]}>
                {useIconMode ? (
                    icon || fallbackIcon || <Iconify icon="heroicons:photo" size={24} color={colors.icon.lighter} />
                ) : (finalSource || source) ? (
                    <ExpoImage
                        {...props}
                        source={finalSource || source}
                        placeholder={placeholder}
                        contentFit={props.contentFit || "cover"}
                        transition={transition}
                        style={{ width: '100%', height: '100%', borderRadius: variant === 'circular' ? 999 : 0 }}
                        onError={handleImageError}
                        cachePolicy={skipDiskCache ? 'memory-disk' : props.cachePolicy}
                    />
                ) : null}
                {loading && !useIconMode && (
                    <View className="absolute items-center justify-center inset-0">
                        <ActivityIndicator color={colors.icon.primary} size="small" />
                    </View>
                )}
            </View>

            {renderOverlay && (
                <View style={[{ position: 'absolute', zIndex: 10 }, getPositionStyle(overlayPosition)]}>
                    {typeof renderOverlay === 'function' ? renderOverlay(typeof height === 'number' ? height : 0, isDark) : renderOverlay}
                </View>
            )}
        </View>
    );
};

const getPositionStyle = (pos: string): ViewStyle => {
    const offset = -2;
    switch (pos) {
        case 'top-right': return { top: offset, right: offset };
        case 'top-left': return { top: offset, left: offset };
        case 'bottom-left': return { bottom: offset, left: offset };
        default: return { bottom: offset, right: offset };
    }
};
