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