import { AppText } from '@/src/components/common/AppText';
import React from 'react';
import { View } from 'react-native';
import { Iconify } from "react-native-iconify";

// GroupExpensesTab.tsx
export const GroupExpensesTab = ({ isDark }: { isDark: boolean }) => (
    <View className="items-center pt-20 px-10">
        <Iconify icon="heroicons:banknotes" size={60} color={isDark ? "#333" : "#EEE"} />
        <AppText className="mt-4 opacity-40 text-center">No expenses recorded yet.</AppText>
    </View>
);
