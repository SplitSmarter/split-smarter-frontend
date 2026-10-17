import React, { memo } from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { EntityFallbackIcon } from "@/src/components/common/EntityFallbackIcon";
import { AppText } from '@/src/components/common/AppText';
import { Shimmer } from '@/src/components/common/shimmer';
import { themeStore } from "@/src/store/themeStore";
import {ToggleUserPayload, UserItem} from "@/src/components/expense/MultiUserSelect";
import { COLORS } from '@/src/constants/colors';

/** Matches loaded suggestion chips: 56 avatar + mb-2 + body-small label */
const SUGGESTION_CHIP_HEIGHT = 80;
const SUGGESTION_AVATAR_SIZE = 56;
const SHIMMER_CHIP_COUNT = 5;

interface SuggestionsProps {
    loading: boolean;
    allUsers: ToggleUserPayload[];
    selectedUsers: UserItem[];
    title?: string;
    onToggleUser: (user: ToggleUserPayload) => void;
    onAddNewUser?: () => void;
}

const SuggestionsSection = memo(({ loading, allUsers, title = 'Suggestions', onToggleUser, onAddNewUser }: SuggestionsProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="pt-4 px-4 mb-2">
            <AppText variant="h4" className="mb-3 opacity-60 font-semibold tracking-wide">
                {title}
            </AppText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {onAddNewUser ? (
                    <Pressable onPress={onAddNewUser} className="items-center mr-5 justify-center">
                        <View className="w-14 h-14 rounded-full items-center justify-center border-2 border-dashed border-border-input bg-bg-primary-lighter mb-2">
                            <Iconify icon="heroicons:user-plus" size={22} color={colors.icon.primary} />
                        </View>
                        <AppText variant="body-small" className="font-bold text-text-primary">Add New</AppText>
                    </Pressable>
                ) : null}

                {loading
                    ? Array.from({ length: SHIMMER_CHIP_COUNT }, (_, i) => (
                        <View
                            key={`suggestion-shimmer-${i}`}
                            className="items-center mr-5"
                            style={{ width: SUGGESTION_AVATAR_SIZE, height: SUGGESTION_CHIP_HEIGHT }}
                        >
                            <Shimmer
                                height={SUGGESTION_AVATAR_SIZE}
                                borderRadius={SUGGESTION_AVATAR_SIZE / 2}
                                className="w-14 mb-2"
                            />
                            <Shimmer
                                height={12}
                                borderRadius={6}
                                className="w-12"
                            />
                        </View>
                    ))
                    : allUsers.slice(0, 10).map(user => (
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
                                className="rounded-full mb-2 border border-border-input"
                                fallbackComponent={
                                    <EntityFallbackIcon kind="user" size={24} color={colors.icon.lighter} />
                                }
                            />
                            <AppText variant="body-small" className="font-medium opacity-90">
                                {user.name ? user.name.split(' ')[0] : 'Unknown'}
                            </AppText>
                        </Pressable>
                    ))}
            </ScrollView>
        </View>
    );
});

export default SuggestionsSection;

SuggestionsSection.displayName = 'SuggestionsSection';