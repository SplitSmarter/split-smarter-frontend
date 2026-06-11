import React from 'react';
import { View } from 'react-native';
import MultiUserSplitSelect, { UserItem } from "@/src/components/expense/MultiUserSelect";
import { router, useLocalSearchParams } from 'expo-router';

const UserSplitScreen = () => {
    const { type, totalExpense } = useLocalSearchParams<{
        type: 'paidBy' | 'split';
        totalExpense: string;
    }>();
    console.log(type, totalExpense);
    const parsedTotalExpense = parseFloat(totalExpense) || 0;

    const handleSave = (selectedUsers: UserItem[]) => {
        // TODO: Handle saving the selected users
        // For now, just go back
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
