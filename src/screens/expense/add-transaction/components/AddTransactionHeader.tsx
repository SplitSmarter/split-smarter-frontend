import React from 'react';
import {View, Pressable} from 'react-native';
import {router} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {TabButton} from '../AddTransactionHelper';
import {TRANSACTION_TABS, TransactionTabType} from '../constants/addTransaction.constants';

interface AddTransactionHeaderProps {
    iconColor: string;
    activeTab: TransactionTabType;
    onTabChange: (tab: TransactionTabType) => void;
    onOpenOptions: () => void;
}

export const AddTransactionHeader: React.FC<AddTransactionHeaderProps> = ({
    iconColor,
    activeTab,
    onTabChange,
    onOpenOptions,
}) => {
    return (
        <View className="flex-row justify-between items-center px-4 pt-4 pb-2 gap-x-2">
            <Pressable onPress={() => router.back()} className="p-1">
                <Iconify icon="heroicons:chevron-left" size={28} color={iconColor}/>
            </Pressable>

            <View className="flex-1 flex-row bg-bg-canvas p-1 rounded-full border border-bg-primary-darker">
                {TRANSACTION_TABS.map((tab) => (
                    <TabButton
                        key={tab.id}
                        label={tab.label}
                        isActive={activeTab === tab.id}
                        onPress={() => onTabChange(tab.id)}
                    />
                ))}
            </View>

            <Pressable onPress={onOpenOptions} className="p-1 active:opacity-70">
                <Iconify icon="heroicons:ellipsis-vertical" size={28} color={iconColor}/>
            </Pressable>
        </View>
    );
};
