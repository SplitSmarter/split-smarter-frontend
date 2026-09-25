import React from 'react';
import { View } from 'react-native';
import { TabButton } from '@/src/screens/expense/AddTransactionHelper';
import { TRANSACTION_TABS, TransactionTabType } from '../constants/addTransaction.constants';

interface TransactionTabsProps {
    activeTab: TransactionTabType;
    onTabChange: (tab: TransactionTabType) => void;
}

export const TransactionTabs: React.FC<TransactionTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <View className="px-6 pt-2 pb-5">
            <View className="flex-row bg-bg-canvas p-1 rounded-full border border-bg-primary-darker shadow-sm w-full">
                {TRANSACTION_TABS.map((tab) => (
                    <TabButton
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onPress={() => onTabChange(tab.id)}
                    />
                ))}
            </View>
        </View>
    );
};