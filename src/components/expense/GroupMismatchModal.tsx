import React from 'react';
import { View, Modal, Pressable, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { useExpenseDraftStore } from "@/src/store/draft/expenseDraftStore";
import {DraftValidationErrorKey} from "@/src/interfaces/expense/draft_validation";

interface GroupMismatchModalProps {
    visible: boolean;
    onClose: () => void;
}

export const GroupMismatchModal: React.FC<GroupMismatchModalProps> = ({ visible, onClose }) => {
    const { validationErrors, dismissError } = useExpenseDraftStore();
    const mismatchError = validationErrors[DraftValidationErrorKey.GROUP_MISMATCH];

    if (!mismatchError || !mismatchError.data) return null;

    const { group, missingUsers } = mismatchError.data;

    const handleIgnoreAndDismiss = () => {
        dismissError(DraftValidationErrorKey.GROUP_MISMATCH);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <View className="w-full max-h-[80%] bg-bg-canvas rounded-[32px] p-6 shadow-2xl border border-bg-primary-darker/20">

                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center space-x-2">
                            <Iconify icon="heroicons:exclamation-triangle" size={24} color="#D97706" />
                            <AppText variant="h3" className="text-text-primary font-bold">Group Mismatch</AppText>
                        </View>
                        <Pressable onPress={onClose} className="p-1 active:opacity-60">
                            <Iconify icon="heroicons:x-mark" size={24} className="text-text-secondary" />
                        </Pressable>
                    </View>

                    {/* Group Target Display Context */}
                    <View className="flex-row items-center bg-bg-secondary px-4 py-3 rounded-2xl mb-4 border border-bg-primary-darker/40">
                        <AppImageV2
                            id={`mismatch-group-${group.id}`}
                            url={group.icon?.url}
                            style={{ width: 36, height: 36 }}
                            className="rounded-full bg-gray-200"
                        />
                        <View className="ml-3 flex-1">
                            <AppText variant="body-small" className="text-text-primary font-bold">{group.title}</AppText>
                            <AppText variant="caption-xs" className="text-text-secondary">{group.no_of_members} active group members</AppText>
                        </View>
                    </View>

                    <AppText variant="body-small" className="text-text-secondary mb-4">
                        The following participants added to this split are not currently members of the selected group:
                    </AppText>

                    {/* Missing Users Scrolling List Container */}
                    <ScrollView className="flex-none max-h-48 mb-6" showsVerticalScrollIndicator={true}>
                        <View className="space-y-2">
                            {missingUsers.map((user) => (
                                <View key={`${user.id}_${user.user_type}`} className="flex-row items-center p-2 rounded-xl bg-bg-secondary/50">
                                    <AppImageV2
                                        id={`mismatch-user-${user.id}`}
                                        url={user.avatar?.url}
                                        style={{ width: 32, height: 32 }}
                                        className="rounded-full bg-gray-200"
                                    />
                                    <View className="ml-3">
                                        <AppText variant="body-small" className="text-text-primary font-semibold">{user.name}</AppText>
                                        <AppText variant="caption-xs" className="text-text-secondary capitalize">{user.user_type.toLowerCase()}</AppText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Actions Panel */}
                    <View className="space-y-2">
                        <AppButton variant="primary" size="md" onPress={onClose}>
                            Review Participants
                        </AppButton>
                        <Pressable onPress={handleIgnoreAndDismiss} className="w-full py-3 rounded-xl items-center active:bg-gray-100 dark:active:bg-gray-800">
                            <AppText variant="body-small" className="text-amber-600 font-bold">Ignore Warning & Keep Users</AppText>
                        </Pressable>
                    </View>

                </View>
            </View>
        </Modal>
    );
};