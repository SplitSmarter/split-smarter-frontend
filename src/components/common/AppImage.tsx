import React, { useEffect, useState, ReactNode } from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";
import { Iconify } from 'react-native-iconify';
import { themeStore } from "@/src/store/themeStore";
import { CACHE_FOLDER } from "@/src/constants/system";
import { ImageCacheManager } from "@/src/utils/system/ImageCacheManager";
import { deviceStore } from "@/src/store/deviceStore";

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
    // Added 'full' to allow responsive behavior
    size?: keyof typeof IMAGE_SIZES | number | 'full';
    variant?: 'circular' | 'square' | 'rounded' | 'rectangle';
    containerStyle?: ViewStyle;
    borderEnabled?: boolean;
    borderColor?: string;
    backgroundColor?: string;
    className?: string; // Added for NativeWind support
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
                             ...props
                         }: AppImageProps) => {
    const [source, setSource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const platform = deviceStore((state) => state.platform);
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    // 1. Check if we should use responsive sizing
    const isResponsive = size === 'full';
    const baseDimension = typeof size === 'number' ? size : (size === 'full' ? 0 : IMAGE_SIZES[size]);

    const width = isResponsive ? '100%' : (variant === 'rectangle' ? baseDimension * 1.5 : baseDimension);
    const height = isResponsive ? '100%' : baseDimension;

    const [useIconMode, setUseIconMode] = useState(!!icon || (!url && !!fallbackIcon));
    const [finalSource, setFinalSource] = useState<any>(null);

    // Inside AppImage component...

    useEffect(() => {
        if (providedSource) {
            setFinalSource(providedSource);
            setLoading(false);
            setUseIconMode(false);
            return;
        }

        if (icon) {
            setUseIconMode(true);
            setLoading(false);
            return;
        }

        const processImage = async () => {
            // Base checks
            if (!id && url) {
                setSource({ uri: url });
                setUseIconMode(false);
                setLoading(false);
                return;
            }

            if (!url && !id && fallbackImage) {
                setFinalSource(fallbackImage);
                setUseIconMode(false);
                setLoading(false);
                return;
            }

            if (!url || !id) {
                setUseIconMode(true);
                setLoading(false);
                return;
            }

            const path = `${CACHE_FOLDER}${id}.png`;
            const localUri = platform === 'android' ? path : `file://${path}`;

            try {
                await ImageCacheManager.ensureCacheDir();
                const fileInfo = await FileSystem.getInfoAsync(path);
                let isExpired = false;

                // 1. Check if file exists and determine expiry
                if (fileInfo.exists && fileInfo.modificationTime) {
                    const ageInDays = (Date.now() - (fileInfo.modificationTime * 1000)) / (1000 * 3600 * 24);
                    if (ageInDays > expiryInDays) isExpired = true;
                }

                // 2. Logic Branching
                if (fileInfo.exists && !isExpired) {
                    // Valid local cache
                    await ImageCacheManager.updateManifest(id);
                    setSource({ uri: localUri });
                    setUseIconMode(false);
                } else {
                    // Expired or missing - Try Download
                    try {
                        const download = await FileSystem.downloadAsync(url, path);

                        if (download.status === 200) {
                            const sizeBytes = download.headers['Content-Length'] ? parseInt(download.headers['Content-Length']) : 0;
                            await ImageCacheManager.updateManifest(id, sizeBytes);
                            setSource({ uri: download.uri });
                            setUseIconMode(false);
                        } else {
                            throw new Error("Download failed with status " + download.status);
                        }
                    } catch (downloadError) {
                        // 3. Network failed: Check if we can use stale local file
                        if (fileInfo.exists) {
                            console.log(`⚠️ Network failed for ${id}, using stale local version.`);
                            await ImageCacheManager.updateManifest(id);
                            setSource({ uri: localUri });
                            setUseIconMode(false);
                        } else if (fallbackImage) {
                            // 4. Final Fallback: local asset image
                            setFinalSource(fallbackImage);
                            setUseIconMode(false);
                        } else {
                            // 5. Total failure: Icon mode
                            setUseIconMode(true);
                        }
                    }
                }
            } catch (globalError) {
                console.error("Image processing error:", globalError);
                setUseIconMode(true);
            } finally {
                setLoading(false);
                ImageCacheManager.purgeCache();
            }
        };

        processImage();
    }, [id, url, icon, providedSource, expiryInDays]);

    const borderRadius = variant === 'circular'
        ? (typeof baseDimension === 'number' ? baseDimension / 2 : 999)
        : variant === 'rounded' || variant === 'rectangle' ? 6 : 0;

    // 2. Adjust Container styles to allow flex/responsive sizing
    const containerBaseStyle: ViewStyle = {
        width: width as any,
        height: height as any,
        borderRadius: borderRadius,
        overflow: 'hidden',
        backgroundColor: backgroundColor || (isDark ? '#1A1A1A' : '#F3F4F6'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: borderEnabled ? 1 : 0,
        borderColor: borderColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
    };

    return (
        /* 3. The outer wrapper now respects the size prop OR the passed className (flex/h/w) */
        <View
            className={className}
            style={(!className || isResponsive) ? { width: width as any, height: height as any } : undefined}
        >
            <View style={[containerBaseStyle, containerStyle]}>
                {useIconMode ? (
                    icon || fallbackIcon || <Iconify icon="heroicons:photo" size={24} color={isDark ? '#555' : '#ccc'} />
                ) : (
                    <ExpoImage
                        source={finalSource || source}
                        placeholder={placeholder}
                        contentFit={props.contentFit || "cover"}
                        transition={transition}
                        style={{ width: '100%', height: '100%', borderRadius: variant === 'circular' ? 999 : 0 }}
                        {...props}
                    />
                )}
                {loading && !useIconMode && (
                    <View className="absolute items-center justify-center inset-0">
                        <ActivityIndicator color={isDark ? '#FFF' : '#666'} size="small" />
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