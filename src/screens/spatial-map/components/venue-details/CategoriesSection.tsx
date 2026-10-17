import React, {useEffect, useMemo, useState} from 'react';
import {View, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Svg, {G, Circle} from 'react-native-svg';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {PlaceCategoryItem} from '@/src/api/dto/expense/place_analytics';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatINR} from '../../utils/spatialMap.utils';
import {CATEGORY_BAR_COLORS} from './constants';
import {SectionLabel} from './SectionLabel';
import {SurfaceCard} from './SurfaceCard';

const DONUT_SIZE = 128;
/** Fixed list height so nested scroll works inside BottomSheetScrollView. */
const LIST_HEIGHT = 152;

type DonutCategory = {
    id: string;
    name: string;
    percentage: number;
    color: string;
    amount: number;
};

interface CategoriesSectionProps {
    items: PlaceCategoryItem[];
}

function mapToDonutCategories(items: PlaceCategoryItem[]): DonutCategory[] {
    const mapped = items.slice(0, 8).map((item, index) => ({
        id: String(item.category_id),
        name: item.category_name ?? 'Other',
        percentage: Math.round(item.share_of_place * 100),
        color: CATEGORY_BAR_COLORS[index % CATEGORY_BAR_COLORS.length],
        amount: item.shared_inr,
    }));

    // Keep donut segments summing to 100 after rounding
    const sum = mapped.reduce((s, c) => s + c.percentage, 0);
    if (mapped.length > 0 && sum !== 100) {
        mapped[0] = {
            ...mapped[0],
            percentage: Math.max(0, mapped[0].percentage + (100 - sum)),
        };
    }

    return mapped.filter((c) => c.percentage > 0 || c.amount > 0);
}

export function CategoriesSection({items}: CategoriesSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const categories = useMemo(() => mapToDonutCategories(items), [items]);

    const [selectedCategory, setSelectedCategory] = useState<DonutCategory | null>(
        categories[0] ?? null
    );

    useEffect(() => {
        setSelectedCategory(categories[0] ?? null);
    }, [categories]);

    const totalSpend = useMemo(
        () => categories.reduce((sum, c) => sum + c.amount, 0),
        [categories]
    );

    const strokeWidth = 14;
    const center = DONUT_SIZE / 2;
    const radius = (DONUT_SIZE - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let strokeDashoffsetAccumulator = 0;

    const displayCategoryName = selectedCategory ? selectedCategory.name : 'Total';
    const displayAmount = selectedCategory ? selectedCategory.amount : totalSpend;

    return (
        <View>
            <SectionLabel
                icon={
                    <Iconify
                        icon="heroicons:chart-pie"
                        size={13}
                        color={colors.icon.lighter}
                    />
                }
            >
                Top categories
            </SectionLabel>

            <SurfaceCard>
                {categories.length === 0 ? (
                    <View className="items-center justify-center px-4 py-8">
                        <AppText
                            variant="body-small"
                            className="text-center font-semibold text-text-primary"
                        >
                            No category spend in this range
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-1 text-center text-text-primary-lighter"
                        >
                            Expenses here will show by category
                        </AppText>
                    </View>
                ) : (
                    <View className="flex-row items-stretch gap-3 px-3 py-3">
                        {/* Donut — left */}
                        <View className="items-center justify-center self-center">
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
                                            const isSelected = selectedCategory?.id === cat.id;

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
                                                        selectedCategory && !isSelected ? 0.3 : 1
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
                                    accessibilityLabel="Show total place spend"
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
                                        {formatINR(displayAmount)}
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>

                        {/* Categories — right; fixed height + GH ScrollView for sheet nesting */}
                        <ScrollView
                            style={{flex: 1, height: LIST_HEIGHT}}
                            showsVerticalScrollIndicator={categories.length > 3}
                            nestedScrollEnabled
                            bounces={categories.length > 3}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{gap: 6, paddingVertical: 2, paddingRight: 2}}
                        >
                            {categories.map((cat) => {
                                const isSelected = selectedCategory?.id === cat.id;

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
                                                {cat.percentage}% · {formatINR(cat.amount)}
                                            </AppText>
                                        </View>
                                        {isSelected ? (
                                            <Iconify
                                                icon="heroicons:check-circle-20-solid"
                                                size={16}
                                                color={cat.color}
                                            />
                                        ) : null}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
            </SurfaceCard>
        </View>
    );
}
