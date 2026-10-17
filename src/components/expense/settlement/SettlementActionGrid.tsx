import React, { useState } from 'react';
import { COLORS } from '@/src/constants/colors';
import { ScrollView, View, Pressable } from 'react-native';
import { themeStore } from '@/src/store/themeStore';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
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
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

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
                            className="w-[140px] p-4 mr-3 rounded-2xl items-center border border-border-input bg-bg-primary-lighter"
                        >
                            <View className="w-14 h-14 rounded-full bg-bg-primary-darker items-center justify-center overflow-hidden mb-2 border-2 border-bg-primary">
                                <AppImageV2
                                    id={`settle-grid-${member.id}`}
                                    url={member.avatar?.url}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                    fallbackComponent={
                                        <EntityFallbackIcon kind="user" size={24} color={colors.icon.lighter} />
                                    }
                                />
                            </View>

                            <AppText variant="body-base" className="font-semibold text-text-primary mb-1" numberOfLines={1}>
                                {member.name}
                            </AppText>

                            <AppText
                                variant="body-small"
                                className={`font-bold mb-3 ${isOwedToCurrentUser ? 'text-green-increase' : 'text-red-decrease'}`}
                            >
                                {isOwedToCurrentUser ? '+' : '-'}{targetCurrencySymbol}{Math.abs(syntheticBalanceEvaluator).toFixed(2)}
                            </AppText>

                            {isOwedToCurrentUser ? (
                                <Pressable
                                    onPress={() => setRemindTarget({ name: member.name })}
                                    className="w-full bg-bg-primary-darker py-2 rounded-xl active:opacity-70"
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-text-primary-lighter">
                                        REMIND
                                    </AppText>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={() => setSettleTarget({ member: member, amount: syntheticBalanceEvaluator })}
                                    className="w-full bg-bg-secondary py-2 rounded-xl active:opacity-70"
                                >
                                    <AppText variant="body-small" className="text-center font-bold text-text-secondary">SETTLE</AppText>
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