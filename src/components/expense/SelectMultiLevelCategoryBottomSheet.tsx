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
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {SearchClearButton} from '@/src/components/common/SearchClearButton';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {
    canDrillCoicop,
    coversDescendants,
    formatCategoryCode,
} from '@/src/components/expense/multi-level-category/coicopRef';
import {toggleCategorySelection} from '@/src/components/expense/multi-level-category/selection';
import {MultiLevelCategorySelection} from '@/src/components/expense/multi-level-category/types';
import {
    SheetTab,
    useMultiLevelCategoryBrowse,
} from '@/src/components/expense/multi-level-category/useMultiLevelCategoryBrowse';
import {ExpenseCategoryDescendantItem} from '@/src/api/dto/expense/category';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';

type Props = {
    visible: boolean;
    initialSelected: MultiLevelCategorySelection[];
    onClose: () => void;
    onConfirm: (selected: MultiLevelCategorySelection[]) => void;
};

function toSelection(item: ExpenseCategoryDescendantItem): MultiLevelCategorySelection {
    return {
        id: item.id,
        name: item.title,
        categoryRef: item.category_ref,
        level: item.level,
        iconId: item.icon?.id,
        iconUrl: item.icon?.url,
        coversDescendants: coversDescendants(item.category_ref),
    };
}

export function SelectMultiLevelCategoryBottomSheet({
    visible,
    initialSelected,
    onClose,
    onConfirm,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    const [tab, setTab] = useState<SheetTab>('levels');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMap, setSelectedMap] = useState<Record<number, MultiLevelCategorySelection>>(
        {},
    );

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
        const next: Record<number, MultiLevelCategorySelection> = {};
        for (const item of initialSelected) {
            next[item.id] = item;
        }
        setSelectedMap(next);
        setTab('levels');
        setSearchQuery('');
        bottomSheetModalRef.current?.present();
        // Sync selection only when the sheet opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const selectedList = useMemo(
        () => Object.values(selectedMap).sort((a, b) => a.name.localeCompare(b.name)),
        [selectedMap],
    );
    const selectedCount = selectedList.length;

    const filteredSelected = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q || tab !== 'selected') return selectedList;
        return selectedList.filter((s) => s.name.toLowerCase().includes(q));
    }, [searchQuery, selectedList, tab]);

    const handleDone = useCallback(() => {
        onConfirm(Object.values(selectedMap));
        onClose();
    }, [onClose, onConfirm, selectedMap]);

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

    const breadcrumbLabel = useMemo(() => {
        if (stack.length <= 1) return null;
        return stack
            .slice(1)
            .map((s) => s.title)
            .join(' · ');
    }, [stack]);

    const renderBrowseItem: ListRenderItem<ExpenseCategoryDescendantItem> = useCallback(
        ({item}) => {
            const isSelected = !!selectedMap[item.id];
            const canDrill =
                tab === 'levels' &&
                !isSearching &&
                canDrillCoicop(item.category_ref, item.level);
            const code = formatCategoryCode(item.category_ref);
            const secondary = isSelected && coversDescendants(item.category_ref)
                ? 'Covers this and all under it'
                : canDrill
                  ? 'Open for subcategories'
                  : code
                    ? code
                    : undefined;

            return (
                <View
                    className={`mb-2 flex-row items-center gap-2 rounded-2xl border px-2 py-2 ${
                        isSelected
                            ? 'border-accent-sky bg-accent-sky-bg'
                            : 'border-border-input bg-bg-primary'
                    }`}
                >
                    <Pressable
                        onPress={() =>
                            setSelectedMap((prev) =>
                                toggleCategorySelection(prev, toSelection(item)),
                            )
                        }
                        accessibilityRole="checkbox"
                        accessibilityState={{checked: isSelected}}
                        accessibilityLabel="Select category"
                        className="flex-1 flex-row items-center gap-3 px-1 py-1 active:opacity-80"
                    >
                        <View className="h-10 w-10 overflow-hidden rounded-full">
                            <AppImageV2
                                id={item.icon?.id ?? `ml-cat-${item.id}`}
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
                            {!!secondary && (
                                <AppText
                                    variant="caption-xs"
                                    className="text-text-primary-lighter"
                                    numberOfLines={1}
                                >
                                    {secondary}
                                </AppText>
                            )}
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
            isSearching,
            selectedMap,
            tab,
        ],
    );

    const renderSelectedItem: ListRenderItem<MultiLevelCategorySelection> = useCallback(
        ({item}) => (
            <View className="mb-2 flex-row items-center gap-2 rounded-2xl border border-accent-sky bg-accent-sky-bg px-2 py-2">
                <Pressable
                    onPress={() =>
                        setSelectedMap((prev) => {
                            const next = {...prev};
                            delete next[item.id];
                            return next;
                        })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Remove category"
                    className="flex-1 flex-row items-center gap-3 px-1 py-1 active:opacity-80"
                >
                    <View className="h-10 w-10 overflow-hidden rounded-full">
                        <AppImageV2
                            id={item.iconId ?? `ml-sel-${item.id}`}
                            url={item.iconUrl}
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
                        <AppText className="font-semibold text-text-primary" numberOfLines={1}>
                            {item.name}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="text-text-primary-lighter"
                            numberOfLines={1}
                        >
                            {item.coversDescendants
                                ? 'All under this · tap to remove'
                                : 'Tap to remove'}
                        </AppText>
                    </View>
                    <Iconify
                        icon="heroicons:x-circle"
                        size={22}
                        color={colors.icon.lighter}
                    />
                </Pressable>
            </View>
        ),
        [colors.icon.lighter],
    );

    const emptyTitle =
        tab === 'levels'
            ? current.parentRef
                ? 'No subcategories here'
                : 'No category groups yet'
            : tab === 'selected'
              ? 'Nothing selected'
              : 'No categories yet';
    const emptyDescription =
        tab === 'levels'
            ? current.parentRef
                ? 'Try another group or search.'
                : 'Try search to find a category.'
            : tab === 'selected'
              ? 'Pick categories from Levels or List.'
              : 'Try search to find a category.';

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
                        <Pressable onPress={onClose} className="p-2 active:opacity-60">
                            <Iconify
                                icon="heroicons:x-mark"
                                size={22}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary">
                            Choose categories
                        </AppText>
                        <View className="w-10" />
                    </View>
                    <AppText
                        variant="caption-xs"
                        className="mt-2 text-center text-text-primary-lighter"
                    >
                        Pick a group to cover everything under it, or open it to go deeper
                    </AppText>
                </View>

                <View className="mx-6 mt-3 flex-row rounded-xl border border-border-input bg-bg-canvas p-1">
                    {([
                        {key: 'levels' as const, label: 'Levels'},
                        {key: 'list' as const, label: 'List'},
                        {
                            key: 'selected' as const,
                            label: selectedCount > 0 ? `Selected (${selectedCount})` : 'Selected',
                        },
                    ]).map((t) => {
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
                                        active ? 'text-accent-sky' : 'text-text-primary-lighter'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {t.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="px-6 pt-3 pb-2">
                    <AppInput
                        placeholder={
                            tab === 'selected' ? 'Filter selected' : 'Search categories'
                        }
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
                    <View className="flex-row items-center gap-2 px-6 pb-2">
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
                ) : null}

                <View style={styles.body}>
                    {tab === 'selected' ? (
                        <BottomSheetFlatList
                            data={filteredSelected}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderSelectedItem}
                            style={styles.list}
                            contentContainerStyle={
                                filteredSelected.length === 0
                                    ? styles.emptyListContent
                                    : styles.listContent
                            }
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <SheetEmptyState
                                    icon={
                                        <Iconify
                                            icon="heroicons:check-circle"
                                            size={32}
                                            color={colors.icon.lighter}
                                        />
                                    }
                                    title={
                                        searchQuery.trim()
                                            ? 'Nothing matched'
                                            : emptyTitle
                                    }
                                    description={
                                        searchQuery.trim()
                                            ? 'Try a different filter.'
                                            : emptyDescription
                                    }
                                />
                            }
                        />
                    ) : loading && items.length === 0 ? (
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
                            data={items}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderBrowseItem}
                            onEndReached={loadMore}
                            onEndReachedThreshold={0.4}
                            style={styles.list}
                            contentContainerStyle={
                                items.length === 0 ? styles.emptyListContent : styles.listContent
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
                                    <View style={{height: 12}} />
                                )
                            }
                            ListEmptyComponent={
                                <SheetEmptyState
                                    icon={
                                        <Iconify
                                            icon="heroicons:magnifying-glass-minus"
                                            size={32}
                                            color={colors.icon.lighter}
                                        />
                                    }
                                    title={
                                        isSearching ? 'Nothing found' : emptyTitle
                                    }
                                    description={
                                        isSearching
                                            ? 'Try a different search.'
                                            : emptyDescription
                                    }
                                />
                            }
                        />
                    )}
                </View>

                <View className="border-t border-border-input px-6 pb-8 pt-3">
                    <AppButton variant="primary" onPress={handleDone}>
                        Done{selectedCount > 0 ? ` (${selectedCount})` : ''}
                    </AppButton>
                </View>
            </View>
        </BottomSheetModal>
    );
}

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
    centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
});
