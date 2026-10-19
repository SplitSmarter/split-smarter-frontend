import React from 'react';
import {View} from 'react-native';
import {userStore} from '@/src/store/userStore';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import {GroupMemberDetails} from '@/src/api/dto/user/group';
import {SettlementActionGrid} from '@/src/components/expense/settlement/SettlementActionGrid';
import {SettlementHistoryLedger} from '@/src/components/expense/settlement/SettlementHistoryLedger';

interface GroupSettlementsTabProps {
    groupId: number;
    isDark: boolean;
    members: GroupMemberDetails[];
    history: BaseSettlementDetails[];
}

export const GroupSettlementsTab = ({
    isDark,
    members,
    history,
}: GroupSettlementsTabProps) => {
    const {user} = userStore();
    const currentUserId = user?.id;
    const currentUserType = RelationWithUserType.USER;

    return (
        <View className="flex-1 pb-10">
            <SettlementActionGrid
                members={members}
                currentUserId={currentUserId}
                currentUserType={currentUserType}
            />

            <SettlementHistoryLedger
                history={history}
                currentUserId={currentUserId}
                currentUserType={currentUserType}
                isDark={isDark}
            />
        </View>
    );
};
