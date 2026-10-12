import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Svg, {G, Circle} from 'react-native-svg';
import {Feather} from '@expo/vector-icons';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {Merchant, SpendCategory} from '../types/dashboard';
import {AppImageV2} from '@/src/components/common/AppImageV2';

interface SpendCategoriesInsightsProps {
    categories: SpendCategory[];
    merchants?: Merchant[];
    showMerchants?: boolean;
    totalSpendAmount?: number;
    onViewAllPress?: () => void;
}

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

    const size = 110;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let strokeDashoffsetAccumulator = 0;

    const displayCategoryName = selectedCategory ? selectedCategory.name : 'Total Spend';
    const displayAmount = selectedCategory
        ? Math.round((totalSpendAmount * selectedCategory.percentage) / 100)
        : totalSpendAmount;

    return (
        <View className="mb-6 px-5">
            <View className="mb-3 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Spend Analysis
                </AppText>
                <TouchableOpacity onPress={onViewAllPress}>
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{color: colors.text.lighter}}
                    >
                        View All
                    </AppText>
                </TouchableOpacity>
            </View>

            <View
                className="gap-4 rounded-3xl border p-4 shadow-2xl"
                style={{
                    backgroundColor: colors.bg.overlay,
                    borderColor: colors.status.border,
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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{gap: 8, paddingRight: 4}}
                >
                    {categories.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.7}
                                onPress={() => setSelectedCategory(isSelected ? null : cat)}
                                style={{
                                    backgroundColor: isSelected ? `${cat.color}25` : colors.bg.primary,
                                    borderColor: isSelected ? cat.color : colors.status.border,
                                }}
                                className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
                            >
                                <View
                                    style={{backgroundColor: cat.color}}
                                    className="h-2 w-2 rounded-full"
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold"
                                    style={{
                                        color: isSelected ? colors.text.primary : colors.text.lighter,
                                    }}
                                >
                                    {cat.name} ({cat.percentage}%)
                                </AppText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View
                    className={`flex-row items-center ${showMerchants ? '' : 'justify-center'}`}
                >
                    <View
                        className={`items-center justify-center ${
                            showMerchants ? 'w-[45%] border-r pr-3' : 'w-full'
                        }`}
                        style={showMerchants ? {borderRightColor: colors.status.border} : undefined}
                    >
                        <View className="relative h-[110px] w-[110px] items-center justify-center">
                            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
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
                                                strokeWidth={isSelected ? strokeWidth + 3 : strokeWidth}
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={-offset}
                                                fill="transparent"
                                                opacity={selectedCategory && !isSelected ? 0.35 : 1}
                                            />
                                        );
                                    })}
                                </G>
                            </Svg>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setSelectedCategory(null)}
                                className="absolute items-center justify-center px-1"
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="text-center text-[10px] font-medium"
                                    numberOfLines={1}
                                    style={{color: colors.text.lighter}}
                                >
                                    {displayCategoryName}
                                </AppText>
                                <AppText
                                    variant="body-base"
                                    className="mt-0.5 text-xs font-extrabold"
                                    style={{color: colors.text.primary}}
                                >
                                    ₹{displayAmount.toLocaleString('en-IN')}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showMerchants && (
                        <View className="w-[55%] gap-2.5 pl-3.5">
                            <View
                                className="flex-row items-center rounded-xl border px-2.5 py-1.5"
                                style={{
                                    backgroundColor: colors.bg.primary,
                                    borderColor: colors.status.border,
                                }}
                            >
                                <Feather name="search" size={13} color={colors.icon.lighter} />
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search merchants..."
                                    placeholderTextColor={colors.text.placeholder}
                                    className="ml-2 h-6 flex-1 p-0 text-xs font-medium"
                                    style={{color: colors.text.primary}}
                                />
                            </View>

                            <View className="gap-2">
                                {filteredMerchants.length > 0 ? (
                                    filteredMerchants.map((merchant) => (
                                        <View
                                            key={merchant.id}
                                            className="flex-row items-center justify-between py-0.5"
                                        >
                                            <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-2">
                                                <View
                                                    className="h-6 w-6 items-center justify-center overflow-hidden rounded-full border"
                                                    style={{
                                                        backgroundColor: colors.bg.primary,
                                                        borderColor: colors.status.border,
                                                    }}
                                                >
                                                    <AppImageV2
                                                        id={merchant.icon.id}
                                                        url={merchant.icon.url}
                                                        contentFit="cover"
                                                    />
                                                </View>
                                                <AppText
                                                    variant="body-small"
                                                    className="text-xs font-semibold"
                                                    numberOfLines={1}
                                                    style={{color: colors.text.primary}}
                                                >
                                                    {merchant.name}
                                                </AppText>
                                            </View>
                                            <AppText
                                                variant="body-small"
                                                className="shrink-0 text-xs font-bold"
                                                style={{color: colors.text.primary}}
                                            >
                                                ₹{merchant.amountSpent.toLocaleString('en-IN')}
                                            </AppText>
                                        </View>
                                    ))
                                ) : (
                                    <AppText
                                        variant="caption-xs"
                                        className="py-2 text-center italic"
                                        style={{color: colors.text.lighter}}
                                    >
                                        No merchants found
                                    </AppText>
                                )}
                            </View>
                        </View>
                    )}
                </View>
                </>
                )}
            </View>
        </View>
    );
};
