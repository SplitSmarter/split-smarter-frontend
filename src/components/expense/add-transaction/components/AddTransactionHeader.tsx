import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';

interface AddTransactionHeaderProps {
    iconColor: string;
    onOpenPicker: () => void;
    onOpenOptions: () => void;
}

export const AddTransactionHeader: React.FC<AddTransactionHeaderProps> = ({
                                                                              iconColor,
                                                                              onOpenPicker,
                                                                              onOpenOptions,
                                                                          }) => {
    return (
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
            <Pressable onPress={() => router.back()} className="p-1">
                <Iconify icon="heroicons:chevron-left" size={28} color={iconColor} />
            </Pressable>
            <AppText variant="h3" className="text-text-secondary font-bold">
                Add Split
            </AppText>
            <View className="flex-row items-center gap-x-3">
                <Pressable onPress={onOpenPicker} className="p-1 active:opacity-70">
                    <Iconify icon="heroicons:camera" size={26} color={iconColor} />
                </Pressable>
                <Pressable onPress={onOpenOptions} className="p-1 active:opacity-70">
                    <Iconify icon="heroicons:ellipsis-vertical" size={28} color={iconColor} />
                </Pressable>
            </View>
        </View>
    );
};