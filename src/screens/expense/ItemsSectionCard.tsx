import React from "react";
import {COLORS} from "@/src/constants/colors";
import {Pressable, View} from "react-native";
import {AppText} from "@/src/components/common/AppText";
import {Iconify} from "react-native-iconify";
import {AppImageV2} from "@/src/components/common/AppImageV2";

interface SectionCardProps {
    currencySymbol?: string;
    isDark: boolean;
    onPress: () => void;
}

// --- Items Component ---
export const ItemsSectionCard = React.memo(({items, currencySymbol = '₹', isDark, onPress}: SectionCardProps & {
    items: any[]
}) => {
    const activeColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    return (
        <Pressable className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                   onPress={onPress}>
            <View className="flex-row justify-between items-center mb-4">
                <AppText variant="h4" className="font-bold text-text-primary">Items</AppText>
                <Iconify icon="heroicons:pencil-square" size={20} color={activeColor}/>
            </View>

            {items.length > 0 ? (
                items.map((item, index) => (
                    <View key={item.id}
                          className={`flex-row items-center justify-between py-3 ${index !== items.length - 1 ? 'border-b border-b-secondary-lighter' : ''}`}>
                        <View className="flex-row items-center flex-1">
                            {item.iconUrl ? (
                                <AppImageV2 id={`selected-item-${item.id}`} url={item.iconUrl}
                                            style={{width: 24, height: 24}} contentFit="contain"/>
                            ) : (
                                <View style={{width: 24, height: 24}}
                                      className="bg-gray-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                    <Iconify icon="heroicons:shopping-cart" size={12} color="#999"/>
                                </View>
                            )}
                            <View className="ml-3 flex-1">
                                <AppText className="text-text-primary font-medium">{item.title}</AppText>
                                <AppText variant="body-small"
                                         className="text-text-secondary">Qty: {item.quantity}</AppText>
                            </View>
                        </View>
                        <AppText className="font-bold text-text-primary">
                            {currencySymbol}{(item.cost * item.quantity).toFixed(2)}
                        </AppText>
                    </View>
                ))
            ) : (
                <AppText variant="caption-xs" className="text-text-primary opacity-60 font-medium">No items
                    selected</AppText>
            )}
        </Pressable>
    );
});
ItemsSectionCard.displayName = 'ItemsSectionCard';