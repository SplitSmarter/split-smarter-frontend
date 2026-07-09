import React from 'react';
import { ScrollView, View, Pressable, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { GroupMemberDetails } from "@/src/api/dto/user/group";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency } from '@/src/constants/expense/currency';

interface SettlementActionGridProps {
    members: GroupMemberDetails[];
    currentUserId: number | undefined;
    currentUserType: RelationWithUserType;
}

export const SettlementActionGrid = ({
                                         members,
                                         currentUserId,
                                         currentUserType
                                     }: SettlementActionGridProps) => {

    const handleSettleUpPaymentGatewayRouter = (userName: string, amount: number) => {
        const absoluteTargetValue = Math.abs(amount).toFixed(2);
        Alert.alert(
            "Instant Settlement Initiation",
            `Redirecting to your native payment interface to dispatch ${absoluteTargetValue} to ${userName}.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Launch Gateway",
                    onPress: () => {
                        const targetUpiUriPattern = `upi://pay?pn=${encodeURIComponent(userName)}&am=${absoluteTargetValue}`;
                        Linking.canOpenURL(targetUpiUriPattern).then((supported) => {
                            if (supported) {
                                Linking.openURL(targetUpiUriPattern);
                            } else {
                                Alert.alert("Routing Exception", "No integrated local payment ecosystem interfaces detected.");
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleRemindCommunicationOverlay = (userName: string) => {
        Alert.alert(
            "Anti-Awkward Notification Ping",
            `Select your preferred transmission topology to request processing from ${userName}.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Send Anonymously", onPress: () => Alert.alert("Dispatched", "Anonymous system push notification context fired successfully.") },
                {
                    text: "Custom Message (WhatsApp)",
                    onPress: () => {
                        const prebuiltString = `Hey ${userName}! Just a friendly reminder to settle up on Split Smarter whenever you get a second. thanks!`;
                        Linking.openURL(`whatsapp://send?text=${encodeURIComponent(prebuiltString)}`);
                    }
                }
            ]
        );
    };

    const activeBalancesList = members.filter(
        member => !(member.id === currentUserId && member.user_type === currentUserType)
    );

    return (
        <View className="mb-8">
            <AppText variant="body-small" className="font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-1">
                Active Pending Balances
            </AppText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                {activeBalancesList.map((member) => {
                    const syntheticBalanceEvaluator = member.contribution_inr - 1200;
                    const targetCurrencySymbol = Currency['INR']?.symbol || '₹';
                    const isOwedToCurrentUser = syntheticBalanceEvaluator > 0;

                    if (syntheticBalanceEvaluator === 0) return null;

                    return (
                        <View
                            key={`${member.id}-${member.user_type}`}
                            className="w-[140px] p-4 mr-3 rounded-2xl items-center border border-gray-100 dark:border-zinc-900 bg-gray-50/50 dark:bg-zinc-900/30"
                        >
                            <View className="w-14 h-14 rounded-full bg-gray-200 dark:bg-zinc-800 items-center justify-center overflow-hidden mb-2 border-2 border-white dark:border-zinc-950">
                                {member.avatar?.url ? (
                                    <Image source={{ uri: member.avatar.url }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Iconify icon="heroicons:user" size={24} color="#A1A1AA" />
                                )}
                            </View>

                            <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 mb-1" numberOfLines={1}>
                                {member.name}
                            </AppText>

                            <AppText
                                variant="body-small"
                                className={`font-bold mb-3 ${isOwedToCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                            >
                                {isOwedToCurrentUser ? '+' : '-'}{targetCurrencySymbol}{Math.abs(syntheticBalanceEvaluator).toFixed(2)}
                            </AppText>

                            {isOwedToCurrentUser ? (
                                <Pressable
                                    onPress={() => handleRemindCommunicationOverlay(member.name)}
                                    className="w-full bg-gray-200 dark:bg-zinc-800 py-2 rounded-xl active:opacity-70"
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-gray-700 dark:text-zinc-300">
                                        REMIND
                                    </AppText>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={() => handleSettleUpPaymentGatewayRouter(member.name, syntheticBalanceEvaluator)}
                                    className="w-full bg-[#2D6A4F] py-2 rounded-xl active:opacity-70"
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-white">
                                        SETTLE
                                    </AppText>
                                </Pressable>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};