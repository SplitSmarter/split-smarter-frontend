import React from 'react';
import { Modal, Pressable, View, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { DraftValidationErrorKey, ValidationErrorPayloads } from "@/src/interfaces/expense/draft_validation";

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

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/60 px-6">
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View className={`w-full max-h-[75%] rounded-[32px] p-6 shadow-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>

                    {/* Header Status Matrix */}
                    <View className="items-center mb-4">
                        <View className={`p-3 rounded-full mb-3 ${errorKey === DraftValidationErrorKey.GROUP_MISMATCH ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                            {errorKey === DraftValidationErrorKey.GROUP_MISMATCH ? (
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color="#D97706"
                                />
                            ) : (
                                <Iconify
                                    icon="heroicons:exclamation-circle"
                                    size={32}
                                    color="#EF4444"
                                />
                            )}
                        </View>
                        <AppText variant="h3" className="font-bold text-text-primary text-center">
                            {errorKey === DraftValidationErrorKey.TITLE_REQUIRED && "Title Required"}
                            {errorKey === DraftValidationErrorKey.AMOUNT_INVALID && "Invalid Amount"}
                            {errorKey === DraftValidationErrorKey.GROUP_MISMATCH && "Group Mismatch Detected"}
                        </AppText>
                    </View>

                    {/* Content Section */}
                    <ScrollView className="mb-6" showsVerticalScrollIndicator={false}>
                        <AppText variant="body-base" className="text-text-secondary text-center leading-relaxed mb-4">
                            {errorData.message}
                        </AppText>

                        {/* Special Custom Payload Renderer for Group Mismatch */}
                        {errorKey === DraftValidationErrorKey.GROUP_MISMATCH && 'data' in errorData && (
                            <View className={`rounded-2xl p-4 border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                                <AppText variant="caption-xs" className="font-bold uppercase tracking-wider text-text-secondary mb-3">
                                    Missing Users from Group: {errorData.data?.group?.title}
                                </AppText>
                                <View className="gap-y-2">
                                    {errorData.data?.missingUsers?.map((user) => (
                                        <View key={user.id} className="flex-row items-center space-x-3 py-1">
                                            {user.avatar?.url ? (
                                                <AppImageV2 id={`missing-user-${user.id}`} url={user.avatar.url} style={{ width: 24, height: 24 }} className="rounded-full" />
                                            ) : (
                                                <View style={{ width: 24, height: 24 }} className="bg-gray-300 dark:bg-zinc-700 rounded-full items-center justify-center">
                                                    <Iconify icon="heroicons:user-solid" size={12} color="#999" />
                                                </View>
                                            )}
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