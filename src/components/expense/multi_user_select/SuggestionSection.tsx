import React, { memo } from 'react';
import { ActivityIndicator, ScrollView, Pressable, View } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { AppText } from '@/src/components/common/AppText';
import { themeStore } from "@/src/store/themeStore";
import {ToggleUserPayload, UserItem} from "@/src/components/expense/MultiUserSelect";
import { COLORS } from '@/src/constants/colors';

interface SuggestionsProps {
    loading: boolean;
    allUsers: ToggleUserPayload[];
    selectedUsers: UserItem[];
    title?: string;
    onToggleUser: (user: ToggleUserPayload) => void;
    onAddNewUser?: () => void;
}

const SuggestionsSection = memo(({ loading, allUsers, title = 'Suggestions', onToggleUser, onAddNewUser }: SuggestionsProps) => {
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    return (
        <View className="pt-4 px-4 mb-2">
            <AppText variant="h4" className="mb-3 opacity-60 font-semibold tracking-wide">
                {title}
            </AppText>

            {loading ? (
                <ActivityIndicator size="small" color={COLORS.light.brand.primary} className="self-start py-4" />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {onAddNewUser ? (
                        <Pressable onPress={onAddNewUser} className="items-center mr-5 justify-center">
                            <View className={`w-14 h-14 rounded-full items-center justify-center border-2 border-dashed mb-2 ${isDark ? 'border-gray-700 bg-gray-900/40' : 'border-gray-300 bg-gray-50'}`}>
                                <Iconify icon="heroicons:user-plus" size={22} color={COLORS.light.brand.primary} />
                            </View>
                            <AppText variant="body-small" className="font-bold text-bg-secondary">Add New</AppText>
                        </Pressable>
                    ) : null}

                    {allUsers.slice(0, 10).map(user => (
                        <Pressable
                            key={`${user.id}-${user.user_type}`}
                            onPress={() => onToggleUser({
                                id: user.id,
                                user_type: user.user_type,
                                name: user.name,
                                avatarUrl: user.avatarUrl
                            })}
                            className="items-center mr-5"
                        >
                            <AppImageV2
                                id={user.id}
                                url={user.avatarUrl}
                                style={{ width: 56, height: 56 }}
                                className="rounded-full mb-2 border border-gray-100 dark:border-gray-800"
                            />
                            <AppText variant="body-small" className="font-medium opacity-90">
                                {user.name ? user.name.split(' ')[0] : 'Unknown'}
                            </AppText>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
    );
});

export default SuggestionsSection;

SuggestionsSection.displayName = 'SuggestionsSection';