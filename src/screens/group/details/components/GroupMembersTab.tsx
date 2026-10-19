import React, {useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {GroupMemberDetails} from '@/src/api/dto/user/group';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {GroupMemberDetailsBottomSheet} from '@/src/screens/group/details/components/GroupMemberDetailsBottomSheet';

interface GroupMembersTabProps {
    members: GroupMemberDetails[];
    loading?: boolean;
    onMemberChanged?: () => void;
    onNavigateToUserProfile: (userId: number, userType: string) => void;
    onAddMember?: () => void;
}

export function GroupMembersTab({
    members,
    loading = false,
    onMemberChanged,
    onNavigateToUserProfile,
    onAddMember,
}: GroupMembersTabProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [selectedMember, setSelectedMember] = useState<GroupMemberDetails | null>(null);
    const [profileVisible, setProfileVisible] = useState(false);

    const openMember = (member: GroupMemberDetails) => {
        setSelectedMember(member);
        setProfileVisible(true);
    };

    const closeMember = () => {
        setProfileVisible(false);
        setSelectedMember(null);
    };

    if (loading) {
        return (
            <View className="items-center py-16">
                <ActivityIndicator color={colors.icon.primary} size="large" />
            </View>
        );
    }

    if (members.length === 0) {
        return (
            <View className="flex-1 py-8">
                <SheetEmptyState
                    icon={
                        <Iconify
                            icon="heroicons:user-group"
                            size={28}
                            color={colors.icon.primary}
                        />
                    }
                    title="No members yet"
                    description="People in this group will show up here."
                    primaryAction={
                        onAddMember
                            ? {
                                  label: 'Add member',
                                  onPress: onAddMember,
                                  renderIcon: (c) => (
                                      <Iconify icon="heroicons:user-plus" size={18} color={c} />
                                  ),
                              }
                            : undefined
                    }
                />
            </View>
        );
    }

    return (
        <View className="pb-10">
            <View className="mb-4 flex-row items-center justify-between">
                <AppText variant="h4" className="font-bold text-text-primary">
                    Members
                </AppText>
                <View className="rounded-full bg-bg-canvas px-3 py-1">
                    <AppText variant="caption-xs" className="font-medium text-text-primary-lighter">
                        {members.length === 1 ? '1 total' : `${members.length} total`}
                    </AppText>
                </View>
            </View>

            {onAddMember ? (
                <Pressable
                    onPress={onAddMember}
                    className="mb-4 flex-row items-center self-start active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Add members"
                >
                    <Iconify icon="heroicons:user-plus" size={16} color={colors.accent.sky} />
                    <AppText variant="body-small" className="ml-1.5 font-semibold text-accent-sky">
                        Add members
                    </AppText>
                </Pressable>
            ) : null}

            {members.map((membership) => (
                <Pressable
                    key={`${membership.id}_${membership.user_type}`}
                    onPress={() => openMember(membership)}
                    className="mb-3 flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-canvas p-4 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel={`View ${membership.name || 'member'}`}
                >
                    <View className="min-w-0 flex-1 flex-row items-center pr-3">
                        <View className="h-10 w-10 overflow-hidden rounded-full border border-border-input">
                            <AppImage
                                id={membership.avatar?.id ?? String(membership.id)}
                                url={membership.avatar?.url}
                                size="full"
                                backgroundColor="transparent"
                                variant="circular"
                                fallbackIcon={
                                    <EntityFallbackIcon
                                        kind="user"
                                        size={18}
                                        color={colors.icon.lighter}
                                    />
                                }
                            />
                        </View>
                        <View className="ml-3 min-w-0 flex-1">
                            <AppText
                                numberOfLines={1}
                                className="font-medium text-text-primary"
                            >
                                {membership.name || 'Unknown user'}
                            </AppText>
                            {membership.contribution_inr != null ? (
                                <AppText
                                    variant="caption-xs"
                                    className="mt-0.5 text-text-primary-lighter"
                                    numberOfLines={1}
                                >
                                    ₹{Number(membership.contribution_inr).toFixed(0)} contributed
                                </AppText>
                            ) : null}
                        </View>
                    </View>

                    <View className="rounded-full border border-border-input bg-bg-primary px-3 py-1.5">
                        <AppText
                            variant="caption-xs"
                            className="font-medium capitalize tracking-wide text-text-primary-lighter"
                        >
                            {membership.role?.toLowerCase() || 'member'}
                        </AppText>
                    </View>
                </Pressable>
            ))}

            <GroupMemberDetailsBottomSheet
                visible={profileVisible}
                member={selectedMember}
                onClose={closeMember}
                onNavigateToProfile={onNavigateToUserProfile}
                onRoleChanged={onMemberChanged}
                onMemberRemoved={onMemberChanged}
            />
        </View>
    );
}
