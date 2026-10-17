import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {TabButton} from '../AddTransactionHelper';
import {TRANSACTION_TABS, TransactionTabType} from '../constants/addTransaction.constants';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

interface AddTransactionHeaderProps {
    iconColor: string;
    activeTab: TransactionTabType;
    onTabChange: (tab: TransactionTabType) => void;
    onOpenOptions: () => void;
    onBack: () => void;
}

export const AddTransactionHeader: React.FC<AddTransactionHeaderProps> = ({
    iconColor,
    activeTab,
    onTabChange,
    onOpenOptions,
    onBack,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="flex-row items-center justify-between gap-x-2 px-4 pt-4 pb-2">
            <Pressable onPress={onBack} className="p-1">
                <Iconify icon="heroicons:chevron-left" size={28} color={iconColor}/>
            </Pressable>

            <View
                className="flex-1 flex-row rounded-full border p-1"
                style={{
                    // Elevated pill on body canvas (not slate canvas token)
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                }}
            >
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
