import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator,
    ListRenderItem,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetModal,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {SearchClearButton} from '@/src/components/common/SearchClearButton';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {
    canDrillCoicop,
    formatCategoryCode,
    isCoicopLeafLevel,
} from '@/src/components/expense/multi-level-category/coicopRef';
import {
    SheetTab,
    useMultiLevelCategoryBrowse,
} from '@/src/components/expense/multi-level-category/useMultiLevelCategoryBrowse';
import {ExpenseCategorySource} from '@/src/api/dto/constants';
import {
    ExpenseCategoryDescendantItem,
    ExpenseCategoryResponse,
} from '@/src/api/dto/expense/category';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';

type ExpenseSheetTab = Extract<SheetTab, 'levels' | 'list' | 'yours'>;

interface SelectCategoryBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (category: ExpenseCategoryResponse) => void;
}

function toExpenseCategoryResponse(
    item: ExpenseCategoryDescendantItem,
): ExpenseCategoryResponse {
    const raw = String(item.source_type ?? '').toUpperCase();
    const source_type =
        raw === 'CUSTOM' || raw === ExpenseCategorySource.CUSTOM
            ? ExpenseCategorySource.CUSTOM
            : ExpenseCategorySource.DEFAULT;

    return {
        id: item.id,
        title: item.title,
        description: item.description ?? undefined,
        source_type,
        owner_id: null,
        expense_count: 0,
        icon: item.icon ?? null,
    };
}

export const SelectExpenseCategoryBottomSheet = ({
    visible,
    onClose,
    onSelect,
    selectedId,
}: SelectCategoryBottomSheetProps) => {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const router = useRouter();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    const [tab, setTab] = useState<ExpenseSheetTab>('levels');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        stack,
        current,
        drillInto,
        goBack,
        canGoBack,
        items,
        loading,
        loadingMore,
        error,
        loadMore,
        reload,
        isSearching,
    } = useMultiLevelCategoryBrowse(visible, tab, searchQuery);

    useRegisterOverlayDismiss(visible, onClose);

    useEffect(() => {
        if (!visible) {
            bottomSheetModalRef.current?.dismiss();
            return;
        }
        setTab('levels');
        setSearchQuery('');
        bottomSheetModalRef.current?.present();
    }, [visible]);

    const handlePick = useCallback(
        (item: ExpenseCategoryDescendantItem) => {
            onSelect(toExpenseCategoryResponse(item));
            onClose();
        },
        [onClose, onSelect],
    );

    const handleAddNewCategoryPress = useCallback(() => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/expense/categories/add');
        }, 200);
    }, [onClose, router]);

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

    const breadcrumbLabel = useMemo(() => {
        if (stack.length <= 1) return null;
        return stack
            .slice(1)
            .map((s) => s.title)
            .join(' · ');
    }, [stack]);

    /** Mid hierarchy → horizontal rows; leaf / List / Yours → icon-above grid. */
    const useGridLayout =
        isSearching ||
        tab === 'list' ||
        tab === 'yours' ||
        (tab === 'levels' && isCoicopLeafLevel(current.level));

    const selectCurrentParent = useCallback(() => {
        if (current.categoryId == null) return;
        handlePick({
            id: current.categoryId,
            title: current.title,
            description: current.description,
            category_ref: current.parentRef,
            source_type: current.sourceType || 'SYSTEM',
            level: Math.max(1, current.level - 1),
            icon: current.iconId
                ? {id: current.iconId, url: current.iconUrl ?? '', name: '', extension: ''}
                : null,
        });
    }, [current, handlePick]);

    const renderHorizontalItem: ListRenderItem<ExpenseCategoryDescendantItem> = useCallback(
        ({item}) => {
            const isSelected = item.id === selectedId;
            const canDrill =
                tab === 'levels' &&
                !isSearching &&
                canDrillCoicop(item.category_ref, item.level);
            const code = formatCategoryCode(item.category_ref);
            const secondary = canDrill
                ? 'Tap to select · or open for subcategories'
                : code
                  ? code
                  : 'Tap to select';

            return (
                <View
                    className={`mb-2 flex-row items-center gap-2 rounded-2xl border px-2 py-2 ${
                        isSelected
                            ? 'border-accent-sky bg-accent-sky-bg'
                            : 'border-border-input bg-bg-primary'
                    }`}
                >
                    <Pressable
                        onPress={() => handlePick(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${item.title}`}
                        className="flex-1 flex-row items-center gap-3 px-1 py-1 active:opacity-80"
                    >
                        <View className="h-10 w-10 overflow-hidden rounded-full">
                            <AppImageV2
                                id={item.icon?.id ?? `exp-cat-${item.id}`}
                                url={item.icon?.url}
                                contentFit="cover"
                                style={{width: '100%', height: '100%'}}
                                fallbackComponent={
                                    <EntityFallbackIcon
                                        kind="expenseCategory"
                                        size={20}
                                        color={colors.icon.lighter}
                                    />
                                }
                            />
                        </View>
                        <View className="flex-1">
                            <AppText
                                className="font-semibold text-text-primary"
                                numberOfLines={1}
                            >
                                {item.title}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="text-text-primary-lighter"
                                numberOfLines={1}
                            >
                                {secondary}
                            </AppText>
                        </View>
                        {isSelected ? (
                            <Iconify
                                icon="heroicons:check-circle-solid"
                                size={22}
                                color={colors.accent.sky}
                            />
                        ) : (
                            <Iconify
                                icon="heroicons:plus-circle"
                                size={22}
                                color={colors.icon.lighter}
                            />
                        )}
                    </Pressable>
                    {canDrill ? (
                        <Pressable
                            onPress={() => drillInto(item)}
                            accessibilityRole="button"
                            accessibilityLabel="Show subcategories"
                            hitSlop={8}
                            className="rounded-xl p-2 active:opacity-60"
                        >
                            <Iconify
                                icon="heroicons:chevron-right"
                                size={22}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    ) : null}
                </View>
            );
        },
        [
            colors.accent.sky,
            colors.icon.lighter,
            colors.icon.primary,
            drillInto,
            handlePick,
            isSearching,
            selectedId,
            tab,
        ],
    );

    const renderGridItem: ListRenderItem<ExpenseCategoryDescendantItem> = useCallback(
        ({item}) => {
            const isSelected = item.id === selectedId;
            return (
                <Pressable
                    onPress={() => handlePick(item)}
                    style={styles.gridItem}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.title}`}
                    className={`mb-2 items-center rounded-xl p-2 ${
                        isSelected
                            ? 'border border-accent-sky bg-accent-sky-bg'
                            : ''
                    }`}
                >
                    <View className="mb-2 h-14 w-14 overflow-hidden rounded-full">
                        <AppImageV2
                            id={item.icon?.id ?? `exp-cat-grid-${item.id}`}
                            url={item.icon?.url}
                            contentFit="cover"
                            style={{width: '100%', height: '100%'}}
                            fallbackComponent={
                                <EntityFallbackIcon
                                    kind="expenseCategory"
                                    size={28}
                                    color={colors.icon.lighter}
                                />
                            }
                        />
                    </View>
                    <AppText
                        variant="caption-xs"
                        className="text-center text-text-primary"
                        numberOfLines={2}
                    >
                        {item.title}
                    </AppText>
                </Pressable>
            );
        },
        [colors.icon.lighter, handlePick, selectedId],
    );

    const emptyTitle =
        tab === 'levels'
            ? current.parentRef
                ? 'No subcategories here'
                : 'No category groups yet'
            : tab === 'yours'
              ? 'No categories of yours yet'
              : 'No system categories yet';
    const emptyDescription =
        tab === 'levels'
            ? current.parentRef
                ? 'Try another group or search.'
                : 'Try search or browse List / Yours.'
            : tab === 'yours'
              ? 'Create a category to use it here.'
              : 'Try search or check Levels.';

    const tabs: {key: ExpenseSheetTab; label: string}[] = [
        {key: 'levels', label: 'Levels'},
        {key: 'list', label: 'List'},
        {key: 'yours', label: 'Yours'},
    ];

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
                backgroundColor: colors.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <View style={styles.container}>
                <View className="border-b border-border-input px-6 py-4">
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={onClose}
                            className="rounded-full p-2 active:opacity-60"
                        >
                            <Iconify
                                icon="heroicons:x-mark"
                                size={22}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary">
                            Select category
                        </AppText>
                        <Pressable
                            onPress={handleAddNewCategoryPress}
                            className="rounded-full p-2 active:opacity-60"
                            accessibilityLabel="Add new category"
                        >
                            <Iconify
                                icon="heroicons:squares-plus"
                                size={22}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    </View>
                    <AppText
                        variant="caption-xs"
                        className="mt-2 text-center text-text-primary-lighter"
                    >
                        Select any level — or open a group to go deeper
                    </AppText>
                </View>

                <View className="mx-6 mt-3 flex-row rounded-xl border border-border-input bg-bg-canvas p-1">
                    {tabs.map((t) => {
                        const active = tab === t.key;
                        return (
                            <Pressable
                                key={t.key}
                                onPress={() => setTab(t.key)}
                                className={`flex-1 items-center rounded-lg py-2 ${
                                    active ? 'bg-accent-sky-bg' : ''
                                }`}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className={`font-semibold ${
                                        active
                                            ? 'text-accent-sky'
                                            : 'text-text-primary-lighter'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {t.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="px-6 pb-2 pt-3">
                    <AppInput
                        placeholder="Search categories"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        renderLeftIcon={(c) => (
                            <Iconify icon="heroicons:magnifying-glass" size={18} color={c} />
                        )}
                        renderRightIcon={(c) => (
                            <SearchClearButton
                                value={searchQuery}
                                onClear={() => setSearchQuery('')}
                                color={c}
                                size={18}
                            />
                        )}
                    />
                </View>

                {tab === 'levels' && canGoBack && !isSearching ? (
                    <View className="gap-2 px-6 pb-2">
                        <View className="flex-row items-center gap-2">
                            <Pressable
                                onPress={goBack}
                                className="flex-row items-center gap-1 rounded-full px-2 py-1 active:opacity-60"
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                            >
                                <Iconify
                                    icon="heroicons:chevron-left"
                                    size={18}
                                    color={colors.icon.primary}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold text-text-primary"
                                >
                                    Back
                                </AppText>
                            </Pressable>
                            {!!breadcrumbLabel && (
                                <AppText
                                    variant="caption-xs"
                                    className="flex-1 text-text-primary-lighter"
                                    numberOfLines={1}
                                >
                                    {breadcrumbLabel}
                                </AppText>
                            )}
                        </View>
                        {current.categoryId != null ? (
                            <Pressable
                                onPress={selectCurrentParent}
                                accessibilityRole="button"
                                accessibilityLabel={`Select ${current.title}`}
                                className={`flex-row items-center gap-2 rounded-2xl border px-3 py-2.5 active:opacity-80 ${
                                    current.categoryId === selectedId
                                        ? 'border-accent-sky bg-accent-sky-bg'
                                        : 'border-border-input bg-bg-primary'
                                }`}
                            >
                                <View className="h-9 w-9 overflow-hidden rounded-full">
                                    <AppImageV2
                                        id={current.iconId ?? `exp-parent-${current.categoryId}`}
                                        url={current.iconUrl}
                                        contentFit="cover"
                                        style={{width: '100%', height: '100%'}}
                                        fallbackComponent={
                                            <EntityFallbackIcon
                                                kind="expenseCategory"
                                                size={18}
                                                color={colors.icon.lighter}
                                            />
                                        }
                                    />
                                </View>
                                <View className="min-w-0 flex-1">
                                    <AppText
                                        className="font-semibold text-text-primary"
                                        numberOfLines={1}
                                    >
                                        Use “{current.title}”
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="text-text-primary-lighter"
                                        numberOfLines={1}
                                    >
                                        Select this group without going deeper
                                    </AppText>
                                </View>
                                {current.categoryId === selectedId ? (
                                    <Iconify
                                        icon="heroicons:check-circle-solid"
                                        size={22}
                                        color={colors.accent.sky}
                                    />
                                ) : (
                                    <Iconify
                                        icon="heroicons:plus-circle"
                                        size={22}
                                        color={colors.icon.lighter}
                                    />
                                )}
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}

                <View style={styles.body}>
                    {loading && items.length === 0 ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={colors.icon.primary} />
                        </View>
                    ) : error && items.length === 0 ? (
                        <View style={styles.centered}>
                            <SheetEmptyState
                                icon={
                                    <Iconify
                                        icon="heroicons:exclamation-triangle"
                                        size={32}
                                        color={colors.icon.lighter}
                                    />
                                }
                                title="Unable to load"
                                description={error}
                                primaryAction={{
                                    label: 'Try again',
                                    onPress: reload,
                                    renderIcon: (c) => (
                                        <Iconify
                                            icon="heroicons:arrow-path"
                                            size={18}
                                            color={c}
                                        />
                                    ),
                                }}
                            />
                        </View>
                    ) : (
                        <BottomSheetFlatList
                            key={useGridLayout ? 'grid' : 'rows'}
                            data={items}
                            keyExtractor={(item) => String(item.id)}
                            numColumns={useGridLayout ? 4 : 1}
                            renderItem={
                                useGridLayout ? renderGridItem : renderHorizontalItem
                            }
                            onEndReached={loadMore}
                            onEndReachedThreshold={0.4}
                            style={styles.list}
                            contentContainerStyle={
                                items.length === 0
                                    ? styles.emptyListContent
                                    : styles.listContent
                            }
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={
                                loadingMore ? (
                                    <ActivityIndicator
                                        style={{marginVertical: 12}}
                                        color={colors.icon.primary}
                                    />
                                ) : (
                                    <View style={{height: 16}} />
                                )
                            }
                            ListEmptyComponent={
                                <SheetEmptyState
                                    icon={
                                        tab === 'yours' ? (
                                            <Iconify
                                                icon="heroicons:squares-plus"
                                                size={32}
                                                color={colors.icon.lighter}
                                            />
                                        ) : (
                                            <Iconify
                                                icon="heroicons:magnifying-glass-minus"
                                                size={32}
                                                color={colors.icon.lighter}
                                            />
                                        )
                                    }
                                    title={isSearching ? 'Nothing found' : emptyTitle}
                                    description={
                                        isSearching
                                            ? 'Try a different search.'
                                            : emptyDescription
                                    }
                                    primaryAction={
                                        tab === 'yours' && !isSearching
                                            ? {
                                                  label: 'Add category',
                                                  onPress: handleAddNewCategoryPress,
                                                  renderIcon: (c) => (
                                                      <Iconify
                                                          icon="heroicons:squares-plus"
                                                          size={18}
                                                          color={c}
                                                      />
                                                  ),
                                              }
                                            : undefined
                                    }
                                />
                            }
                        />
                    )}
                </View>
            </View>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    body: {flex: 1},
    list: {flex: 1},
    listContent: {paddingHorizontal: 24, paddingBottom: 24},
    emptyListContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: 'center',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    gridItem: {width: '25%'},
});

SelectExpenseCategoryBottomSheet.displayName = 'SelectExpenseCategoryBottomSheet';
