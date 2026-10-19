import React from "react";
import {COLORS} from "@/src/constants/colors";
import {Pressable, View} from "react-native";
import {AppText} from "@/src/components/common/AppText";
import {Iconify} from "react-native-iconify";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {EntityFallbackIcon} from "@/src/components/common/EntityFallbackIcon";

interface SectionCardProps {
    currencySymbol?: string;
    isDark: boolean;
    onPress: () => void;
}

// --- Items Component ---
export const ItemsSectionCard = React.memo(({items, currencySymbol = '₹', isDark, onPress}: SectionCardProps & {
    items: any[]
}) => {
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <Pressable
            className="rounded-2xl border p-4 shadow-sm"
            style={{
                backgroundColor: colors.bg.lighter,
                borderColor: colors.status.border,
            }}
            onPress={onPress}
        >
            <View className="mb-4 flex-row items-center justify-between">
                <AppText variant="h4" className="font-bold" style={{color: colors.text.primary}}>
                    Items
                </AppText>
                <Iconify icon="heroicons:chevron-right" size={20} color={colors.icon.primary}/>
            </View>

            {items.length > 0 ? (
                items.map((item, index) => (
                    <View
                        key={item.id}
                        className="flex-row items-center justify-between py-3"
                        style={
                            index !== items.length - 1
                                ? {borderBottomWidth: 1, borderBottomColor: colors.status.border}
                                : undefined
                        }
                    >
                        <View className="flex-1 flex-row items-center">
                            <AppImageV2
                                id={`selected-item-${item.id}`}
                                url={item.iconUrl}
                                style={{width: 24, height: 24}}
                                contentFit="contain"
                                fallbackComponent={
                                    <EntityFallbackIcon
                                        kind="expenseItem"
                                        size={12}
                                        color={colors.icon.lighter}
                                    />
                                }
                            />
                            <View className="ml-3 flex-1">
                                <AppText className="font-medium" style={{color: colors.text.primary}}>
                                    {item.title}
                                </AppText>
                                <AppText
                                    variant="body-small"
                                    style={{color: colors.text.lighter}}
                                >
                                    Qty: {item.quantity}
                                </AppText>
                            </View>
                        </View>
                        <AppText className="font-bold" style={{color: colors.text.primary}}>
                            {currencySymbol}{(item.cost * item.quantity).toFixed(2)}
                        </AppText>
                    </View>
                ))
            ) : (
                <AppText
                    variant="caption-xs"
                    className="font-medium"
                    style={{color: colors.text.lighter}}
                >
                    No items selected — default item will be used
                </AppText>
            )}
        </Pressable>
    );
});
ItemsSectionCard.displayName = 'ItemsSectionCard';
