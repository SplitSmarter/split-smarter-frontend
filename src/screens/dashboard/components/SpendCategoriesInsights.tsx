import React, {useState} from 'react';
import {View, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import Svg, {G, Circle} from 'react-native-svg';
import {Feather} from '@expo/vector-icons';
import {AppText} from "@/src/components/common/AppText";
import {Merchant, SpendCategory} from '../types/dashboard';
import {AppImageV2} from "@/src/components/common/AppImageV2";

interface SpendCategoriesInsightsProps {
    categories: SpendCategory[];
    merchants: Merchant[];
    totalSpendAmount?: number;
    onViewAllPress?: () => void;
}

export const SpendCategoriesInsights: React.FC<SpendCategoriesInsightsProps> = ({
                                                                                    categories,
                                                                                    merchants,
                                                                                    totalSpendAmount = 8900,
                                                                                    onViewAllPress,
                                                                                }) => {
    const [selectedCategory, setSelectedCategory] = useState<SpendCategory | null>(
        categories[0] || null
    );
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMerchants = merchants.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // SVG Donut Calculations
    const size = 110;
    const strokeWidth = 12;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let strokeDashoffsetAccumulator = 0;

    // Calculate active center display details
    const displayCategoryName = selectedCategory ? selectedCategory.name : 'Total Spend';
    const displayAmount = selectedCategory
        ? Math.round((totalSpendAmount * selectedCategory.percentage) / 100)
        : totalSpendAmount;

    return (
        <View className="px-5 mb-6">
            {/* Title Bar */}
            <View className="flex-row justify-between items-center mb-4">
                <AppText variant="h4" className="text-white font-bold">
                    Spend Analysis
                </AppText>
                <TouchableOpacity onPress={onViewAllPress}>
                    <AppText variant="body-small" className="text-white/50 font-semibold">
                        View All
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* Main Card Container */}
            <View className="bg-zinc-900/80 p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4">
                {/* Horizontal Category Chips Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row space-x-2 pb-1"
                >
                    {categories.map((cat) => {
                        const isSelected = selectedCategory?.id === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.7}
                                onPress={() => setSelectedCategory(isSelected ? null : cat)}
                                style={{
                                    backgroundColor: isSelected ? `${cat.color}25` : 'rgba(255, 255, 255, 0.05)',
                                    borderColor: isSelected ? cat.color : 'rgba(255, 255, 255, 0.1)',
                                }}
                                className="px-3 py-1.5 rounded-full border flex-row items-center space-x-1.5"
                            >
                                <View
                                    style={{backgroundColor: cat.color}}
                                    className="w-2 h-2 rounded-full"
                                />
                                <AppText
                                    variant="caption-xs"
                                    className={`font-semibold ${isSelected ? 'text-white' : 'text-white/60'}`}
                                >
                                    {cat.name} ({cat.percentage}%)
                                </AppText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Content Row: Donut Chart + Merchant List */}
                <View className="flex-row items-center pt-1">
                    {/* Left 45%: Donut Chart */}
                    <View className="w-[45%] items-center justify-center border-r border-white/10 pr-3">
                        <View className="w-[110px] h-[110px] items-center justify-center relative">
                            <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
                                <G rotation="-90" origin={`${center}, ${center}`}>
                                    {categories.map((cat) => {
                                        const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                                        const offset = strokeDashoffsetAccumulator;
                                        strokeDashoffsetAccumulator += (cat.percentage / 100) * circumference;
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

                            {/* Center Donut Label */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setSelectedCategory(null)}
                                className="absolute items-center justify-center px-1"
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="text-white/60 font-medium text-center text-[10px]"
                                    numberOfLines={1}
                                >
                                    {displayCategoryName}
                                </AppText>
                                <AppText
                                    variant="body-base"
                                    className="text-white font-extrabold text-xs mt-0.5"
                                >
                                    ₹{displayAmount.toLocaleString('en-IN')}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Right 55%: Merchant List */}
                    <View className="w-[55%] pl-3.5 space-y-2">
                        {/* Subtle Search Input Bar */}
                        <View
                            className="bg-white/5 rounded-xl flex-row items-center px-2.5 py-1 border border-white/10">
                            <Feather name="search" size={13} color="rgba(255,255,255,0.4)"/>
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search merchants..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                className="text-white text-xs ml-2 flex-1 p-0 h-6 font-medium"
                            />
                        </View>

                        {/* Merchants List */}
                        <View className="space-y-2 pt-1">
                            {filteredMerchants.length > 0 ? (
                                filteredMerchants.map((merchant) => (
                                    <View
                                        key={merchant.id}
                                        className="flex-row justify-between items-center py-0.5"
                                    >
                                        <View className="flex-row items-center space-x-2">
                                            <View
                                                className="w-6 h-6 bg-white/10 rounded-full items-center justify-center border border-white/10">
                                                <AppImageV2
                                                    id={merchant.icon.id}
                                                    url={merchant.icon.url}
                                                    contentFit="cover"
                                                />
                                            </View>
                                            <AppText
                                                variant="body-small"
                                                className="text-white font-semibold text-xs"
                                                numberOfLines={1}
                                            >
                                                {merchant.name}
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="body-small"
                                            className="text-white/90 font-bold text-xs"
                                        >
                                            ₹{merchant.amountSpent.toLocaleString('en-IN')}
                                        </AppText>
                                    </View>
                                ))
                            ) : (
                                <AppText
                                    variant="caption-xs"
                                    className="text-white/40 text-center py-2 italic"
                                >
                                    No merchants found
                                </AppText>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};