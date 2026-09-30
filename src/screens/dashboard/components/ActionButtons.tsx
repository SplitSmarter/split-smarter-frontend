import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Octicons } from '@expo/vector-icons';

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
    return (
        <View className="flex-row items-center justify-between px-5 -mt-5 mb-6 z-10">
            <TouchableOpacity
                onPress={onDepositPress}
                className="flex-1 bg-white/95 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl mr-2 border border-white/20"
            >
                <Feather name="arrow-up-right" size={18} color="#000" />
                <Text className="text-black font-semibold ml-2">Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onSwitchPress}
                className="w-12 h-12 bg-white/95 rounded-2xl items-center justify-center shadow-xl mr-2 border border-white/20"
            >
                <Octicons name="arrow-switch" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onWithdrawPress}
                className="flex-1 bg-white/95 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl border border-white/20"
            >
                <Feather name="arrow-down-left" size={18} color="#000" />
                <Text className="text-black font-semibold ml-2">Settle</Text>
            </TouchableOpacity>
        </View>
    );
};