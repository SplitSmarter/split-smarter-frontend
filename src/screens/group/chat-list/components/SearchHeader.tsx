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
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="px-4 mb-4">
            <View
                className="flex-row items-center px-4 h-12 rounded-full"
                style={{
                    // Light: white pill on slate header. Dark: deepest body black (not slate/white).
                    backgroundColor: isDark ? colors.bg.primary : colors.bg.lighter,
                    borderWidth: 1,
                    borderColor: colors.status.border,
                }}
            >
                <Iconify icon="heroicons:magnifying-glass" size={20} color={colors.icon.primary} />
                <TextInput
                    placeholder="Type to search"
                    className="flex-1 ml-2 text-base h-full"
                    style={{ color: colors.text.primary }}
                    placeholderTextColor={colors.text.placeholder}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => onSearchChange('')}>
                        <Iconify icon="heroicons:x-mark" size={18} color={colors.icon.primary} />
                    </Pressable>
                )}
            </View>
        </View>
    );
};
