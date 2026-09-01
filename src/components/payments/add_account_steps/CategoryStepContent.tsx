import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { ConsumerPaymentCategorySummaryResponse } from "@/src/api/dto/user_payments/categories";

interface CategoryStepContentProps {
    categories: ConsumerPaymentCategorySummaryResponse[];
    isLoading: boolean;
    error: string | null;
    onSelectCategory: (category: ConsumerPaymentCategorySummaryResponse) => void;
}

export const CategoryStepContent: React.FC<CategoryStepContentProps> = ({
                                                                            categories,
                                                                            isLoading,
                                                                            error,
                                                                            onSelectCategory,
                                                                        }) => {
    if (isLoading) {
        return (
            <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" className="text-icon-secondary" />
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading categories...
                </AppText>
            </View>
        );
    }

    if (error) {
        return (
            <View className="py-4 items-center justify-center">
                <AppText variant="body-small" className="text-text-error text-center mb-1">
                    {error}
                </AppText>
            </View>
        );
    }

    const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

    return (
        <View className="flex-row flex-wrap gap-3 mt-1">
            {sortedCategories.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    onPress={() => onSelectCategory(cat)}
                    activeOpacity={0.8}
                    className="w-[47%] bg-bg-canvas rounded-2xl p-3.5 items-center justify-center border border-bg-primary-darker shadow-sm"
                >
                    {/* Fixed explicit size container for the icon wrapper */}
                    <View
                        style={{ width: 48, height: 48 }}
                        className="rounded-full justify-center items-center mb-2 bg-bg-secondary-lighter p-2.5"
                    >
                        {cat.icon?.url ? (
                            /* Fixed dimensions and contentFit for AppImageV2 */
                            <AppImageV2
                                id={`cat-${cat.id}`}
                                url={cat.icon.url}
                                contentFit="contain"
                                style={{ width: 26, height: 26 }}
                                fallbackComponent={
                                    <Ionicons name="wallet-outline" size={24} className="text-icon-secondary" />
                                }
                            />
                        ) : (
                            <Ionicons name="wallet-outline" size={24} className="text-icon-secondary" />
                        )}
                    </View>
                    <AppText variant="body-small" className="font-semibold text-text-primary text-center" numberOfLines={2}>
                        {cat.name}
                    </AppText>
                </TouchableOpacity>
            ))}
        </View>
    );
};