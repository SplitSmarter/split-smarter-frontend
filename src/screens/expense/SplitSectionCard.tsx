// --- Split Between Component ---
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


export const SplitSectionCard = React.memo(({participants, currencySymbol = '₹', isDark, onPress}: SectionCardProps & {
    participants: any[]
}) => {
    const activeColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    return (
        <Pressable className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                   onPress={onPress}>
            <View className="flex-row justify-between items-center mb-4">
                <AppText variant="h4" className="font-bold text-text-primary">Split Between</AppText>
                <Iconify icon="heroicons:pencil-square" size={20} color={activeColor}/>
            </View>

            {participants.length > 0 ? (
                participants.map((participant, index) => (
                    <View
                        key={`split-${participant.id}-${participant.user_type}`}
                        className={`flex-row items-center justify-between py-3 ${index !== participants.length - 1 ? 'border-b border-border-input' : ''}`}
                    >
                        <View className="flex-row items-center flex-1">
                            {participant.avatar?.url ? (
                                <AppImageV2 id={`avatar-${participant.name}`} url={participant.avatar.url}
                                            style={{width: 24, height: 24}} className="rounded-full"/>
                            ) : (
                                <View style={{width: 24, height: 24}}
                                      className="bg-gray-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                    <Iconify icon="heroicons:user-solid" size={12} color="#999"/>
                                </View>
                            )}
                            <AppText className="ml-3 flex-1 text-text-primary font-medium">{participant.name}</AppText>
                        </View>
                        <AppText className="font-bold text-text-primary">
                            {currencySymbol}{(participant.amount || 0).toFixed(2)}
                        </AppText>
                    </View>
                ))
            ) : (
                <AppText variant="caption-xs" className="text-text-primary opacity-60 font-medium">Nobody
                    selected</AppText>
            )}
        </Pressable>
    );
});


SplitSectionCard.displayName = 'SplitSectionCard';
