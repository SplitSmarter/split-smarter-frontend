import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { Iconify } from 'react-native-iconify';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

interface SelectedTag {
    id: string;
    label: string;
}

interface SelectionTagsProps {
    tags: SelectedTag[];
    onRemoveTag: (id: string) => void;
}

export const SelectionTags = ({ tags, onRemoveTag }: SelectionTagsProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (tags.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-3 px-6 mb-4 justify-center">
            {tags.map((tag) => (
                <View key={tag.id} className="flex-row items-center bg-bg-primary-lighter border border-border-input rounded-full px-4 py-1.5 shadow-sm">
                    <AppText variant="caption-xs" className="text-text-primary font-medium mr-2">
                        {tag.label}
                    </AppText>
                    <Pressable onPress={() => onRemoveTag(tag.id)} className="p-0.5 rounded-full bg-bg-primary-darker">
                        <Iconify icon="heroicons:x-mark-solid" size={12} color={colors.icon.primary} />
                    </Pressable>
                </View>
            ))}
        </View>
    );
};