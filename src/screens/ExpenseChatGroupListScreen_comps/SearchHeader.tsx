import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
}

export const SearchHeader = ({ searchQuery, onSearchChange }: SearchHeaderProps) => {
    return (
        <View className="px-4 mb-4">
            <View className="bg-white flex-row items-center px-4 h-12 rounded-full shadow-sm">
                <Iconify icon="heroicons:magnifying-glass" size={20} color="#666"/>
                <TextInput
                    placeholder="Type to search"
                    className="flex-1 ml-2 text-base h-full"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => onSearchChange('')}>
                        <Iconify icon="heroicons:x-mark" size={18} color="#666"/>
                    </Pressable>
                )}
            </View>
        </View>
    );
};