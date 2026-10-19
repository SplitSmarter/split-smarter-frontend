import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    View,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    ListRenderItem,
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ListMccCodesApi} from '@/src/api/expense/mcc';
import {MCCResponse} from '@/src/api/dto/expense/merchant';

const PAGE_SIZE = 40;
/** Wait until typing pauses before hitting the API. */
const SEARCH_DEBOUNCE_MS = 450;

export type SelectedMcc = {
    code: string;
    description: string;
};

/** Safety net if the API returns an unfiltered page. */
function filterMccByQuery(items: MCCResponse[], query: string): MCCResponse[] {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
        const code = String(item.code ?? '').toLowerCase();
        const description = String(item.description ?? '').toLowerCase();
        return code.includes(q) || description.includes(q);
    });
}

interface MccPickerBottomSheetProps {
    visible: boolean;
    selectedCode?: string | null;
    onClose: () => void;
    onSelect: (mcc: SelectedMcc) => void;
}

/**
 * Local typing state lives here so keystrokes do not re-render the list / sheet body.
 * Parent only hears about the query after debounce.
 */
const MccSearchField = memo(function MccSearchField({
    resetKey,
    isSearching,
    onQuerySettled,
}: {
    resetKey: number;
    isSearching: boolean;
    onQuerySettled: (query: string) => void;
}) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [text, setText] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onSettledRef = useRef(onQuerySettled);
    onSettledRef.current = onQuerySettled;

    // Reset when sheet closes / reopens.
    useEffect(() => {
        setText('');
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, [resetKey]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSettledRef.current(text.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [text]);

    const handleClear = useCallback(() => {
        setText('');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onSettledRef.current('');
    }, []);

    return (
        <View>
            <View
                className="h-12 flex-row items-center rounded-2xl border px-3"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                }}
            >
                <Iconify
                    icon="heroicons:magnifying-glass"
                    size={18}
                    color={colors.icon.lighter}
                />
                <BottomSheetTextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Search MCC codes…"
                    placeholderTextColor={colors.text.placeholder}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    style={[styles.searchInput, {color: colors.text.primary}]}
                />
                {isSearching ? (
                    <ActivityIndicator size="small" color={colors.icon.primary} />
                ) : text.length > 0 ? (
                    <Pressable
                        onPress={handleClear}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        className="p-1 active:opacity-70"
                    >
                        <Iconify
                            icon="heroicons:x-mark"
                            size={18}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                ) : null}
            </View>
            {isSearching ? (
                <AppText
                    variant="caption-xs"
                    className="mt-1.5 text-text-primary-lighter"
                >
                    Searching…
                </AppText>
            ) : null}
        </View>
    );
});

const MccRow = memo(function MccRow({
    item,
    selected,
    onPress,
}: {
    item: MCCResponse;
    selected: boolean;
    onPress: (item: MCCResponse) => void;
}) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const hasIcon = !!(item.icon?.url || item.icon?.id);
    const iconColor = selected ? colors.accent.sky : colors.icon.primary;

    return (
        <Pressable
            onPress={() => onPress(item)}
            className={`mx-4 mb-2 flex-row items-center rounded-2xl border px-3 py-3 ${
                selected
                    ? 'border-accent-sky bg-accent-sky-bg'
                    : 'border-border-input bg-bg-canvas'
            }`}
        >
            <View
                className={`mr-3 h-10 w-10 items-center justify-center overflow-hidden rounded-xl border ${
                    selected
                        ? 'border-accent-sky bg-accent-sky-bg'
                        : 'border-border-input bg-bg-primary'
                }`}
            >
                {hasIcon ? (
                    <AppImage
                        id={item.icon?.id}
                        url={item.icon?.url}
                        size="full"
                        variant="square"
                        contentFit="cover"
                        className="h-full w-full"
                        fallbackIcon={
                            <Iconify
                                icon="heroicons:building-storefront"
                                size={18}
                                color={iconColor}
                            />
                        }
                    />
                ) : (
                    <Iconify
                        icon="heroicons:building-storefront"
                        size={18}
                        color={iconColor}
                    />
                )}
            </View>
            <View className="min-w-0 flex-1">
                <AppText
                    variant="body-base"
                    className="font-semibold text-text-primary"
                    numberOfLines={2}
                >
                    {item.description}
                </AppText>
                <AppText
                    variant="caption-xs"
                    className="mt-0.5 text-text-primary-lighter"
                >
                    MCC {item.code}
                </AppText>
            </View>
            {selected ? (
                <Iconify
                    icon="heroicons:check-circle-solid"
                    size={20}
                    color={colors.accent.sky}
                />
            ) : null}
        </Pressable>
    );
});

export function MccPickerBottomSheet({
    visible,
    selectedCode,
    onClose,
    onSelect,
}: MccPickerBottomSheetProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['80%'], []);
    const loadingMoreRef = useRef(false);
    const hasWarmFetchedRef = useRef(false);
    const requestSeqRef = useRef(0);
    /** Last browse (empty-query) page — used for instant local filter. */
    const browseCacheRef = useRef<MCCResponse[]>([]);

    const [searchResetKey, setSearchResetKey] = useState(0);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<MCCResponse[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = useCallback(
        async (nextOffset: number, append: boolean, query: string) => {
            const trimmed = query.trim();

            if (append) {
                if (loadingMoreRef.current) return;
                loadingMoreRef.current = true;
                setLoadingMore(true);
            } else if (!trimmed) {
                // Initial / clear-search load only — keep list when searching.
                if (browseCacheRef.current.length === 0) {
                    setLoading(true);
                }
                setError(null);
            }

            const seq = ++requestSeqRef.current;

            try {
                const response = await ListMccCodesApi({
                    query: trimmed || undefined,
                    offset: nextOffset,
                    limit: PAGE_SIZE,
                });

                if (seq !== requestSeqRef.current) return;

                const rawPage = response.data ?? [];
                const pageData = filterMccByQuery(rawPage, trimmed);
                const total = response.pagination?.total ?? pageData.length;

                if (!append && !trimmed) {
                    browseCacheRef.current = pageData;
                }

                setResults((prev) => {
                    if (!append) return pageData;
                    const existing = new Set(prev.map((r) => r.code));
                    return [...prev, ...pageData.filter((r) => !existing.has(r.code))];
                });
                setOffset(nextOffset + rawPage.length);
                const filteredLocally =
                    trimmed.length > 0 && pageData.length < rawPage.length;
                setHasMore(
                    !filteredLocally && nextOffset + rawPage.length < total,
                );
            } catch (err: any) {
                if (seq !== requestSeqRef.current) return;
                if (!append) {
                    setHasMore(false);
                    setError(err?.message || "Couldn't load MCC codes.");
                    // Keep locally filtered rows if we already showed them.
                    if (!trimmed) {
                        setResults((prev) =>
                            prev.length > 0 ? prev : browseCacheRef.current,
                        );
                    }
                }
            } finally {
                if (append) {
                    loadingMoreRef.current = false;
                    setLoadingMore(false);
                } else if (seq === requestSeqRef.current) {
                    setLoading(false);
                    setIsSearching(false);
                }
            }
        },
        [],
    );

    useEffect(() => {
        if (hasWarmFetchedRef.current) return;
        hasWarmFetchedRef.current = true;
        void fetchResults(0, false, '');
    }, [fetchResults]);

    const handleQuerySettled = useCallback((query: string) => {
        setDebouncedQuery(query);
    }, []);

    // Instant local filter from browse cache, then API replace when done.
    useEffect(() => {
        if (!visible) return;

        const trimmed = debouncedQuery.trim();
        setError(null);

        if (!trimmed) {
            setIsSearching(false);
            if (browseCacheRef.current.length > 0) {
                setResults(browseCacheRef.current);
            }
            void fetchResults(0, false, '');
            return;
        }

        setResults(filterMccByQuery(browseCacheRef.current, trimmed));
        setIsSearching(true);
        void fetchResults(0, false, trimmed);
    }, [visible, debouncedQuery, fetchResults]);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
            return undefined;
        }
        bottomSheetModalRef.current?.dismiss();
        setDebouncedQuery('');
        setIsSearching(false);
        setSearchResetKey((k) => k + 1);
        setError(null);
        return undefined;
    }, [visible]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        [],
    );

    const handleSelect = useCallback(
        (item: MCCResponse) => {
            onSelect({
                code: item.code,
                description: item.description,
            });
            onClose();
        },
        [onClose, onSelect],
    );

    const renderItem: ListRenderItem<MCCResponse> = useCallback(
        ({item}) => (
            <MccRow
                item={item}
                selected={selectedCode === item.code}
                onPress={handleSelect}
            />
        ),
        [handleSelect, selectedCode],
    );

    const listBody = (() => {
        if (loading && results.length === 0) {
            return (
                <View className="flex-1 items-center justify-center py-16">
                    <ActivityIndicator color={colors.icon.primary} />
                </View>
            );
        }
        if (error && results.length === 0) {
            return (
                <View className="px-6 py-10">
                    <AppText className="mb-3 text-center text-text-primary-lighter">
                        {error}
                    </AppText>
                    <Pressable
                        onPress={() => fetchResults(0, false, debouncedQuery)}
                        className="items-center active:opacity-70"
                    >
                        <AppText className="font-semibold text-accent-sky">Retry</AppText>
                    </Pressable>
                </View>
            );
        }
        if (results.length === 0) {
            if (isSearching) {
                return (
                    <View className="flex-1 items-center justify-center py-16">
                        <ActivityIndicator color={colors.icon.primary} />
                        <AppText
                            variant="caption-xs"
                            className="mt-3 text-text-primary-lighter"
                        >
                            Searching…
                        </AppText>
                    </View>
                );
            }
            return (
                <SheetEmptyState
                    icon={
                        <Iconify
                            icon="heroicons:magnifying-glass"
                            size={28}
                            color={colors.icon.primary}
                        />
                    }
                    title={debouncedQuery ? 'No matches' : 'No MCC codes'}
                    description={
                        debouncedQuery
                            ? 'No MCC codes matched your search.'
                            : 'No merchant category codes are available yet.'
                    }
                />
            );
        }
        return (
            <BottomSheetFlatList
                data={results}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                onEndReached={() => {
                    if (hasMore && !loadingMore) {
                        void fetchResults(offset, true, debouncedQuery);
                    }
                }}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator className="py-4" color={colors.icon.primary} />
                    ) : null
                }
            />
        );
    })();

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enableOverDrag={false}
            enableContentPanningGesture={false}
            enableHandlePanningGesture
            enablePanDownToClose
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: isDark ? COLORS.dark.bg.primary : COLORS.light.bg.primary,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <View className="px-4 pb-3">
                <View className="mb-3 flex-row items-center justify-between">
                    <AppText variant="h4" className="font-bold text-text-primary">
                        Category (MCC)
                    </AppText>
                    <Pressable onPress={onClose} className="p-2">
                        <Iconify
                            icon="heroicons:x-mark"
                            size={22}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                </View>

                <MccSearchField
                    resetKey={searchResetKey}
                    isSearching={isSearching}
                    onQuerySettled={handleQuerySettled}
                />
            </View>

            {listBody}
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 40,
        paddingTop: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        marginRight: 6,
        paddingVertical: 0,
        fontSize: 16,
    },
});
