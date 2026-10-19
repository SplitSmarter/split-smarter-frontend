import React from 'react';
import {View, Pressable} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Iconify} from 'react-native-iconify';
import {TabButton} from '../AddTransactionHelper';
import {TRANSACTION_TABS, TransactionTabType} from '../constants/addTransaction.constants';
import {PLATINUM_HERO_GRADIENT} from '@/src/screens/dashboard/constants/dashboard.constants';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

interface AddTransactionHeaderProps {
    activeTab: TransactionTabType;
    onTabChange: (tab: TransactionTabType) => void;
    onOpenOptions: () => void;
    onBack: () => void;
}

/**
 * Compact platinum chrome — flat bottom so the form sheet’s inverted-U
 * (rounded top) nests over it. No spend/chart hero.
 */
export const AddTransactionHeader: React.FC<AddTransactionHeaderProps> = ({
    activeTab,
    onTabChange,
    onOpenOptions,
    onBack,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const gradient = isDark ? PLATINUM_HERO_GRADIENT.dark : PLATINUM_HERO_GRADIENT.light;
    const iconColor = COLORS.light.text.contrast;

    return (
        <LinearGradient
            colors={[...gradient]}
            start={{x: 0.1, y: 0.1}}
            end={{x: 0.9, y: 0.9}}
            className="px-4 pb-8 pt-2"
        >
            <View className="flex-row items-center justify-between gap-x-2">
                <Pressable
                    onPress={onBack}
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Iconify icon="heroicons:chevron-left" size={22} color={iconColor} />
                </Pressable>

                <View className="flex-1 flex-row rounded-full border border-white/20 bg-white/10 p-1">
                    {TRANSACTION_TABS.map((tab) => (
                        <TabButton
                            key={tab.id}
                            label={tab.label}
                            isActive={activeTab === tab.id}
                            onPress={() => onTabChange(tab.id)}
                            chrome="platinum"
                        />
                    ))}
                </View>

                <Pressable
                    onPress={onOpenOptions}
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="More options"
                >
                    <Iconify icon="heroicons:ellipsis-vertical" size={22} color={iconColor} />
                </Pressable>
            </View>
        </LinearGradient>
    );
};
