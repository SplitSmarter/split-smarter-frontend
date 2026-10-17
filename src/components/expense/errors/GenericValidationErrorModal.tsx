import React from 'react';
import { Modal, Pressable, View, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { DraftValidationErrorKey, ValidationErrorPayloads } from "@/src/interfaces/expense/draft_validation";
import { COLORS } from '@/src/constants/colors';

interface GenericValidationErrorModalProps {
    visible: boolean;
    errorKey: DraftValidationErrorKey | null;
    errorData: ValidationErrorPayloads[keyof ValidationErrorPayloads] | null;
    isDark: boolean;
    onClose: () => void;
}

export const GenericValidationErrorModal: React.FC<GenericValidationErrorModalProps> = ({
                                                                                            visible,
                                                                                            errorKey,
                                                                                            errorData,
                                                                                            isDark,
                                                                                            onClose
                                                                                        }) => {
    if (!visible || !errorKey || !errorData) return null;

    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/60 px-6">
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View className="w-full max-h-[75%] rounded-[32px] p-6 shadow-2xl border bg-bg-canvas border-border-input">

                    {/* Header Status Matrix */}
                    <View className="items-center mb-4">
                        <View className={`p-3 rounded-full mb-3 ${errorKey === DraftValidationErrorKey.GROUP_MISMATCH ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                            {errorKey === DraftValidationErrorKey.GROUP_MISMATCH ? (
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color={colors.status.warning}
                                />
                            ) : (
                                <Iconify
                                    icon="heroicons:exclamation-circle"
                                    size={32}
                                    color={colors.status.error}
                                />
                            )}
                        </View>
                        <AppText variant="h3" className="font-bold text-text-primary text-center">
                            {errorKey === DraftValidationErrorKey.TITLE_REQUIRED && "Title Required"}
                            {errorKey === DraftValidationErrorKey.AMOUNT_INVALID && "Invalid Amount"}
                            {errorKey === DraftValidationErrorKey.ALLOCATION_MISMATCH && "Allocation Mismatch"}
                            {errorKey === DraftValidationErrorKey.GROUP_MISMATCH && "Group Mismatch Detected"}
                        </AppText>
                    </View>

                    {/* Content Section */}
                    <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                        <AppText variant="body-base" className="text-text-primary-lighter text-center leading-relaxed mb-4">
                            {errorData.message}
                        </AppText>

                        {/* Special Custom Payload Renderer for Group Mismatch */}
                        {errorKey === DraftValidationErrorKey.GROUP_MISMATCH && 'data' in errorData && (
                            <View className="rounded-2xl p-4 border bg-bg-primary-lighter border-border-input">
                                <AppText variant="caption-xs" className="font-bold uppercase tracking-wider text-text-primary-lighter mb-3">
                                    Missing Users from Group: {errorData.data?.group?.title}
                                </AppText>
                                <View className="gap-y-2">
                                    {errorData.data?.missingUsers?.map((user) => (
                                        <View key={user.id} className="flex-row items-center space-x-3 py-1">
                                            <AppImageV2
                                                id={`missing-user-${user.id}`}
                                                url={user.avatar?.url}
                                                style={{ width: 24, height: 24 }}
                                                className="rounded-full"
                                                fallbackComponent={
                                                    <EntityFallbackIcon kind="user" size={12} color={colors.icon.lighter} />
                                                }
                                            />
                                            <AppText variant="body-small" className="text-text-primary font-medium ml-2">{user.name}</AppText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Action Footer */}
                    <AppButton variant="primary" size="md" onPress={onClose}>
                        DISMISS
                    </AppButton>
                </View>
            </View>
        </Modal>
    );
};