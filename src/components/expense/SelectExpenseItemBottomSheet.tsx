import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    ListRenderItem,
    Modal,
    ScrollView,
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetFooter,
    BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {AppButton} from '@/src/components/common/AppButton';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ListUserExpenseItemsApi} from '@/src/api/expense/item';
import {ExpenseItemResponse} from '@/src/api/dto/expense/item';
import {ExpenseItemSource} from '@/src/api/dto/constants';
import {PaginationResponse} from '@/src/api/dto/ApiResponse';
import type {ExpenseItem as DraftExpenseItem} from '@/src/store/draft/expenseDraftStore';

const PAGE_SIZE = 40;
const ITEM_SOURCES = [ExpenseItemSource.SYSTEM, ExpenseItemSource.CUSTOM];

type FilterTab = 'All' | 'System' | 'Custom';

interface SelectExpenseItemBottomSheetProps {
    visible: boolean;
    /** Current draft selection — sheet works on a local copy until Save */
    selectedItems: DraftExpenseItem[];
    currencySymbol?: string;
    expenseTotalAmount: number;
    onClose: () => void;
    onSave: (items: DraftExpenseItem[], opts?: {syncTotalAmount?: number}) => void;
    onAddNew?: () => void;
}

function resolveHasMore(
    pageData: ExpenseItemResponse[],
    offset: number,
    pagination?: PaginationResponse,
): boolean {
    if (typeof pagination?.has_next === 'boolean') return pagination.has_next;
    if (typeof pagination?.total === 'number') {
        return offset + pageData.length < pagination.total;
    }
    return pageData.length >= PAGE_SIZE;
}

function toDraftItem(item: ExpenseItemResponse): DraftExpenseItem {
    return {
        id: String(item.id),
        title: item.title,
        cost: item.cost,
        quantity: 1,
        iconUrl: item.icon?.url ?? null,
        sharedBetween: [],
    };
}

export const SelectExpenseItemBottomSheet: React.FC<SelectExpenseItemBottomSheetProps> = ({
    visible,
    selectedItems,
    currencySymbol = '₹',
    expenseTotalAmount,
    onClose,
    onSave,
    onAddNew,
}) => {
    const theme = themeStore((s) => s.theme);
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const iconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const emptyIconColor = iconColor;

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const loadingRef = useRef(false);
    const snapPoints = useMemo(() => ['88%'], []);
    const footerPad = Math.max(insets.bottom, 12) + 8;

    const [catalog, setCatalog] = useState<ExpenseItemResponse[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [pending, setPending] = useState<DraftExpenseItem[]>([]);
    const [mismatchVisible, setMismatchVisible] = useState(false);

    const fetchItems = useCallback(async (nextOffset: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) setLoadingMore(true);
        else {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await ListUserExpenseItemsApi({
                source_type: ITEM_SOURCES,
                offset: nextOffset,
                limit: PAGE_SIZE,
            });
            const pageData = response.data ?? [];

            setCatalog((prev) => {
                if (!append) return pageData;
                const existing = new Set(prev.map((i) => i.id));
                return [...prev, ...pageData.filter((i) => !existing.has(i.id))];
            });
            setOffset(nextOffset + pageData.length);
            setHasMore(resolveHasMore(pageData, nextOffset, response.pagination));

            if (!append && !response.data && response.message) {
                setError(response.message);
            }
        } catch (err: any) {
            console.error('Failed fetching expense items:', err);
            if (!append) {
                setCatalog([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load items. Check your connection and try again.");
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const resetAndLoad = useCallback(() => {
        setCatalog([]);
        setOffset(0);
        setHasMore(true);
        fetchItems(0, false);
    }, [fetchItems]);

    useEffect(() => {
        if (visible) {
            setSearchQuery('');
            setActiveTab('All');
            setPending(selectedItems.map((i) => ({...i})));
            setMismatchVisible(false);
            resetAndLoad();
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
        // Only re-seed selection when the sheet opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, resetAndLoad]);

    const trimmedQuery = searchQuery.trim().toLowerCase();
    const displayed = useMemo(() => {
        return catalog.filter((item) => {
            const matchesSearch =
                !trimmedQuery || item.title.toLowerCase().includes(trimmedQuery);
            const matchesTab =
                activeTab === 'All' ||
                (activeTab === 'System' && item.item_type === ExpenseItemSource.SYSTEM) ||
                (activeTab === 'Custom' && item.item_type === ExpenseItemSource.CUSTOM);
            return matchesSearch && matchesTab;
        });
    }, [catalog, trimmedQuery, activeTab]);

    const selectedTotal = useMemo(
        () => pending.reduce((sum, item) => sum + item.cost * item.quantity, 0),
        [pending]
    );

    const handleToggle = useCallback((item: ExpenseItemResponse) => {
        const stringId = String(item.id);
        setPending((prev) => {
            const exists = prev.some((i) => i.id === stringId);
            if (exists) return prev.filter((i) => i.id !== stringId);
            return [...prev, toDraftItem(item)];
        });
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setPending((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? {...item, quantity: Math.max(0, item.quantity + delta)}
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    }, []);

    const commitSave = useCallback(
        (opts?: {syncTotalAmount?: number}) => {
            onSave(pending, opts);
            onClose();
        },
        [onSave, onClose, pending]
    );

    const handleConfirm = useCallback(() => {
        if (pending.length > 0 && Math.abs(selectedTotal - expenseTotalAmount) > 0.009) {
            setMismatchVisible(true);
            return;
        }
        commitSave();
    }, [pending.length, selectedTotal, expenseTotalAmount, commitSave]);

    const handleUpdateAmountAndSave = useCallback(() => {
        setMismatchVisible(false);
        commitSave({syncTotalAmount: selectedTotal});
    }, [commitSave, selectedTotal]);

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingRef.current || loading || loadingMore) return;
        fetchItems(offset, true);
    }, [hasMore, loading, loadingMore, offset, fetchItems]);

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
        [isDark]
    );

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={0}>
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: footerPad,
                        backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: isDark ? '#2A2A2A' : '#E5E7EB',
                        flexDirection: 'row',
                        gap: 10,
                    }}
                >
                    {onAddNew ? (
                        <View className="flex-1">
                            <AppButton
                                variant="secondary"
                                size="md"
                                onPress={() => {
                                    onClose();
                                    setTimeout(() => onAddNew(), 200);
                                }}
                                renderIcon={(c) => (
                                    <Iconify icon="heroicons:plus" size={18} color={c} />
                                )}
                            >
                                Add New
                            </AppButton>
                        </View>
                    ) : null}
                    <View className={onAddNew ? 'flex-[2]' : 'flex-1'}>
                        <AppButton variant="primary" size="md" onPress={handleConfirm}>
                            {pending.length === 0
                                ? 'Use default item'
                                : `Save (${pending.length})`}
                        </AppButton>
                    </View>
                </View>
            </BottomSheetFooter>
        ),
        [footerPad, isDark, onAddNew, onClose, handleConfirm, pending.length]
    );

    const renderItem = useCallback<ListRenderItem<ExpenseItemResponse>>(
        ({item}) => {
            const stringId = String(item.id);
            const isSelected = pending.some((i) => i.id === stringId);
            return (
                <Pressable
                    onPress={() => handleToggle(item)}
                    className={`mb-3 flex-row items-center rounded-2xl border p-3.5 ${
                        isSelected
                            ? 'border-accent-sky bg-accent-sky-bg'
                            : 'border-border-input bg-bg-primary-lighter'
                    }`}
                >
                    <AppImageV2
                        id={`item-${item.id}`}
                        url={item.icon?.url ?? null}
                        style={{width: 44, height: 44}}
                        className="rounded-full"
                        contentFit="contain"
                    />
                    <View className="ml-3 min-w-0 flex-1">
                        <AppText
                            variant="body-base"
                            className="font-semibold text-text-primary"
                            numberOfLines={1}
                        >
                            {item.title}
                        </AppText>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            {currencySymbol}
                            {item.cost.toFixed(2)}
                            {item.item_type === ExpenseItemSource.SYSTEM ? ' · System' : ' · Custom'}
                        </AppText>
                    </View>
                    {isSelected ? (
                        <Iconify icon="heroicons:check-circle-solid" size={26} color="#0284C7" />
                    ) : (
                        <Iconify icon="heroicons:plus-circle" size={26} color={iconColor} />
                    )}
                </Pressable>
            );
        },
        [pending, handleToggle, currencySymbol, iconColor]
    );

    const listHeader = useMemo(
        () => (
            <View className="mb-3">
                <AppText variant="caption-xs" className="mb-2 font-semibold uppercase tracking-wider text-text-primary-lighter">
                    Selected
                </AppText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 4, gap: 10}}
                >
                    {pending.length === 0 ? (
                        <View className="rounded-2xl border border-dashed border-border-input px-4 py-3">
                            <AppText variant="caption-xs" className="text-text-primary-lighter">
                                None — default item will be used on submit
                            </AppText>
                        </View>
                    ) : (
                        pending.map((item) => (
                            <View
                                key={item.id}
                                className="items-center rounded-2xl border border-border-input bg-bg-primary-lighter px-3 py-2"
                            >
                                <Pressable
                                    onPress={() => updateQuantity(item.id, -item.quantity)}
                                    hitSlop={8}
                                    className="absolute -right-1 -top-1 z-10 h-5 w-5 items-center justify-center rounded-full"
                                    style={{backgroundColor: isDark ? COLORS.dark.status.error : COLORS.light.status.error}}
                                >
                                    <Iconify icon="heroicons:x-mark" size={12} color="#FFFFFF" />
                                </Pressable>
                                <AppImageV2
                                    id={`sel-${item.id}`}
                                    url={item.iconUrl ?? null}
                                    style={{width: 36, height: 36}}
                                    className="rounded-full"
                                    contentFit="contain"
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="mt-1 max-w-[72px] font-bold text-text-primary"
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </AppText>
                                <View className="mt-1 flex-row items-center rounded-lg bg-bg-primary px-1">
                                    <Pressable onPress={() => updateQuantity(item.id, -1)} className="p-1">
                                        <Iconify icon="heroicons:minus" size={14} color={iconColor} />
                                    </Pressable>
                                    <AppText className="mx-1 font-bold text-text-primary">{item.quantity}</AppText>
                                    <Pressable onPress={() => updateQuantity(item.id, 1)} className="p-1">
                                        <Iconify icon="heroicons:plus" size={14} color={iconColor} />
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        ),
        [pending, updateQuantity, iconColor, isDark]
    );

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={{height: 96}} />;
        return (
            <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.light.brand.primary} />
                <AppText variant="caption-xs" className="mt-2 text-text-primary-lighter">
                    Loading more...
                </AppText>
            </View>
        );
    }, [loadingMore]);

    const renderBody = () => {
        if (loading && catalog.length === 0) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.light.brand.primary} />
                    <AppText variant="caption-xs" className="mt-3 text-text-primary-lighter">
                        Loading items...
                    </AppText>
                </View>
            );
        }

        if (error && catalog.length === 0) {
            return (
                <View style={styles.centered}>
                    <SheetEmptyState
                        icon={
                            <Iconify icon="heroicons:exclamation-triangle" size={32} color={emptyIconColor} />
                        }
                        title="Unable to load items"
                        description={error}
                        primaryAction={{
                            label: 'Try Again',
                            onPress: resetAndLoad,
                            renderIcon: (c) => <Iconify icon="heroicons:arrow-path" size={18} color={c} />,
                        }}
                    />
                </View>
            );
        }

        if (catalog.length === 0) {
            return (
                <View style={styles.centered}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:cube" size={32} color={emptyIconColor} />}
                        title="No items yet"
                        description="You can still submit — the system default item will be attached automatically."
                        primaryAction={
                            onAddNew
                                ? {
                                      label: 'Add New Item',
                                      onPress: () => {
                                          onClose();
                                          setTimeout(() => onAddNew(), 200);
                                      },
                                      renderIcon: (c) => (
                                          <Iconify icon="heroicons:plus-circle" size={18} color={c} />
                                      ),
                                  }
                                : undefined
                        }
                    />
                </View>
            );
        }

        return (
            <BottomSheetFlatList
                data={displayed}
                keyExtractor={(item: ExpenseItemResponse) => String(item.id)}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                ListEmptyComponent={
                    <SheetEmptyState
                        icon={
                            <Iconify
                                icon="heroicons:magnifying-glass-minus"
                                size={32}
                                color={emptyIconColor}
                            />
                        }
                        title="No results"
                        description="Try another search or filter."
                        primaryAction={{
                            label: 'Clear Search',
                            onPress: () => setSearchQuery(''),
                            renderIcon: (c) => <Iconify icon="heroicons:x-mark" size={18} color={c} />,
                        }}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.4}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 8}}
            />
        );
    };

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                enablePanDownToClose
                onDismiss={onClose}
                backdropComponent={renderBackdrop}
                footerComponent={renderFooter}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                backgroundStyle={{
                    backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                    borderRadius: 28,
                }}
                handleIndicatorStyle={{
                    backgroundColor: isDark ? '#3F3F46' : '#D4D4D8',
                    width: 40,
                    height: 4,
                }}
            >
                <View className="flex-row items-center justify-between border-b border-border-input px-5 py-3">
                    <Pressable onPress={onClose} hitSlop={12} className="h-9 w-9 items-center justify-center">
                        <Iconify icon="heroicons:x-mark" size={22} color={iconColor} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        Select Items
                    </AppText>
                    <View className="w-9" />
                </View>

                <View className="px-5 pb-2 pt-3">
                    <AppInput
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        renderLeftIcon={(c) => (
                            <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />
                        )}
                        renderRightIcon={(c) =>
                            searchQuery.length > 0 ? (
                                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                                    <Iconify icon="heroicons:x-mark" size={20} color={c} />
                                </Pressable>
                            ) : null
                        }
                    />
                    <View className="mt-3 flex-row gap-2">
                        {(['All', 'System', 'Custom'] as FilterTab[]).map((tab) => {
                            const active = activeTab === tab;
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    className={`rounded-full border px-4 py-1.5 ${
                                        active
                                            ? 'border-accent-sky bg-accent-sky-bg'
                                            : 'border-border-input bg-bg-primary-lighter'
                                    }`}
                                >
                                    <AppText
                                        variant="caption-xs"
                                        className={
                                            active
                                                ? 'font-bold text-accent-sky'
                                                : 'font-medium text-text-primary-lighter'
                                        }
                                    >
                                        {tab}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.body}>{renderBody()}</View>
            </BottomSheetModal>

            <Modal visible={mismatchVisible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className="w-full rounded-3xl border border-border-input bg-bg-primary p-6">
                        <View className="mb-4 items-center">
                            <View className="mb-2 rounded-full bg-amber-500/10 p-3">
                                <Iconify icon="heroicons:exclamation-triangle" size={32} color="#F59E0B" />
                            </View>
                            <AppText variant="h3" className="text-center font-bold text-text-primary">
                                Amount Mismatch
                            </AppText>
                        </View>
                        <AppText className="mb-6 text-center text-text-primary-lighter">
                            Items sum to {currencySymbol}
                            {selectedTotal.toFixed(2)}, but the expense amount is {currencySymbol}
                            {expenseTotalAmount.toFixed(2)}.
                        </AppText>
                        <AppButton variant="primary" size="md" onPress={handleUpdateAmountAndSave}>
                            Update amount to {currencySymbol}
                            {selectedTotal.toFixed(2)}
                        </AppButton>
                        <Pressable onPress={() => setMismatchVisible(false)} className="mt-3 items-center py-3">
                            <AppText className="font-bold text-text-link">Go back</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
});

SelectExpenseItemBottomSheet.displayName = 'SelectExpenseItemBottomSheet';
