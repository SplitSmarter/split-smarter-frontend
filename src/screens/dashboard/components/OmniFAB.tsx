import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Octicons } from '@expo/vector-icons';

interface OmniFABProps {
    onAddExpensePress?: () => void;
    onSplitBillPress?: () => void;
    onPayContactPress?: () => void;
}

export const OmniFAB: React.FC<OmniFABProps> = ({
                                                    onAddExpensePress,
                                                    onSplitBillPress,
                                                    onPayContactPress,
                                                }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View className="absolute bottom-24 right-6 items-end z-50">
            {/* Animated Speed Dial Options */}
            {isOpen && (
                <View className="items-end space-y-3 mb-3">
                    <TouchableOpacity
                        onPress={() => {
                            setIsOpen(false);
                            onAddExpensePress?.();
                        }}
                        className="flex-row items-center bg-zinc-800 border border-white/20 py-2 px-3 rounded-full shadow-2xl"
                    >
                        <Text className="text-white text-xs font-semibold mr-2">
                            ➕ Add Expense
                        </Text>
                        <View className="w-7 h-7 bg-orange-500 rounded-full items-center justify-center">
                            <Feather name="plus" size={14} color="white" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setIsOpen(false);
                            onSplitBillPress?.();
                        }}
                        className="flex-row items-center bg-zinc-800 border border-white/20 py-2 px-3 rounded-full shadow-2xl"
                    >
                        <Text className="text-white text-xs font-semibold mr-2">
                            ↔️ Split Bill
                        </Text>
                        <View className="w-7 h-7 bg-teal-500 rounded-full items-center justify-center">
                            <Octicons name="arrow-switch" size={14} color="white" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setIsOpen(false);
                            onPayContactPress?.();
                        }}
                        className="flex-row items-center bg-zinc-800 border border-white/20 py-2 px-3 rounded-full shadow-2xl"
                    >
                        <Text className="text-white text-xs font-semibold mr-2">
                            💸 Pay Contact
                        </Text>
                        <View className="w-7 h-7 bg-emerald-500 rounded-full items-center justify-center">
                            <Feather name="send" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main FAB Trigger */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsOpen((prev) => !prev)}
                className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full items-center justify-center shadow-2xl border border-white/30"
            >
                <Feather
                    name={isOpen ? 'x' : 'plus'}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
        </View>
    );
};