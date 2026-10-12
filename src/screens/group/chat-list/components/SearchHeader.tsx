import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
}

export const SearchHeader = ({ searchQuery, onSearchChange }: SearchHeaderProps) => {
    const isDark = themeStore((state) => state.theme) === 'dark';
    const iconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const placeholderColor = isDark ? COLORS.dark.text.placeholder : COLORS.light.text.placeholder;

    return (
        <View className="px-4 mb-4">
            <View className="bg-bg-canvas flex-row items-center px-4 h-12 rounded-full shadow-sm">
                <Iconify icon="heroicons:magnifying-glass" size={20} color={iconColor} />
                <TextInput
                    placeholder="Type to search"
                    className="flex-1 ml-2 text-base h-full text-text-primary"
                    placeholderTextColor={placeholderColor}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => onSearchChange('')}>
                        <Iconify icon="heroicons:x-mark" size={18} color={iconColor} />
                    </Pressable>
                )}
            </View>
        </View>
    );
};
