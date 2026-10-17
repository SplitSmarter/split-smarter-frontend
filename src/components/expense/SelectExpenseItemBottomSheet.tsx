import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    ListRenderItem,
    Modal,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
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
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {AppButton} from '@/src/components/common/AppButton';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ListUserExpenseItemsApi} from '@/src/api/expense/item';
import {ExpenseItemResponse} from '@/src/api/dto/expense/item';
import {ExpenseItemSource} from '@/src/api/dto/constants';
import {PaginationResponse} from '@/src/api/dto/ApiResponse';
import type {
    ExpenseItem as DraftExpenseItem,
    PayerUser,
} from '@/src/store/draft/expenseDraftStore';
import {applyItemAttributionToSettlements} from '@/src/utils/expense/expenseCalculations';

const PAGE_SIZE = 40;
const ITEM_SOURCES = [ExpenseItemSource.SYSTEM, ExpenseItemSource.CUSTOM];

type FilterTab = 'All' | 'System' | 'Custom';

export type ItemSheetSaveOpts = {
    syncTotalAmount?: number;
    redistributeParticipants?: boolean;
    /** Updated settlements: pool + item attributions */
    splitParticipants?: PayerUser[];
};

interface SelectExpenseItemBottomSheetProps {
    visible: boolean;
    /** Current draft selection — sheet works on a local copy until Save */
    selectedItems: DraftExpenseItem[];
    splitParticipants: PayerUser[];
    currencySymbol?: string;
    expenseTotalAmount: number;
    onClose: () => void;
    onSave: (items: DraftExpenseItem[], opts?: ItemSheetSaveOpts) => void;
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
        paidBetween: [],
    };
}

export const SelectExpenseItemBottomSheet: React.FC<SelectExpenseItemBottomSheetProps> = ({
    visible,
    selectedItems,
    splitParticipants,
    currencySymbol = '₹',
    expenseTotalAmount,
    onClose,
    onSave,
    onAddNew,
}) => {
    const theme = themeStore((s) => s.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const insets = useSafeAreaInsets();
    const iconColor = colors.icon.primary;
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
    const [overLimitVisible, setOverLimitVisible] = useState(false);
    const [overLimitMsg, setOverLimitMsg] = useState('');
    const pendingSaveOptsRef = useRef<ItemSheetSaveOpts | undefined>(undefined);

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
            setPending(
                selectedItems.map((i) => ({
                    ...i,
                    sharedBetween: i.sharedBetween ?? [],
                    paidBetween: i.paidBetween ?? [],
                })),
            );
            setMismatchVisible(false);
            setOverLimitVisible(false);
            pendingSaveOptsRef.current = undefined;
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

    const buildSavedItems = useCallback((): DraftExpenseItem[] => {
        return pending
            .filter((item) => item.quantity > 0)
            .map((item) => ({
                ...item,
                sharedBetween: item.sharedBetween ?? [],
                paidBetween: item.paidBetween ?? [],
            }));
    }, [pending]);

    const finalizeSave = useCallback(
        (opts?: ItemSheetSaveOpts, forceIncreaseOverLimit = false) => {
            const nextItems = buildSavedItems();
            const effectiveTotal =
                typeof opts?.syncTotalAmount === 'number'
                    ? opts.syncTotalAmount
                    : expenseTotalAmount;

            const {participants, overLimitKeys} = applyItemAttributionToSettlements(
                splitParticipants,
                selectedItems,
                nextItems,
                effectiveTotal
            );

            if (overLimitKeys.length > 0 && !forceIncreaseOverLimit) {
                pendingSaveOptsRef.current = opts;
                const names = overLimitKeys
                    .map((k) => {
                        const p = participants.find(
                            (x) => `${x.id}-${x.user_type || 'USER'}` === k
                        );
                        return p?.name || k;
                    })
                    .join(', ');
                setOverLimitMsg(
                    `Item assignments exceed the current Split Between amount for: ${names}. Increase their shared amount to match items (pool becomes 0 for them)?`
                );
                setOverLimitVisible(true);
                return;
            }

            onSave(nextItems, {
                ...opts,
                splitParticipants: participants,
            });
            onClose();
        },
        [
            buildSavedItems,
            expenseTotalAmount,
            splitParticipants,
            selectedItems,
            onSave,
            onClose,
        ]
    );

    const amountsDiffer =
        pending.length > 0 && Math.abs(selectedTotal - expenseTotalAmount) > 0.009;
    const isSettingFromEmpty = amountsDiffer && expenseTotalAmount <= 0.009;

    const handleConfirm = useCallback(() => {
        if (amountsDiffer) {
            setMismatchVisible(true);
            return;
        }
        finalizeSave();
    }, [amountsDiffer, finalizeSave]);

    const handleUpdateAmountAndSave = useCallback(() => {
        setMismatchVisible(false);
        finalizeSave({
            syncTotalAmount: selectedTotal,
            redistributeParticipants: true,
        });
    }, [finalizeSave, selectedTotal]);

    const handleKeepAmountAndSave = useCallback(() => {
        setMismatchVisible(false);
        finalizeSave();
    }, [finalizeSave]);

    const handleAcceptOverLimit = useCallback(() => {
        setOverLimitVisible(false);
        finalizeSave(pendingSaveOptsRef.current, true);
    }, [finalizeSave]);

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
                        backgroundColor: colors.bg.overlay,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.status.border,
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
        [footerPad, colors, onAddNew, onClose, handleConfirm, pending.length]
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
                        fallbackComponent={
                            <EntityFallbackIcon kind="expenseItem" size={22} color={iconColor} />
                        }
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
                        <Iconify icon="heroicons:check-circle-solid" size={26} color={colors.accent.sky} />
                    ) : (
                        <Iconify icon="heroicons:plus-circle" size={26} color={iconColor} />
                    )}
                </Pressable>
            );
        },
        [pending, handleToggle, currencySymbol, iconColor, colors.accent.sky]
    );

    const listHeader = useMemo(
        () => (
            <View className="mb-3">
                <AppText variant="caption-xs" className="mb-2 font-semibold uppercase tracking-wider text-text-primary-lighter">
                    Selected
                </AppText>
                <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                    style={styles.selectedRow}
                    contentContainerStyle={styles.selectedRowContent}
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
                                className="mr-3 rounded-2xl border border-border-input bg-bg-primary-lighter px-3 py-2"
                                style={styles.selectedCard}
                            >
                                <View className="flex-row items-center">
                                    <Pressable
                                        onPress={() => updateQuantity(item.id, -item.quantity)}
                                        hitSlop={8}
                                        className="absolute -right-1 -top-1 z-10 h-5 w-5 items-center justify-center rounded-full"
                                        style={{backgroundColor: colors.status.error}}
                                    >
                                        <Iconify
                                            icon="heroicons:x-mark"
                                            size={12}
                                            color={colors.text.contrast}
                                        />
                                    </Pressable>
                                    <AppImageV2
                                        id={`sel-${item.id}`}
                                        url={item.iconUrl ?? null}
                                        style={{width: 36, height: 36}}
                                        className="rounded-full"
                                        contentFit="contain"
                                        fallbackComponent={
                                            <EntityFallbackIcon kind="expenseItem" size={18} color={iconColor} />
                                        }
                                    />
                                    <View className="ml-2" style={{width: 140}}>
                                        <AppText
                                            variant="caption-xs"
                                            className="font-bold text-text-primary"
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </AppText>
                                        <View className="mt-1 flex-row items-center self-start rounded-lg bg-bg-primary px-1">
                                            <Pressable
                                                onPress={() => updateQuantity(item.id, -1)}
                                                className="p-1"
                                            >
                                                <Iconify
                                                    icon="heroicons:minus"
                                                    size={14}
                                                    color={iconColor}
                                                />
                                            </Pressable>
                                            <AppText className="mx-1 font-bold text-text-primary">
                                                {item.quantity}
                                            </AppText>
                                            <Pressable
                                                onPress={() => updateQuantity(item.id, 1)}
                                                className="p-1"
                                            >
                                                <Iconify
                                                    icon="heroicons:plus"
                                                    size={14}
                                                    color={iconColor}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        ),
        [pending, updateQuantity, iconColor, colors]
    );

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={{height: 96}} />;
        return (
            <View className="items-center py-4">
                <ActivityIndicator size="small" color={colors.icon.primary} />
                <AppText variant="caption-xs" className="mt-2 text-text-primary-lighter">
                    Loading more...
                </AppText>
            </View>
        );
    }, [loadingMore, colors.icon.primary]);

    const renderBody = () => {
        if (loading && catalog.length === 0) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.icon.primary} />
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
                    backgroundColor: colors.bg.overlay,
                    borderRadius: 28,
                }}
                handleIndicatorStyle={{
                    backgroundColor: colors.icon.lighter,
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
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color={colors.status.warning}
                                />
                            </View>
                            <AppText variant="h3" className="text-center font-bold text-text-primary">
                                {isSettingFromEmpty ? 'Set amount from items?' : 'Amount mismatch'}
                            </AppText>
                        </View>

                        <AppText className="mb-2 text-center text-text-primary-lighter">
                            {isSettingFromEmpty ? (
                                <>
                                    Selected items total{' '}
                                    <AppText className="font-bold text-green-increase">
                                        {currencySymbol}
                                        {selectedTotal.toFixed(2)}
                                    </AppText>
                                    , but no expense amount is set yet.
                                </>
                            ) : (
                                <>
                                    Items sum to{' '}
                                    <AppText className="font-bold text-green-increase">
                                        {currencySymbol}
                                        {selectedTotal.toFixed(2)}
                                    </AppText>
                                    , but the expense amount is{' '}
                                    <AppText className="font-bold text-golden">
                                        {currencySymbol}
                                        {expenseTotalAmount.toFixed(2)}
                                    </AppText>
                                    .
                                </>
                            )}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mb-6 text-center text-text-primary-lighter"
                        >
                            Updating the amount will also redistribute Paid by and Split Between
                            (locked shares stay fixed).
                        </AppText>

                        <AppButton variant="primary" size="md" onPress={handleUpdateAmountAndSave}>
                            {isSettingFromEmpty
                                ? `Set amount to ${currencySymbol}${selectedTotal.toFixed(2)}`
                                : `Update amount to ${currencySymbol}${selectedTotal.toFixed(2)}`}
                        </AppButton>

                        {!isSettingFromEmpty && (
                            <AppButton
                                variant="secondary"
                                size="md"
                                className="mt-3"
                                onPress={handleKeepAmountAndSave}
                            >
                                Keep {currencySymbol}
                                {expenseTotalAmount.toFixed(2)}
                            </AppButton>
                        )}

                        <Pressable
                            onPress={() => setMismatchVisible(false)}
                            className="mt-3 items-center py-3"
                        >
                            <AppText className="font-bold text-text-link">Go back</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={overLimitVisible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className="w-full rounded-3xl border border-border-input bg-bg-primary p-6">
                        <View className="mb-4 items-center">
                            <View className="mb-2 rounded-full bg-amber-500/10 p-3">
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color={colors.status.warning}
                                />
                            </View>
                            <AppText variant="h3" className="text-center font-bold text-text-primary">
                                Split amount too low
                            </AppText>
                        </View>
                        <AppText className="mb-6 text-center text-text-primary-lighter">
                            {overLimitMsg}
                        </AppText>
                        <AppButton variant="primary" size="md" onPress={handleAcceptOverLimit}>
                            Increase shared amounts
                        </AppButton>
                        <Pressable
                            onPress={() => setOverLimitVisible(false)}
                            className="mt-3 items-center py-3"
                        >
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
    selectedRow: {
        flexGrow: 0,
    },
    selectedRowContent: {
        paddingBottom: 4,
        paddingRight: 16,
        alignItems: 'flex-start',
    },
    selectedCard: {
        width: 220,
        flexShrink: 0,
    },
});

SelectExpenseItemBottomSheet.displayName = 'SelectExpenseItemBottomSheet';
