import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Octicons } from '@expo/vector-icons';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

interface ActionButtonsProps {
    onDepositPress?: () => void;
    onSwitchPress?: () => void;
    onWithdrawPress?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                                onDepositPress,
                                                                onSwitchPress,
                                                                onWithdrawPress,
                                                            }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const pillStyle = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
    };

    return (
        <View className="flex-row items-center justify-between px-5 -mt-5 mb-6 z-10">
            <TouchableOpacity
                onPress={onDepositPress}
                style={pillStyle}
                className="flex-1 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl mr-2 border"
            >
                <Feather name="arrow-up-right" size={18} color={colors.icon.darker} />
                <Text style={{ color: colors.text.primary }} className="font-semibold ml-2">
                    Transfer
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onSwitchPress}
                style={pillStyle}
                className="w-12 h-12 rounded-2xl items-center justify-center shadow-xl mr-2 border"
            >
                <Octicons name="arrow-switch" size={18} color={colors.icon.darker} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onWithdrawPress}
                style={pillStyle}
                className="flex-1 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl border"
            >
                <Feather name="arrow-down-left" size={18} color={colors.icon.darker} />
                <Text style={{ color: colors.text.primary }} className="font-semibold ml-2">
                    Settle
                </Text>
            </TouchableOpacity>
        </View>
    );
};
