import React, { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { GroupMemberDetails } from "@/src/api/dto/user/group";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency } from '@/src/constants/expense/currency';

// Component Imports
import { SettleUpModal } from './SettleUpModal';
import { RemindModal } from './RemindModal';

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

    // Modal Active Pipeline States
    // const [settleTarget, setSettleTarget] = useState<{ name: string; amount: number } | null>(null);
    const [settleTarget, setSettleTarget] = useState<{ member: GroupMemberDetails; amount: number } | null>(null);
    const [remindTarget, setRemindTarget] = useState<{ name: string } | null>(null);

    const activeBalancesList = members.filter(
        member => !(member.id === currentUserId && member.user_type === currentUserType)
    );

    const targetCurrencySymbol = Currency['INR']?.symbol || '₹';

    return (
        <View className="mb-8">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                {activeBalancesList.map((member) => {
                    const syntheticBalanceEvaluator = member.contribution_inr - 1200;
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
                                    onPress={() => setRemindTarget({ name: member.name })}
                                    className="w-full bg-gray-200 dark:bg-zinc-800 py-2 rounded-xl active:opacity-70"
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-gray-700 dark:text-zinc-300">
                                        REMIND
                                    </AppText>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={() => setSettleTarget({ member: member, amount: syntheticBalanceEvaluator })}
                                    className="w-full bg-gray-200 py-2 rounded-xl active:opacity-70"
                                    style={{ backgroundColor: '#2D6A4F' }}
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-white">SETTLE</AppText>
                                </Pressable>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {/* Settle Up Gateway Overlay */}
            <SettleUpModal
                visible={settleTarget !== null}
                onClose={() => setSettleTarget(null)}
                member={settleTarget?.member || null}
                amount={settleTarget?.amount || 0}
                currencySymbol={targetCurrencySymbol}
            />

            {/* Notification Communication Overlay */}
            <RemindModal
                visible={remindTarget !== null}
                onClose={() => setRemindTarget(null)}
                userName={remindTarget?.name || ''}
            />
        </View>
    );
};