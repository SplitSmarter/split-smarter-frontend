import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {BudgetScopeEntity} from '../types';
import {getElevatedCardStyle} from '../styles/elevatedCard';
import {BudgetSectionHeader} from './BudgetSectionHeader';
import {ScopeEntityChips} from './ScopeEntityChips';

type Props = {
    categories: BudgetScopeEntity[];
    places: BudgetScopeEntity[];
    merchants: BudgetScopeEntity[];
    memories: BudgetScopeEntity[];
    mapPrefilled: boolean;
    onOpenCategories: () => void;
    onOpenPlaces: () => void;
    onOpenMerchants: () => void;
    onOpenMemories: () => void;
    onRemoveCategory: (id: number) => void;
    onRemovePlace: (id: number) => void;
    onRemoveMerchant: (id: number) => void;
    onRemoveMemory: (id: number) => void;
};

function ScopeTile({
    label,
    count,
    emptyLabel,
    mapBadge,
    onPress,
    renderIcon,
}: {
    label: string;
    count: number;
    emptyLabel: string;
    mapBadge?: boolean;
    onPress: () => void;
    renderIcon: (color: string) => React.ReactNode;
}) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const hasSelection = count > 0;

    return (
        <Pressable
            onPress={onPress}
            className={`flex-1 min-w-[46%] rounded-2xl border p-3.5 active:opacity-80 ${
                mapBadge
                    ? 'border-green-increase/40 bg-bg-secondary-lighter/40'
                    : 'border-border-input bg-bg-primary'
            }`}
        >
            <View className="flex-row items-center justify-between">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent-sky-bg">
                    {renderIcon(colors.accent.sky)}
                </View>
                <Iconify
                    icon="heroicons:chevron-right"
                    size={16}
                    color={colors.icon.lighter}
                />
            </View>
            <View className="mt-2.5 flex-row items-center gap-1.5">
                <AppText className="font-bold text-text-primary">{label}</AppText>
                {mapBadge ? (
                    <View className="rounded px-1.5 py-0.5 bg-bg-secondary-lighter">
                        <AppText
                            variant="caption-xs"
                            className="font-bold text-green-increase"
                        >
                            Map
                        </AppText>
                    </View>
                ) : null}
            </View>
            <AppText
                variant="caption-xs"
                className={`mt-0.5 ${
                    hasSelection ? 'font-semibold text-accent-sky' : 'text-text-primary-lighter'
                }`}
            >
                {hasSelection ? `${count} selected` : emptyLabel}
            </AppText>
        </Pressable>
    );
}

export function BudgetScopeSection({
    categories,
    places,
    merchants,
    memories,
    mapPrefilled,
    onOpenCategories,
    onOpenPlaces,
    onOpenMerchants,
    onOpenMemories,
    onRemoveCategory,
    onRemovePlace,
    onRemoveMerchant,
    onRemoveMemory,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const scopeTotal =
        categories.length + places.length + merchants.length + memories.length;

    return (
        <View>
            <BudgetSectionHeader
                title="What counts"
                hint="Empty = everything"
                renderIcon={(c) => (
                    <Iconify icon="heroicons:adjustments-horizontal" size={18} color={c} />
                )}
            />
            <View className="rounded-3xl border p-4" style={getElevatedCardStyle(isDark)}>
            <View className="flex-row flex-wrap gap-3">
                <ScopeTile
                    label="Categories"
                    count={categories.length}
                    emptyLabel="All categories"
                    onPress={onOpenCategories}
                    renderIcon={(c) => (
                        <Iconify icon="heroicons:tag" size={16} color={c} />
                    )}
                />
                <ScopeTile
                    label="Places"
                    count={places.length}
                    emptyLabel="All places"
                    mapBadge={mapPrefilled}
                    onPress={onOpenPlaces}
                    renderIcon={(c) => (
                        <Iconify icon="heroicons:map-pin" size={16} color={c} />
                    )}
                />
                <ScopeTile
                    label="Merchants"
                    count={merchants.length}
                    emptyLabel="All merchants"
                    onPress={onOpenMerchants}
                    renderIcon={(c) => (
                        <Iconify icon="heroicons:building-storefront" size={16} color={c} />
                    )}
                />
                <ScopeTile
                    label="Memories"
                    count={memories.length}
                    emptyLabel="All memories"
                    onPress={onOpenMemories}
                    renderIcon={(c) => (
                        <Iconify icon="heroicons:photo" size={16} color={c} />
                    )}
                />
            </View>

            {scopeTotal > 0 ? (
                <View className="mt-4 border-t border-border-input pt-3">
                    <AppText
                        variant="caption-xs"
                        className="mb-1 font-bold uppercase tracking-wider text-text-primary-lighter"
                    >
                        Active filters
                    </AppText>
                    <ScopeEntityChips
                        items={categories}
                        kind="expenseCategory"
                        onRemove={onRemoveCategory}
                    />
                    <ScopeEntityChips
                        items={places}
                        kind="place"
                        onRemove={onRemovePlace}
                    />
                    <ScopeEntityChips
                        items={merchants}
                        kind="merchant"
                        onRemove={onRemoveMerchant}
                    />
                    <ScopeEntityChips
                        items={memories}
                        kind="memory"
                        onRemove={onRemoveMemory}
                    />
                </View>
            ) : (
                <View className="mt-4 flex-row items-start gap-2 rounded-2xl border border-border-input bg-bg-primary px-3 py-3">
                    <Iconify
                        icon="heroicons:check-circle"
                        size={16}
                        color={colors.accent.sky}
                    />
                    <AppText
                        variant="caption-xs"
                        className="flex-1 text-text-primary-lighter"
                    >
                        No filters. This budget applies to all matching transactions.
                    </AppText>
                </View>
            )}
            </View>
        </View>
    );
}
