import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { Iconify } from 'react-native-iconify';

interface SelectedTag {
    id: string;
    label: string;
}

interface SelectionTagsProps {
    tags: SelectedTag[];
    onRemoveTag: (id: string) => void;
}

export const SelectionTags = ({ tags, onRemoveTag }: SelectionTagsProps) => {
    if (tags.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-3 px-6 mb-4 justify-center">
            {tags.map((tag) => (
                <View key={tag.id} className="flex-row items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 shadow-sm">
                    <AppText variant="caption-xs" className="text-gray-700 font-medium mr-2">
                        {tag.label}
                    </AppText>
                    <Pressable onPress={() => onRemoveTag(tag.id)} className="p-0.5 rounded-full bg-gray-200">
                        <Iconify icon="heroicons:x-mark-solid" size={12} color="#4B5563" />
                    </Pressable>
                </View>
            ))}
        </View>
    );
};