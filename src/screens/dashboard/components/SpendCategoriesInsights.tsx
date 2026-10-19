import React, {useEffect, useState} from 'react';
import {View, Pressable, TextInput, ScrollView} from 'react-native';
import Svg, {G, Circle} from 'react-native-svg';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {Merchant, SpendCategory} from '../types/dashboard';

interface SpendCategoriesInsightsProps {
    categories: SpendCategory[];
    merchants?: Merchant[];
    showMerchants?: boolean;
    totalSpendAmount?: number;
    onViewAllPress?: () => void;
}

const DONUT_SIZE = 128;
const LIST_MAX_HEIGHT = 148;

export const SpendCategoriesInsights: React.FC<SpendCategoriesInsightsProps> = ({
    categories,
    merchants = [],
    showMerchants = false,
    totalSpendAmount = 0,
    onViewAllPress,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const [selectedCategory, setSelectedCategory] = useState<SpendCategory | null>(
        categories[0] || null
    );
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setSelectedCategory(categories[0] || null);
    }, [categories]);

    const filteredMerchants = merchants.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const strokeWidth = 14;
    const center = DONUT_SIZE / 2;
    const radius = (DONUT_SIZE - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let strokeDashoffsetAccumulator = 0;

    const displayCategoryName = selectedCategory ? selectedCategory.name : 'Total Spend';
    const displayAmount = selectedCategory
        ? Math.round((totalSpendAmount * selectedCategory.percentage) / 100)
        : totalSpendAmount;

    return (
        <View className="mb-6 px-5">
            <View className="mb-3 flex-row items-center justify-between">
                <AppText variant="h4" className="font-bold" style={{color: colors.text.primary}}>
                    Spend Analysis
                </AppText>
                <Pressable onPress={onViewAllPress} className="active:opacity-70">
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{color: colors.text.link}}
                    >
                        View All
                    </AppText>
                </Pressable>
            </View>

            <View
                className="rounded-3xl border p-4"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                    shadowColor: COLORS.light.brand.primary,
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 12,
                    shadowOffset: {width: 0, height: 4},
                    elevation: 3,
                }}
            >
                {categories.length === 0 ? (
                    <View className="items-center justify-center py-8">
                        <AppText
                            variant="body-small"
                            className="text-center font-semibold"
                            style={{color: colors.text.primary}}
                        >
                            No category spend in this range
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-1 text-center"
                            style={{color: colors.text.lighter}}
                        >
                            Expenses in the selected duration will show here
                        </AppText>
                    </View>
                ) : (
                    <>
                        <View className="flex-row items-center gap-3">
                            {/* Donut — left */}
                            <View className="items-center justify-center">
                                <View
                                    className="relative items-center justify-center"
                                    style={{width: DONUT_SIZE, height: DONUT_SIZE}}
                                >
                                    <Svg
                                        height={DONUT_SIZE}
                                        width={DONUT_SIZE}
                                        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                                    >
                                        <G rotation="-90" origin={`${center}, ${center}`}>
                                            {categories.map((cat) => {
                                                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                                                const offset = strokeDashoffsetAccumulator;
                                                strokeDashoffsetAccumulator +=
                                                    (cat.percentage / 100) * circumference;
                                                const isSelected =
                                                    selectedCategory?.id === cat.id;

                                                return (
                                                    <Circle
                                                        key={cat.id}
                                                        cx={center}
                                                        cy={center}
                                                        r={radius}
                                                        stroke={cat.color}
                                                        strokeWidth={
                                                            isSelected
                                                                ? strokeWidth + 3
                                                                : strokeWidth
                                                        }
                                                        strokeDasharray={strokeDasharray}
                                                        strokeDashoffset={-offset}
                                                        fill="transparent"
                                                        opacity={
                                                            selectedCategory && !isSelected
                                                                ? 0.3
                                                                : 1
                                                        }
                                                    />
                                                );
                                            })}
                                        </G>
                                    </Svg>

                                    <Pressable
                                        onPress={() => setSelectedCategory(null)}
                                        className="absolute items-center justify-center px-2 active:opacity-80"
                                        accessibilityRole="button"
                                        accessibilityLabel="Show total spend"
                                    >
                                        <AppText
                                            variant="caption-xs"
                                            className="text-center text-[10px] font-medium text-text-primary-lighter"
                                            numberOfLines={1}
                                        >
                                            {displayCategoryName}
                                        </AppText>
                                        <AppText
                                            variant="body-base"
                                            className="mt-0.5 text-center text-xs font-extrabold text-text-primary"
                                        >
                                            ₹{displayAmount.toLocaleString('en-IN')}
                                        </AppText>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Categories — right, vertical scroll */}
                            <ScrollView
                                style={{flex: 1, maxHeight: LIST_MAX_HEIGHT}}
                                showsVerticalScrollIndicator={categories.length > 4}
                                nestedScrollEnabled
                                contentContainerStyle={{gap: 6, paddingVertical: 2}}
                            >
                                {categories.map((cat) => {
                                    const isSelected = selectedCategory?.id === cat.id;
                                    const amount = Math.round(
                                        (totalSpendAmount * cat.percentage) / 100
                                    );

                                    return (
                                        <Pressable
                                            key={cat.id}
                                            onPress={() =>
                                                setSelectedCategory(isSelected ? null : cat)
                                            }
                                            accessibilityRole="button"
                                            accessibilityState={{selected: isSelected}}
                                            className="flex-row items-center gap-2.5 rounded-2xl border px-2.5 py-2 active:opacity-80"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? `${cat.color}22`
                                                    : colors.bg.primary,
                                                borderColor: isSelected
                                                    ? cat.color
                                                    : colors.status.border,
                                            }}
                                        >
                                            <View
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{backgroundColor: cat.color}}
                                            />
                                            <View className="min-w-0 flex-1">
                                                <AppText
                                                    variant="caption-xs"
                                                    className="font-semibold text-text-primary"
                                                    numberOfLines={1}
                                                >
                                                    {cat.name}
                                                </AppText>
                                                <AppText
                                                    variant="caption-xs"
                                                    className="mt-0.5 text-[10px] text-text-primary-lighter"
                                                    numberOfLines={1}
                                                >
                                                    {cat.percentage}% · ₹
                                                    {amount.toLocaleString('en-IN')}
                                                </AppText>
                                            </View>
                                            {isSelected && (
                                                <Iconify
                                                    icon="heroicons:check-circle-20-solid"
                                                    size={16}
                                                    color={cat.color}
                                                />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {showMerchants && (
                            <View className="mt-4 gap-2.5 border-t border-border-input pt-3.5">
                                <View className="flex-row items-center rounded-xl border border-border-input bg-bg-primary px-2.5 py-1.5">
                                    <Iconify
                                        icon="heroicons:magnifying-glass"
                                        size={13}
                                        color={colors.icon.lighter}
                                    />
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Search merchants..."
                                        placeholderTextColor={colors.text.placeholder}
                                        className="ml-2 h-6 flex-1 p-0 text-xs font-medium text-text-primary"
                                    />
                                    {searchQuery.trim().length > 0 ? (
                                        <Pressable
                                            onPress={() => setSearchQuery('')}
                                            hitSlop={8}
                                            accessibilityRole="button"
                                            accessibilityLabel="Clear search"
                                            className="ml-1 active:opacity-70"
                                        >
                                            <Iconify
                                                icon="heroicons:x-mark"
                                                size={14}
                                                color={colors.icon.lighter}
                                            />
                                        </Pressable>
                                    ) : null}
                                </View>

                                <View className="gap-2">
                                    {filteredMerchants.length > 0 ? (
                                        filteredMerchants.map((merchant) => (
                                            <View
                                                key={merchant.id}
                                                className="flex-row items-center justify-between py-0.5"
                                            >
                                                <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-2">
                                                    <View className="h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-border-input bg-bg-primary">
                                                        <AppImageV2
                                                            id={merchant.icon.id}
                                                            url={merchant.icon.url}
                                                            contentFit="cover"
                                                            fallbackComponent={
                                                                <EntityFallbackIcon
                                                                    kind="merchant"
                                                                    size={14}
                                                                    color={colors.icon.lighter}
                                                                />
                                                            }
                                                        />
                                                    </View>
                                                    <AppText
                                                        variant="body-small"
                                                        className="text-xs font-semibold text-text-primary"
                                                        numberOfLines={1}
                                                    >
                                                        {merchant.name}
                                                    </AppText>
                                                </View>
                                                <AppText
                                                    variant="body-small"
                                                    className="shrink-0 text-xs font-bold text-text-primary"
                                                >
                                                    ₹
                                                    {merchant.amountSpent.toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </AppText>
                                            </View>
                                        ))
                                    ) : (
                                        <AppText
                                            variant="caption-xs"
                                            className="py-2 text-center italic text-text-primary-lighter"
                                        >
                                            No merchants found
                                        </AppText>
                                    )}
                                </View>
                            </View>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};
