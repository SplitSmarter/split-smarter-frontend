import MultiUserSplitSelect, {UserItem} from '@/src/components/expense/MultiUserSelect';
import {router, useLocalSearchParams} from 'expo-router';
import React from 'react';

const UserSplitScreen = () => {
    const {type} = useLocalSearchParams<{
        type: 'paidBy' | 'split';
        totalExpense: string;
    }>();

    const handleSave = (_selectedUsers: UserItem[]) => {
        router.back();
    };

    return (
        <MultiUserSplitSelect
            type={type === 'paidBy' ? 'paidBy' : 'split'}
            onSave={handleSave}
        />
    );
};

export default UserSplitScreen;
