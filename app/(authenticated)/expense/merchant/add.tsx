import MultiUserSplitSelect, { UserItem } from "@/src/components/expense/MultiUserSelect";
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const UserSplitScreen = () => {
    const { type, totalExpense } = useLocalSearchParams<{
        type: 'paidBy' | 'split';
        totalExpense: string;
    }>();

    const handleSave = (selectedUsers: UserItem[]) => {
        // TODO: Handle saving the selected users
        router.back();
    };

    return (
        <View className="flex-1 bg-bg-primary">
            <MultiUserSplitSelect
                type={type}
                onSave={handleSave}
            />
        </View>
    );
};

export default UserSplitScreen;
