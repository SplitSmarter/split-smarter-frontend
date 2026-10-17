import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ListMccCodesApi} from '@/src/api/expense/mcc';
import {MCCResponse} from '@/src/api/dto/expense/merchant';

const PAGE_SIZE = 40;
const SEARCH_DEBOUNCE_MS = 350;

export type SelectedMcc = {
    code: string;
    description: string;
};

interface MccPickerBottomSheetProps {
    visible: boolean;
    selectedCode?: string | null;
    onClose: () => void;
    onSelect: (mcc: SelectedMcc) => void;
}

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
    const loadingRef = useRef(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<MCCResponse[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    const fetchResults = useCallback(async (nextOffset: number, append: boolean, query: string) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await ListMccCodesApi({
                query: query || undefined,
                offset: nextOffset,
                limit: PAGE_SIZE,
            });
            const pageData = response.data ?? [];
            const total = response.pagination?.total ?? pageData.length;

            setResults((prev) => {
                if (!append) return pageData;
                const existing = new Set(prev.map((r) => r.code));
                return [...prev, ...pageData.filter((r) => !existing.has(r.code))];
            });
            setOffset(nextOffset + pageData.length);
            setHasMore(nextOffset + pageData.length < total);

            if (!append && !response.data && response.message) {
                setError(response.message);
            }
        } catch (err: any) {
            if (!append) {
                setResults([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load MCC codes.");
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (!visible) return;
        fetchResults(0, false, debouncedQuery);
    }, [visible, debouncedQuery, fetchResults]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                bottomSheetModalRef.current?.present();
            }, 50);
            return () => clearTimeout(timer);
        }

        bottomSheetModalRef.current?.dismiss();
        setSearchQuery('');
        setDebouncedQuery('');
        setResults([]);
        setError(null);
        return undefined;
    }, [visible]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        ),
        []
    );

    const handleSelect = (item: MCCResponse) => {
        onSelect({
            code: item.code,
            description: item.description,
        });
        onClose();
    };

    const renderItem: ListRenderItem<MCCResponse> = ({item}) => {
        const isSelected = selectedCode === item.code;
        return (
            <Pressable
                onPress={() => handleSelect(item)}
                className={`mx-4 mb-2 rounded-2xl border px-4 py-3 ${
                    isSelected
                        ? 'border-accent-sky bg-accent-sky-bg'
                        : 'border-border-input bg-bg-canvas'
                }`}
            >
                <AppText variant="body-base" className="font-semibold text-text-primary">
                    {item.description}
                </AppText>
                <AppText variant="caption-xs" className="mt-1 text-text-primary-lighter">
                    MCC {item.code}
                </AppText>
            </Pressable>
        );
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enablePanDownToClose
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

                <AppInput
                    placeholder="Search MCC codes…"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center py-16">
                    <ActivityIndicator color={colors.icon.primary} />
                </View>
            ) : error ? (
                <View className="px-6 py-10">
                    <AppText className="text-center text-text-primary-lighter">{error}</AppText>
                </View>
            ) : results.length === 0 ? (
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
            ) : (
                <BottomSheetFlatList
                    data={results}
                    keyExtractor={(item) => item.code}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onEndReached={() => {
                        if (hasMore && !loadingMore) {
                            fetchResults(offset, true, debouncedQuery);
                        }
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator
                                className="py-4"
                                color={colors.icon.primary}
                            />
                        ) : null
                    }
                />
            )}
        </BottomSheetModal>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 40,
        paddingTop: 4,
    },
});
