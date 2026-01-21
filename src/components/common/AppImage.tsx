import React, { useEffect, useState, ReactNode } from 'react';
import {ActivityIndicator, Platform, View, ViewStyle} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from "expo-image";
import { Iconify } from 'react-native-iconify';
import { useThemeStore } from "@/src/store/useThemeStore";
import { CACHE_FOLDER } from "@/src/constants/system";
import { ImageCacheManager } from "@/src/utils/system/ImageCacheManager";
import { COLORS } from "@/src/constants/colors";
import {useDeviceStore} from "@/src/store/deviceStore";

const IMAGE_SIZES = {
    xs: 24, sm: 32, md: 48, lg: 64, xl: 80, xxl: 120,
};

interface AppImageProps extends Omit<ExpoImageProps, 'source'> {
    id?: string;
    url?: string | null;
    expiryInDays?: number;
    fallbackImage?: ExpoImageProps['source'];

    // Icon & Fallback Logic - Now accepting Nodes to satisfy Babel plugin
    icon?: ReactNode;
    fallbackIcon?: ReactNode;

    renderOverlay?: ReactNode | ((dimension: number, isDark: boolean) => ReactNode);
    overlayPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

    size?: keyof typeof IMAGE_SIZES | number;
    variant?: 'circular' | 'square' | 'rounded' | 'rectangle';
    containerStyle?: ViewStyle;
    borderEnabled?: boolean;
    borderColor?: string;
}

export const AppImage = ({
                             id,
                             url,
                             icon,
                             fallbackIcon,
                             renderOverlay,
                             overlayPosition = 'bottom-right',
                             expiryInDays = 7,
                             fallbackImage,
                             placeholder = "|rF?hV%2WCj[ayj[a|j[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[ayjtayj[",
                             size = 'md',
                             variant = 'rounded',
                             transition = 300,
                             containerStyle,
                             borderEnabled,
                             borderColor,
                             ...props
                         }: AppImageProps) => {
    const [source, setSource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const platform = useDeviceStore((state) => state.platform);

    // Logic: Use icon mode if a dedicated icon is passed OR if we have no URL/ID
    const [useIconMode, setUseIconMode] = useState(!!icon || (!url && !!fallbackIcon));
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    const baseDimension = typeof size === 'number' ? size : IMAGE_SIZES[size];
    const width = variant === 'rectangle' ? baseDimension * 1.5 : baseDimension;
    const height = baseDimension;

    useEffect(() => {
        if (icon) {
            setUseIconMode(true);
            setLoading(false);
            return;
        }

        const processImage = async () => {
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

                if (fileInfo.exists && fileInfo.modificationTime) {
                    const age = (Date.now() - (fileInfo.modificationTime * 1000)) / (1000 * 3600 * 24);
                    if (age > expiryInDays) isExpired = true;
                }

                if (!fileInfo.exists || isExpired) {
                    const download = await FileSystem.downloadAsync(url, path);
                    const sizeBytes = download.headers['Content-Length'] ? parseInt(download.headers['Content-Length']) : 0;
                    await ImageCacheManager.updateManifest(id, sizeBytes);
                    // Use the download result URI (it usually contains the prefix)
                    setSource({ uri: download.uri });
                } else {
                    await ImageCacheManager.updateManifest(id);
                    setSource({ uri: localUri }); // Use formatted local URI
                }
                setUseIconMode(false);
            } catch (e) {
                console.error("Cache process failed, falling back to network URL", e);
                // Last ditch effort: Try to load the network URL directly if caching fails
                setSource({ uri: url });
                setUseIconMode(false);
            } finally {
                setLoading(false);
                ImageCacheManager.purgeCache();
            }
        };

        processImage();
    }, [id, url, icon]);

    const containerBaseStyle: ViewStyle = {
        width: width,
        height: height,
        borderRadius: variant === 'circular' ? height / 2 : variant === 'rounded' || variant === 'rectangle' ? 6 : 0,
        overflow: 'hidden',
        backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: borderEnabled ? 1 : 0,
        borderColor: borderColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
    };

    const getPositionStyle = (): ViewStyle => {
        const offset = -2;
        switch (overlayPosition) {
            case 'top-right': return { top: offset, right: offset };
            case 'top-left': return { top: offset, left: offset };
            case 'bottom-left': return { bottom: offset, left: offset };
            default: return { bottom: offset, right: offset };
        }
    };

    return (
        <View style={{ width: width, height: height }}>
            <View style={[containerBaseStyle, containerStyle]}>
                {useIconMode ? (
                    // Render the passed icon or the fallback icon
                    // If both are missing, render a static string icon to satisfy the plugin
                    icon || fallbackIcon || <Iconify icon="heroicons:photo" size={height * 0.55} color={isDark ? '#555' : '#ccc'} />
                ) : (
                    <ExpoImage
                        source={source}
                        placeholder={placeholder}
                        contentFit="cover"
                        transition={transition}
                        style={{ width: '100%', height: '100%' }}
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
                <View style={[{ position: 'absolute', zIndex: 10 }, getPositionStyle()]}>
                    {typeof renderOverlay === 'function' ? renderOverlay(height, isDark) : renderOverlay}
                </View>
            )}
        </View>
    );
};