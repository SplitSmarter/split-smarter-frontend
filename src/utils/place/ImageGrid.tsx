import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import * as FileSystem from 'expo-file-system';
import {Image as ExpoImage} from 'expo-image';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {PlacePhotoDetails} from '@/src/api/dto/user/place';
import {themeStore} from '@/src/store/themeStore';
import {deviceStore} from '@/src/store/deviceStore';
import {Shimmer} from '@/src/components/common/shimmer';
import {COLORS} from '@/src/constants/colors';
import {CACHE_FOLDER} from '@/src/constants/system';
import {ImageCacheManager} from '@/src/utils/system/ImageCacheManager';
import {
    filterUsablePlacePhotos,
    toSafeImageCacheId,
} from '@/src/utils/place/placePhotos';

const GRID_HEIGHT = 208;
const SIDE_GAP = 8;
const SIDE_TILE_HEIGHT = (GRID_HEIGHT - SIDE_GAP) / 2;
const MAX_TILES = 3;

interface ImageGridProps {
    photos: PlacePhotoDetails[];
    loading?: boolean;
}

type ReadyTile = {
    photo: PlacePhotoDetails;
    uri: string;
};

function isImageContentType(contentType: string | undefined): boolean {
    if (!contentType) return true;
    return contentType.toLowerCase().startsWith('image/');
}

/**
 * Fully resolve a place photo to a local cache URI before display.
 * Failed / non-image downloads are dropped — never shown as fallback icons in the grid.
 */
async function prefetchPlacePhoto(
    photo: PlacePhotoDetails,
    platform: 'ios' | 'android' | 'web',
): Promise<ReadyTile | null> {
    const url = String(photo.url ?? '').trim();
    if (!/^https?:\/\//i.test(url)) return null;

    const cacheId = toSafeImageCacheId(String(photo.id ?? url));
    const path = `${CACHE_FOLDER}${cacheId}.png`;
    const localUri = platform === 'android' ? path : `file://${path}`;

    try {
        await ImageCacheManager.ensureCacheDir();
        const fileInfo = await FileSystem.getInfoAsync(path);

        if (fileInfo.exists) {
            await ImageCacheManager.updateManifest(cacheId);
            return {photo, uri: localUri};
        }

        const download = await FileSystem.downloadAsync(url, path);
        const contentType =
            download.headers?.['Content-Type'] ||
            download.headers?.['content-type'];

        if (download.status === 200 && isImageContentType(contentType)) {
            const sizeBytes = download.headers['Content-Length']
                ? parseInt(download.headers['Content-Length'], 10)
                : 0;
            await ImageCacheManager.updateManifest(cacheId, sizeBytes);
            const uri =
                typeof download.uri === 'string' && download.uri.length > 0
                    ? download.uri
                    : localUri;
            return {photo, uri};
        }

        await FileSystem.deleteAsync(path, {idempotent: true});
        return null;
    } catch {
        try {
            await FileSystem.deleteAsync(path, {idempotent: true});
        } catch {
            // ignore cleanup errors
        }
        return null;
    }
}

export const ImageGrid = React.memo(({photos, loading}: ImageGridProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const platform = deviceStore((state) => state.platform);
    const usablePhotos = useMemo(
        () => filterUsablePlacePhotos(photos).slice(0, MAX_TILES),
        [photos],
    );

    const [readyTiles, setReadyTiles] = useState<ReadyTile[]>([]);
    const [preparing, setPreparing] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (loading) {
            setReadyTiles([]);
            setPreparing(false);
            return;
        }

        if (!usablePhotos.length) {
            setReadyTiles([]);
            setPreparing(false);
            return;
        }

        setPreparing(true);
        setReadyTiles([]);

        void (async () => {
            const results = await Promise.all(
                usablePhotos.map((photo) => prefetchPlacePhoto(photo, platform)),
            );
            if (cancelled) return;
            setReadyTiles(
                results.filter((tile): tile is ReadyTile => tile != null),
            );
            setPreparing(false);
            void ImageCacheManager.purgeCache();
        })();

        return () => {
            cancelled = true;
        };
    }, [usablePhotos, loading, platform]);

    if (loading || preparing) {
        return (
            <View className="mt-4 flex-row gap-x-2" style={{height: GRID_HEIGHT}}>
                <View className="flex-[2]">
                    <Shimmer height="100%" />
                </View>
                <View className="flex-1 gap-y-2">
                    <View className="flex-1">
                        <Shimmer height="100%" />
                    </View>
                    <View className="flex-1">
                        <Shimmer height="100%" />
                    </View>
                </View>
            </View>
        );
    }

    const hasPhotos = readyTiles.length > 0;

    return (
        <View className="mt-4 flex-row gap-x-2" style={{height: GRID_HEIGHT}}>
            {hasPhotos ? (
                <>
                    <View
                        className="flex-[2] overflow-hidden rounded-[20px] bg-bg-primary-darker"
                        style={{height: GRID_HEIGHT}}
                    >
                        <ExpoImage
                            source={{uri: readyTiles[0].uri}}
                            style={styles.fill}
                            contentFit="cover"
                            transition={0}
                        />
                    </View>

                    {readyTiles.length > 1 && (
                        <View
                            className="flex-1"
                            style={{height: GRID_HEIGHT, gap: SIDE_GAP}}
                        >
                            <View
                                className="overflow-hidden rounded-[20px] bg-bg-primary-darker"
                                style={{height: SIDE_TILE_HEIGHT}}
                            >
                                <ExpoImage
                                    source={{uri: readyTiles[1].uri}}
                                    style={styles.fill}
                                    contentFit="cover"
                                    transition={0}
                                />
                            </View>

                            {readyTiles.length > 2 && (
                                <View
                                    className="overflow-hidden rounded-[20px] bg-bg-primary-darker"
                                    style={{height: SIDE_TILE_HEIGHT}}
                                >
                                    <ExpoImage
                                        source={{uri: readyTiles[2].uri}}
                                        style={styles.fill}
                                        contentFit="cover"
                                        transition={0}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </>
            ) : (
                <>
                    <View
                        className="flex-[2] items-center justify-center overflow-hidden rounded-[20px] bg-bg-primary-darker"
                        style={{height: GRID_HEIGHT}}
                    >
                        <EntityFallbackIcon
                            kind="placePhoto"
                            size={40}
                            color={colors.icon.lighter}
                        />
                    </View>
                    <View
                        className="flex-1"
                        style={{height: GRID_HEIGHT, gap: SIDE_GAP}}
                    >
                        <View
                            className="items-center justify-center overflow-hidden rounded-[20px] bg-bg-primary-darker"
                            style={{height: SIDE_TILE_HEIGHT}}
                        >
                            <EntityFallbackIcon
                                kind="placePhoto"
                                size={24}
                                color={colors.icon.lighter}
                            />
                        </View>
                        <View
                            className="items-center justify-center overflow-hidden rounded-[20px] bg-bg-primary-darker"
                            style={{height: SIDE_TILE_HEIGHT}}
                        >
                            <EntityFallbackIcon
                                kind="placePhoto"
                                size={24}
                                color={colors.icon.lighter}
                            />
                        </View>
                    </View>
                </>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    fill: {
        width: '100%',
        height: '100%',
    },
});

ImageGrid.displayName = 'ImageGrid';
