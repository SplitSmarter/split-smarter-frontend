import React from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {AppText} from "@/src/components/common/AppText";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {ConsumerPaymentCategorySummaryResponse} from "@/src/api/dto/user_payments/categories";
import {PaymentAccountAddOptionsDTO} from "@/src/api/dto/user_payments/account";
import {PaymentRailProviderBasicDetails} from "@/src/api/dto/user_payments/base_dto";

interface ProviderStepContentProps {
    selectedCategory: ConsumerPaymentCategorySummaryResponse;
    addOptions: PaymentAccountAddOptionsDTO | null;
    isLoading: boolean;
    error: string | null;
    onSelectProvider: (provider: PaymentRailProviderBasicDetails) => void;
}

export const ProviderStepContent: React.FC<ProviderStepContentProps> = ({
                                                                            selectedCategory,
                                                                            addOptions,
                                                                            isLoading,
                                                                            error,
                                                                            onSelectProvider,
                                                                        }) => {
    if (isLoading) {
        return (
            <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" className="text-icon-secondary"/>
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading providers...
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

    // 1. Find the matching rail key (e.g. 'upi') in details where detail.id === selectedCategory.id ('instant_pay')
    const detailsMap = addOptions?.details || {};
    const matchingRailKey = Object.keys(detailsMap).find(
        (key) => detailsMap[key]?.id === selectedCategory.id
    );

    const categoryDetail = matchingRailKey ? detailsMap[matchingRailKey] : null;

    // 2. Fetch providers using the resolved rail key ('upi')
    let providers: PaymentRailProviderBasicDetails[] = [];
    if (matchingRailKey && addOptions?.providers) {
        const providersMap = addOptions.providers as Record<string, PaymentRailProviderBasicDetails[] | null | undefined>;
        providers = providersMap[matchingRailKey] || [];
    }

    if (!categoryDetail || providers.length === 0) {
        return (
            <View
                className="py-6 items-center justify-center bg-bg-canvas rounded-2xl border border-bg-primary-darker p-4 mt-1">
                <Ionicons name="alert-circle-outline" size={28} className="text-icon-secondary mb-2"/>
                <AppText variant="body-small" className="font-semibold text-text-primary text-center">
                    No Providers Available
                </AppText>
                <AppText variant="caption-xs" className="text-text-primary-lighter text-center mt-1">
                    There are currently no active providers listed under {selectedCategory.name}.
                </AppText>
            </View>
        );
    }

    return (
        <View className="mt-1">
            <AppText variant="caption-xs" className="font-semibold text-text-primary-lighter uppercase mb-2">
                {categoryDetail.display_name || "Available Providers"}
            </AppText>

            <View className="flex-row flex-wrap gap-2.5">
                {providers.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onSelectProvider(item)}
                        activeOpacity={0.7}
                        className="flex-row items-center bg-bg-canvas px-3.5 py-3 rounded-xl border border-bg-primary-darker gap-2.5"
                    >
                        <View style={{width: 24, height: 24}}
                              className="rounded-full overflow-hidden justify-center items-center bg-bg-secondary-lighter">
                            {item.icon?.url ? (
                                <AppImageV2
                                    id={`provider-${item.id}`}
                                    url={item.icon.url}
                                    contentFit="contain"
                                    style={{width: 20, height: 20}}
                                    fallbackComponent={
                                        <Ionicons name="wallet-outline" size={16} className="text-icon-secondary"/>
                                    }
                                />
                            ) : (
                                <Ionicons name="wallet-outline" size={16} className="text-icon-secondary"/>
                            )}
                        </View>

                        <AppText variant="body-small" className="font-semibold text-text-primary">
                            {item.display_name || item.name}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};