import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Pressable, ActivityIndicator, StyleSheet, ListRenderItem} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {AppInput} from '@/src/components/common/AppInput';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {GetAllUserPlacesApi} from '@/src/api/user/place/location';
import {UserPlaceDetails} from '@/src/api/dto/user/place';
import {PlaceStatus} from '@/src/api/dto/constants';
import {PaginationResponse} from '@/src/api/dto/ApiResponse';

const PAGE_SIZE = 20;
const MAP_SELECT_ROUTE = '/(authenticated)/map/select' as const;

interface SelectSavedPlaceBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (place: UserPlaceDetails) => void;
}

function resolveHasMore(
    pageData: UserPlaceDetails[],
    nextOffset: number,
    pagination?: PaginationResponse,
): boolean {
    if (typeof pagination?.has_next === 'boolean') {
        return pagination.has_next;
    }
    if (typeof pagination?.total === 'number') {
        return nextOffset + pageData.length < pagination.total;
    }
    return pageData.length >= PAGE_SIZE;
}

function matchesPlaceQuery(place: UserPlaceDetails, query: string): boolean {
    if (place.name.toLowerCase().includes(query)) return true;
    if (place.address?.toLowerCase().includes(query)) return true;
    if (place.city?.toLowerCase().includes(query)) return true;
    if (place.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;
    return false;
}

export const SelectSavedPlaceBottomSheet = ({
    visible,
    onClose,
    onSelect,
    selectedId,
}: SelectSavedPlaceBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const router = useRouter();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const loadingRef = useRef(false);

    const [places, setPlaces] = useState<UserPlaceDetails[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPlaces = useCallback(async (nextOffset: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await GetAllUserPlacesApi(nextOffset, PAGE_SIZE);
            const pageData = ((response.data ?? []) as UserPlaceDetails[]).filter(
                (place) => place.status !== PlaceStatus.DELETED && place.id != null,
            );

            setPlaces((prev) => {
                if (!append) return pageData;
                const existingIds = new Set(prev.map((item) => item.id));
                return [...prev, ...pageData.filter((item) => !existingIds.has(item.id))];
            });
            setOffset(nextOffset + (response.data?.length ?? pageData.length));
            setHasMore(resolveHasMore(pageData, nextOffset, response.pagination));

            if (!append && !response.data && response.message) {
                setError(response.message);
            }
        } catch (err: any) {
            console.error('Failed fetching saved places:', err);
            if (!append) {
                setPlaces([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load places. Check your connection and try again.");
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const resetAndLoad = useCallback(() => {
        setPlaces([]);
        setOffset(0);
        setHasMore(true);
        fetchPlaces(0, false);
    }, [fetchPlaces]);

    useEffect(() => {
        if (visible) {
            setSearchQuery('');
            resetAndLoad();
            bottomSheetModalRef.current?.present();
        } else {
            setSearchQuery('');
            setError(null);
            setLoadingMore(false);
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, resetAndLoad]);

    const trimmedQuery = searchQuery.trim();
    const filteredPlaces = useMemo(() => {
        if (!trimmedQuery) return places;
        const query = trimmedQuery.toLowerCase();
        return places.filter((place) => matchesPlaceQuery(place, query));
    }, [places, trimmedQuery]);

    const hasPlaces = places.length > 0;
    const hasResults = filteredPlaces.length > 0;
    const isSearching = trimmedQuery.length > 0;
    const showSearch = (hasPlaces || isSearching) && !loading && !(error && !hasPlaces);
    const emptyIconColor = colors.icon.primary;
    const headerIconColor = colors.icon.primary;

    const handleOpenMapPress = useCallback(() => {
        onClose();
        setTimeout(() => {
            router.push(MAP_SELECT_ROUTE);
        }, 200);
    }, [onClose, router]);

    const handleClearSearch = useCallback(() => setSearchQuery(''), []);

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingRef.current || loading || loadingMore) return;
        fetchPlaces(offset, true);
    }, [hasMore, loading, loadingMore, offset, fetchPlaces]);

    useEffect(() => {
        if (!visible || !isSearching || hasResults || !hasMore || !hasPlaces) return;
        if (loading || loadingMore || loadingRef.current) return;
        handleLoadMore();
    }, [
        visible,
        isSearching,
        hasResults,
        hasMore,
        hasPlaces,
        loading,
        loadingMore,
        handleLoadMore,
        places.length,
    ]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.7 : 0.4}
            />
        ),
        [isDark],
    );

    const renderPlaceItem = useCallback<ListRenderItem<UserPlaceDetails>>(
        ({item}) => {
            const photo = item.photos?.[0];
            const isSelected = item.id === selectedId;
            const subtitle = [item.address, item.city].filter(Boolean).join(', ') || 'Saved place';

            return (
                <Pressable
                    onPress={() => onSelect(item)}
                    className={`flex-row items-center py-3 px-2 rounded-2xl mb-1 ${
                        isSelected ? 'bg-accent-sky-bg border border-accent-sky' : ''
                    }`}
                >
                    <View className="w-14 h-14 mr-4">
                        <AppImage
                            id={photo?.id}
                            url={photo?.url}
                            variant="circular"
                            size="full"
                            fallbackIcon={
                                <EntityFallbackIcon kind="place" size={24} color={colors.icon.lighter} />
                            }
                        />
                    </View>
                    <View className="flex-1 pr-2">
                        <AppText
                            variant="body-base"
                            className="font-semibold text-text-primary"
                            numberOfLines={1}
                        >
                            {item.name}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="text-text-primary-lighter mt-0.5"
                            numberOfLines={2}
                        >
                            {subtitle}
                        </AppText>
                    </View>
                    {isSelected ? (
                        <Iconify
                            icon="heroicons:check-circle"
                            size={22}
                            color={isDark ? '#38BDF8' : '#0284C7'}
                        />
                    ) : null}
                </Pressable>
            );
        },
        [colors.icon.lighter, isDark, onSelect, selectedId],
    );

    const listHeader = useMemo(
        () => (
            <View className="flex-row items-center justify-between mb-4">
                <AppText variant="h4" className="text-text-primary">
                    {isSearching ? 'Results' : 'Saved Places'}
                </AppText>
                <AppText variant="caption-xs" className="text-text-primary-lighter">
                    {filteredPlaces.length}
                    {hasMore && !isSearching ? '+' : ''}{' '}
                    {filteredPlaces.length === 1 ? 'place' : 'places'}
                </AppText>
            </View>
        ),
        [filteredPlaces.length, hasMore, isSearching],
    );

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={styles.footerSpacer}/>;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.icon.primary}/>
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading more...
                </AppText>
            </View>
        );
    }, [colors.icon.primary, loadingMore]);

    const listEmpty = useMemo(() => {
        if (!isSearching) return null;
        if (hasMore || loadingMore) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="small" color={colors.icon.primary}/>
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Searching loaded places...
                    </AppText>
                </View>
            );
        }
        return (
            <SheetEmptyState
                icon={<Iconify icon="heroicons:magnifying-glass-minus" size={32} color={emptyIconColor}/>}
                title="No results found"
                description={`Nothing matched “${trimmedQuery}”. Try a different name or open the map.`}
                primaryAction={{
                    label: 'Clear Search',
                    onPress: handleClearSearch,
                    renderIcon: (color) => <Iconify icon="heroicons:x-mark" size={18} color={color}/>,
                }}
                secondaryAction={{
                    label: 'Open map',
                    onPress: handleOpenMapPress,
                }}
            />
        );
    }, [
        colors.icon.primary,
        emptyIconColor,
        handleClearSearch,
        handleOpenMapPress,
        hasMore,
        isSearching,
        loadingMore,
        trimmedQuery,
    ]);

    const renderBody = () => {
        if (loading && !hasPlaces) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="large" color={colors.icon.primary}/>
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Loading places...
                    </AppText>
                </View>
            );
        }

        if (error && !hasPlaces) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:exclamation-triangle" size={32} color={emptyIconColor}/>}
                        title="Unable to load places"
                        description={error}
                        primaryAction={{
                            label: 'Try Again',
                            onPress: resetAndLoad,
                            renderIcon: (color) => <Iconify icon="heroicons:arrow-path" size={18} color={color}/>,
                        }}
                    />
                </View>
            );
        }

        if (!hasPlaces) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:map-pin" size={32} color={emptyIconColor}/>}
                        title="No saved places yet"
                        description="Open the map to save a place, then pick it here for your expense."
                        primaryAction={{
                            label: 'Open map',
                            onPress: handleOpenMapPress,
                            renderIcon: (color) => <Iconify icon="heroicons:map" size={18} color={color}/>,
                        }}
                    />
                </View>
            );
        }

        return (
            <View style={styles.listCard} className="bg-bg-primary-lighter border border-border-input">
                <BottomSheetFlatList
                    data={filteredPlaces}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderPlaceItem}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
                    ListEmptyComponent={listEmpty}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        filteredPlaces.length === 0 ? styles.emptyListContent : styles.listContent
                    }
                    style={styles.scroll}
                />
            </View>
        );
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{
                backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <View style={styles.container}>
                <View className="flex-row items-center justify-between py-4 px-6 border-b border-border-input">
                    <Pressable onPress={onClose} style={styles.headerIconButton}>
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={headerIconColor}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select Place
                    </AppText>
                    <Pressable
                        onPress={handleOpenMapPress}
                        style={styles.headerIconButton}
                        accessibilityLabel="Open map"
                    >
                        <Iconify icon="heroicons:map" size={24} color={headerIconColor}/>
                    </Pressable>
                </View>

                {showSearch ? (
                    <View className="px-4 pt-4 pb-2">
                        <AppInput
                            placeholder="Search saved places..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            renderLeftIcon={(c) => (
                                <Iconify icon="heroicons:magnifying-glass" size={20} color={c}/>
                            )}
                            renderRightIcon={(c) =>
                                searchQuery.length > 0 ? (
                                    <Pressable onPress={handleClearSearch} hitSlop={8}>
                                        <Iconify icon="heroicons:x-mark" size={20} color={c}/>
                                    </Pressable>
                                ) : null
                            }
                        />
                    </View>
                ) : null}

                <View style={styles.body}>
                    {renderBody()}
                </View>
            </View>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    listCard: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingTop: 12,
        overflow: 'hidden',
    },
    scroll: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
    emptyListContent: {
        flexGrow: 1,
        paddingBottom: 24,
        justifyContent: 'center',
    },
    footerSpacer: {
        height: 16,
    },
    footerLoading: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    centeredBody: {
        flex: 1,
        justifyContent: 'center',
    },
    headerIconButton: {
        padding: 8,
        borderRadius: 999,
    },
});

SelectSavedPlaceBottomSheet.displayName = 'SelectSavedPlaceBottomSheet';
