import React from 'react';
import { View, Modal, Pressable, Alert, Clipboard, Share } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppButtonV2 } from "@/src/components/common/AppButtonV2";

interface GroupShareModalProps {
    visible: boolean;
    onClose: () => void;
    groupTitle: string;
    groupId: string | number;
    isDark: boolean;
}

export const GroupShareModal: React.FC<GroupShareModalProps> = ({
                                                                    visible,
                                                                    onClose,
                                                                    groupTitle,
                                                                    groupId,
                                                                    isDark
                                                                }) => {
    const shareInviteLink = `https://expensetracker.app/join/group/${groupId || 'invite'}`;

    const handleCopyInviteLink = () => {
        Clipboard.setString(shareInviteLink);
        Alert.alert("Copied", "Invite link copied to clipboard successfully.");
    };

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: `Join our group "${groupTitle || 'Workspace'}" on Expense Tracker to split bills seamlessly!\n\nLink: ${shareInviteLink}`,
            });
        } catch (error) {
            console.error("Native share engine error:", error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/60 px-6">
                <View className="bg-background w-full rounded-[36px] p-6 border border-zinc-200 dark:border-zinc-800 items-center relative">

                    {/* Modal Close Anchor */}
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full active:opacity-60"
                    >
                        <Iconify icon="heroicons:x-mark" size={20} color={isDark ? "#FFF" : "#000"} />
                    </Pressable>

                    <Iconify icon="heroicons:qr-code" size={36} color="#2D6A4F" className="mb-1" />
                    <AppText variant="h3" className="font-black text-foreground text-center text-xl mb-1">
                        Group Invitation
                    </AppText>
                    <AppText className="text-text-primary text-xs text-center mb-6 px-4">
                        Let friends scan this QR or use the ledger connection link below to join "{groupTitle || 'Workspace'}".
                    </AppText>

                    {/* HIGH-FIDELITY QR CANVAS PLACEHOLDER ZONE */}
                    <View className="p-4 bg-white rounded-3xl mb-6 shadow-sm border border-zinc-100 items-center justify-center w-48 h-48">
                        <View className="w-full h-full items-center justify-center border-4 border-dashed border-zinc-300 rounded-2xl relative">
                            <Iconify icon="heroicons:qr-code" size={110} color="#18181B" />
                            <View className="absolute p-1 bg-white rounded-xl">
                                <Iconify icon="heroicons:user-group-solid" size={24} color="#2D6A4F" />
                            </View>
                        </View>
                    </View>

                    {/* INTERACTIVE LINK EXPANSION ROW WITH ACTION HUBS */}
                    <View className="w-full flex-row items-center p-3 rounded-2xl bg-bg-primary-lighter border border-bg-primary-darker mb-6">
                        <Iconify icon="heroicons:link" size={18} color="#71717A" className="shrink-0 ml-1" />
                        <AppText numberOfLines={1} className="text-xs text-text-primary font-medium mx-3 flex-1">
                            {shareInviteLink}
                        </AppText>

                        <View className="flex-row items-center space-x-2">
                            {/* Native Messaging App Forwarder */}
                            <Pressable
                                onPress={handleNativeShare}
                                className="p-2 rounded-xl bg-bg-secondary/10 border border-bg-secondary/20 active:opacity-60"
                            >
                                <Iconify icon="heroicons:chat-bubble-left-right" size={16} color="#2D6A4F" />
                            </Pressable>

                            {/* Direct Clipboard Copier */}
                            <Pressable
                                onPress={handleCopyInviteLink}
                                className="p-2 rounded-xl bg-bg-secondary/10 border border-bg-secondary/20 active:opacity-60"
                            >
                                <Iconify icon="heroicons:document-duplicate" size={16} color="#2D6A4F" />
                            </Pressable>
                        </View>
                    </View>

                    {/* Global Modal Exit Button */}
                    <AppButtonV2
                        onPress={onClose}
                        variant={'primary'}
                        className="w-full py-3.5 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-800 active:opacity-80"
                    >
                        <AppText className="font-bold text-foreground text-sm">Close</AppText>
                    </AppButtonV2>
                </View>
            </View>
        </Modal>
    );
};