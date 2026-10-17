import React, {useEffect} from 'react';
import {View, Modal, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {DraftValidationErrorKey} from '@/src/interfaces/expense/draft_validation';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface GroupMismatchModalProps {
    visible: boolean;
    onClose: () => void;
}

export const GroupMismatchModal: React.FC<GroupMismatchModalProps> = ({visible, onClose}) => {
    const isDark = themeStore((s) => s.theme) === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const iconMuted = colors.icon.lighter;

    const mismatchError = useExpenseDraftStore(
        (s) => s.validationErrors[DraftValidationErrorKey.GROUP_MISMATCH],
    );
    const fetchGroupAddPermission = useExpenseDraftStore((s) => s.fetchGroupAddPermission);
    const addMissingMembersToGroup = useExpenseDraftStore((s) => s.addMissingMembersToGroup);
    const clearGroupForReselect = useExpenseDraftStore((s) => s.clearGroupForReselect);
    const isFetchingGroupAddPermission = useExpenseDraftStore((s) => s.isFetchingGroupAddPermission);
    const isAddingMissingMembers = useExpenseDraftStore((s) => s.isAddingMissingMembers);
    const canAddMissingMembers = useExpenseDraftStore((s) => s.canAddMissingMembers);
    const groupAddPermissionDeniedReason = useExpenseDraftStore(
        (s) => s.groupAddPermissionDeniedReason,
    );
    const lastGroupAddPartialMessage = useExpenseDraftStore((s) => s.lastGroupAddPartialMessage);

    const groupId = mismatchError?.data?.group?.id;
    const missingKey = mismatchError?.data?.missingUsers
        ?.map((u) => `${u.id}_${u.user_type}`)
        .join('|');

    useEffect(() => {
        if (!visible || !groupId) return;
        fetchGroupAddPermission();
    }, [visible, groupId, missingKey, fetchGroupAddPermission]);

    if (!visible || !mismatchError?.data) return null;

    const {group, missingUsers} = mismatchError.data;
    const busy = isFetchingGroupAddPermission || isAddingMissingMembers;
    const addDisabled =
        busy || canAddMissingMembers === false || canAddMissingMembers === null;

    const handleAddUsersToGroup = async () => {
        if (addDisabled) return;
        const result = await addMissingMembersToGroup();
        if (result.ok && result.fullyResolved) {
            onClose();
        }
    };

    const handleChangeGroup = () => {
        if (isAddingMissingMembers) return;
        clearGroupForReselect();
        onClose();
    };

    const handleDismiss = () => {
        if (isAddingMissingMembers) return;
        onClose();
    };

    const primaryLabel = isFetchingGroupAddPermission
        ? 'Checking access…'
        : isAddingMissingMembers
            ? 'Adding…'
            : 'Add Users to Group';

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={handleDismiss}>
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <View className="w-full max-h-[80%] bg-bg-canvas rounded-[32px] p-6 border border-border-input">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-x-2">
                            <Iconify icon="heroicons:exclamation-triangle" size={24} color={colors.status.warning}/>
                            <AppText variant="h3" className="text-text-primary font-bold">
                                Group Mismatch
                            </AppText>
                        </View>
                        <Pressable
                            onPress={handleDismiss}
                            disabled={isAddingMissingMembers}
                            className="p-1"
                            style={({pressed}) => (pressed ? {opacity: 0.6} : undefined)}
                        >
                            <Iconify icon="heroicons:x-mark" size={24} color={iconMuted}/>
                        </Pressable>
                    </View>

                    <View className="flex-row items-center bg-bg-primary px-4 py-3 rounded-2xl mb-4 border border-border-input">
                        <AppImageV2
                            id={`mismatch-group-${group.id}`}
                            url={group.icon?.url}
                            style={{width: 36, height: 36}}
                            className="rounded-full bg-bg-primary-darker"
                            fallbackComponent={
                                <EntityFallbackIcon kind="group" size={20} color={iconMuted} />
                            }
                        />
                        <View className="ml-3 flex-1">
                            <AppText variant="body-small" className="text-text-primary font-bold">
                                {group.title}
                            </AppText>
                            <AppText variant="caption-xs" className="text-text-primary-lighter">
                                {group.no_of_members} active group members
                            </AppText>
                        </View>
                    </View>

                    <AppText variant="body-small" className="text-text-primary-lighter mb-4">
                        These participants are not members of the selected group. Add them now, or pick a
                        different group.
                    </AppText>

                    <ScrollView className="flex-none max-h-48 mb-4" showsVerticalScrollIndicator>
                        <View className="gap-y-2">
                            {missingUsers.map((user) => (
                                <View
                                    key={`${user.id}_${user.user_type}`}
                                    className="flex-row items-center p-2 rounded-xl bg-bg-primary"
                                >
                                    <AppImageV2
                                        id={`mismatch-user-${user.id}`}
                                        url={user.avatar?.url}
                                        style={{width: 32, height: 32}}
                                        className="rounded-full bg-bg-primary-darker"
                                        fallbackComponent={
                                            <EntityFallbackIcon kind="user" size={16} color={iconMuted} />
                                        }
                                    />
                                    <View className="ml-3">
                                        <AppText
                                            variant="body-small"
                                            className="text-text-primary font-semibold"
                                        >
                                            {user.name}
                                        </AppText>
                                        <AppText
                                            variant="caption-xs"
                                            className="text-text-primary-lighter capitalize"
                                        >
                                            {String(user.user_type).toLowerCase()}
                                        </AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {isFetchingGroupAddPermission && (
                        <View className="flex-row items-center gap-x-2 mb-3 px-1">
                            <ActivityIndicator size="small" color={iconMuted}/>
                            <AppText variant="caption-xs" className="text-text-primary-lighter">
                                Checking whether you can add members…
                            </AppText>
                        </View>
                    )}

                    {(groupAddPermissionDeniedReason || lastGroupAddPartialMessage) &&
                        !isFetchingGroupAddPermission && (
                            <View className="mb-3 px-3 py-2.5 rounded-xl bg-red-500/10">
                                <AppText variant="caption-xs" className="text-status-error font-medium">
                                    {groupAddPermissionDeniedReason || lastGroupAddPartialMessage}
                                </AppText>
                            </View>
                        )}

                    <View className="gap-y-2">
                        <AppButton
                            variant="primary"
                            size="md"
                            onPress={handleAddUsersToGroup}
                            disabled={addDisabled}
                            loading={isAddingMissingMembers}
                            loadingText="Adding…"
                        >
                            {primaryLabel}
                        </AppButton>
                        <AppButton
                            variant="secondary"
                            size="md"
                            onPress={handleChangeGroup}
                            disabled={isAddingMissingMembers}
                        >
                            Change Group
                        </AppButton>
                        <Pressable
                            onPress={handleDismiss}
                            disabled={isAddingMissingMembers}
                            className="w-full py-3 rounded-xl items-center"
                            style={({pressed}) => (pressed || isAddingMissingMembers ? {opacity: 0.5} : undefined)}
                        >
                            <AppText
                                variant="body-small"
                                className="text-text-primary-lighter font-medium"
                            >
                                Review Later
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
