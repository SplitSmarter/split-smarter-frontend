import React from 'react';
import { View, ActivityIndicator, Pressable, ScrollView } from 'react-native'; // 👈 CHANGED: Swapped to regular ScrollView
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { GroupDetails } from '@/src/api/dto/user/group';
import { COLORS } from "@/src/constants/colors";

interface GroupListContentProps {
    loading: boolean;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filteredGroups: GroupDetails[];
    selectedId?: number;
    onSelect: (group: GroupDetails) => void;
    onAddNew: () => void;
    isDark: boolean;
}

export const GroupListContent = React.memo<GroupListContentProps>(({
                                                                       loading, searchQuery, setSearchQuery, filteredGroups, selectedId, onSelect, onAddNew, isDark
                                                                   }: GroupListContentProps) => {
    if (loading) {
        return <View className="flex-1 justify-center"><ActivityIndicator size="large" color={COLORS.bg_primary_dark} /></View>;
    }

    return (
        <View className="flex-1">
            {/* 👈 FIXED: Removed duplicated search bar input wrapper element here to defer strictly to the main modal sheet container layout */}

            {/* 👈 CHANGED: Swapped out BottomSheetScrollView to clean native ScrollView boundary context */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 mb-6 shadow-sm">
                    <AppText variant="h4" className="mb-4 text-text-primary">
                        {searchQuery ? 'Results' : 'All Groups'}
                    </AppText>

                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => onSelect(item)}
                                className={`flex-row items-center py-3 px-2 rounded-2xl mb-1 ${item.id === selectedId ? 'bg-bg-secondary/10' : ''}`}
                            >
                                <View className="w-14 h-14 mr-4">
                                    <AppImage id={item.icon?.id} url={item.icon?.url} variant="circular" size="full" />
                                </View>
                                <View className="flex-1">
                                    <AppText variant="body-base" className="font-semibold text-text-primary">{item.title}</AppText>
                                    <AppText variant="caption-xs" className="opacity-60">Active Group</AppText>
                                </View>
                                <View className="flex-row-reverse">
                                    {[1, 2, 3].map((i) => (
                                        <View key={i} className="-mr-2 border-2 border-white dark:border-zinc-900 rounded-full overflow-hidden w-6 h-6 bg-bg-primary">
                                            <Iconify icon="heroicons:user-circle" size={20} color={isDark ? "#333" : "#CCC"} />
                                        </View>
                                    ))}
                                </View>
                            </Pressable>
                        ))
                    ) : (
                        <View className="items-center py-8">
                            <Iconify icon="heroicons:magnifying-glass-minus" size={48} color={isDark ? "#333" : "#EEE"} />
                            <AppText className="text-text-secondary mt-2">No groups found</AppText>
                        </View>
                    )}
                </View>

                <AppButton
                    variant="primary"
                    className="rounded-2xl h-14 bg-bg-secondary"
                    onPress={onAddNew}
                    renderIcon={(color) => <Iconify icon="heroicons:plus-circle" size={20} color={color} />}
                >
                    Create New Group
                </AppButton>
            </ScrollView>
        </View>
    );
});

GroupListContent.displayName = 'GroupListContent';