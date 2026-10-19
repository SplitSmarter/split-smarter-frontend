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
import {EntityFallbackIcon, EntityImageKind} from '@/src/components/common/EntityFallbackIcon';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {useRegisterOverlayDismiss} from '@/src/hooks/useBackDismissStack';
import {BudgetScopeEntity} from '../types';

export type BudgetMultiSelectItem = BudgetScopeEntity & {
    subtitle?: string;
};

type Props = {
    visible: boolean;
    title: string;
    kind: EntityImageKind;
    initialSelected: BudgetScopeEntity[];
    items: BudgetMultiSelectItem[];
    loading: boolean;
    loadingMore?: boolean;
    error?: string | null;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onLoadMore?: () => void;
    onRetry?: () => void;
    onClose: () => void;
    onConfirm: (selected: BudgetScopeEntity[]) => void;
};

export function BudgetMultiSelectSheet({
    visible,
    title,
    kind,
    initialSelected,
    items,
    loading,
    loadingMore = false,
    error,
    searchQuery,
    onSearchChange,
    onLoadMore,
    onRetry,
    onClose,
    onConfirm,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    const [selectedMap, setSelectedMap] = useState<Record<number, BudgetScopeEntity>>({});

    useRegisterOverlayDismiss(visible, onClose);

    useEffect(() => {
        if (!visible) {
            bottomSheetModalRef.current?.dismiss();
            return;
        }
        const next: Record<number, BudgetScopeEntity> = {};
        for (const item of initialSelected) {
            next[item.id] = item;
        }
        setSelectedMap(next);
        bottomSheetModalRef.current?.present();
        // Sync selection only when the sheet opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const selectedCount = Object.keys(selectedMap).length;

    const toggle = useCallback((item: BudgetMultiSelectItem) => {
        setSelectedMap((prev) => {
            const next = {...prev};
            if (next[item.id]) {
                delete next[item.id];
            } else {
                next[item.id] = {
                    id: item.id,
                    name: item.name,
                    iconId: item.iconId,
                    iconUrl: item.iconUrl,
                };
            }
            return next;
        });
    }, []);

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

    const renderItem: ListRenderItem<BudgetMultiSelectItem> = useCallback(
        ({item}) => {
            const isSelected = !!selectedMap[item.id];
            return (
                <Pressable
                    onPress={() => toggle(item)}
                    className={`mb-2 flex-row items-center gap-3 rounded-2xl border px-3 py-3 ${
                        isSelected
                            ? 'border-accent-sky bg-accent-sky-bg'
                            : 'border-border-input bg-bg-primary'
                    }`}
                >
                    <View className="h-10 w-10 overflow-hidden rounded-full">
                        <AppImageV2
                            id={item.iconId ?? `budget-pick-${item.id}`}
                            url={item.iconUrl}
                            contentFit="cover"
                            style={{width: '100%', height: '100%'}}
                            fallbackComponent={
                                <EntityFallbackIcon
                                    kind={kind}
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
                        {!!item.subtitle && (
                            <AppText
                                variant="caption-xs"
                                className="text-text-primary-lighter"
                                numberOfLines={1}
                            >
                                {item.subtitle}
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
            );
        },
        [colors.accent.sky, colors.icon.lighter, kind, selectedMap, toggle],
    );

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
                <View className="flex-row items-center justify-between border-b border-border-input px-6 py-4">
                    <Pressable onPress={onClose} className="p-2 active:opacity-60">
                        <Iconify
                            icon="heroicons:x-mark"
                            size={22}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        {title}
                    </AppText>
                    <View className="w-10" />
                </View>

                    <View className="px-6 pt-3 pb-2">
                    <AppInput
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        renderLeftIcon={(c) => (
                            <Iconify icon="heroicons:magnifying-glass" size={18} color={c} />
                        )}
                        renderRightIcon={(c) => (
                            <SearchClearButton
                                value={searchQuery}
                                onClear={() => onSearchChange('')}
                                color={c}
                            />
                        )}
                    />
                </View>

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
                                primaryAction={
                                    onRetry
                                        ? {
                                              label: 'Try again',
                                              onPress: onRetry,
                                              renderIcon: (c) => (
                                                  <Iconify
                                                      icon="heroicons:arrow-path"
                                                      size={18}
                                                      color={c}
                                                  />
                                              ),
                                          }
                                        : undefined
                                }
                            />
                        </View>
                    ) : (
                        <BottomSheetFlatList
                            data={items}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderItem}
                            onEndReached={onLoadMore}
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
                                    title="Nothing found"
                                    description="Try a different search."
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
