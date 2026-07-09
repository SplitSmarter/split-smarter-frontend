import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { userStore } from "@/src/store/userStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { BaseSettlementDetails } from "@/src/api/dto/expense/settlement";
import { GroupMemberDetails } from "@/src/api/dto/user/group";
import {SettlementActionGrid} from "@/src/components/expense/settlement/SettlementActionGrid";
import {SettlementHistoryLedger} from "@/src/components/expense/settlement/SettlementHistoryLedger";


interface GroupSettlementsTabProps {
    groupId: number;
    isDark: boolean;
    members: GroupMemberDetails[];
    history: BaseSettlementDetails[];
}

export const GroupSettlementsTab = ({
                                        isDark,
                                        members,
                                        history
                                    }: GroupSettlementsTabProps) => {
    const { user } = userStore();
    const [simplifyDebts, setSimplifyDebts] = useState<boolean>(true);

    const currentUserId = user?.id;
    const currentUserType = RelationWithUserType.USER;

    return (
        <View className="flex-1 pb-10">
            {/* 1. GLOBAL DEBT SIMPLIFICATION MODE CONTROL CHIP */}
            <View className="flex-row justify-between items-center mb-6 px-1">
                <View className="flex-row items-center">
                    <Iconify icon="heroicons:arrows-right-left" size={18} color={isDark ? "#A1A1AA" : "#4B5563"} />
                    <AppText variant="body-base" className="font-semibold text-gray-700 dark:text-zinc-300 ml-2">
                        Simplify Debts (Smart Route)
                    </AppText>
                </View>
                <Pressable
                    onPress={() => setSimplifyDebts(!simplifyDebts)}
                    className={`px-4 py-2 rounded-full border ${simplifyDebts ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20' : 'bg-gray-100 border-gray-300 dark:bg-zinc-800 dark:border-zinc-700'}`}
                >
                    <AppText variant="body-small" className={`font-bold ${simplifyDebts ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                        {simplifyDebts ? 'ACTIVE' : 'OFF'}
                    </AppText>
                </Pressable>
            </View>

            {/* 2. PERSONALIZED HORIZONTAL ACTION SCROLL MATRIX */}
            <SettlementActionGrid
                members={members}
                currentUserId={currentUserId}
                currentUserType={currentUserType}
            />

            {/* 3. STREAMLINED HISTORICAL SETTLEMENTS LEDGER MAP */}
            <SettlementHistoryLedger
                history={history}
                currentUserId={currentUserId}
                currentUserType={currentUserType}
                isDark={isDark}
            />
        </View>
    );
};