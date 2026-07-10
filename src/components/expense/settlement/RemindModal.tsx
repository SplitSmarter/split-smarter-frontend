import React from 'react';
import { View, Modal, Pressable, Alert, Linking } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';

interface RemindModalProps {
    visible: boolean;
    onClose: () => void;
    userName: string;
}

export const RemindModal: React.FC<RemindModalProps> = ({ visible, onClose, userName }) => {

    const handleSendAnonymous = () => {
        Alert.alert("Dispatched", "Anonymous system push notification context fired successfully.");
        onClose();
    };

    const handleSendWhatsApp = () => {
        const prebuiltString = `Hey ${userName}! Just a friendly reminder to settle up on Split Smarter whenever you get a second. thanks!`;
        Linking.openURL(`whatsapp://send?text=${encodeURIComponent(prebuiltString)}`);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/60 px-6">
                <View className="bg-background w-full rounded-[32px] p-6 border border-zinc-200 dark:border-zinc-800 items-center relative">

                    <Pressable onPress={onClose} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full active:opacity-60">
                        <Iconify icon="heroicons:x-mark" size={18} color="#71717A" />
                    </Pressable>

                    <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 items-center justify-center mb-3">
                        <Iconify icon="heroicons:paper-airplane" size={22} color="#3B82F6" />
                    </View>

                    <AppText variant="h3" className="font-black text-foreground text-center text-lg mb-1">
                        Send Payment Reminder
                    </AppText>
                    <AppText className="text-text-secondary text-xs text-center mb-6 px-4">
                        Choose your transmission line to request tracking settlement from <AppText className="font-bold text-foreground">{userName}</AppText>.
                    </AppText>

                    <View className="w-full space-y-3">
                        {/* WhatsApp Routing Option */}
                        <Pressable onPress={handleSendWhatsApp} className="w-full flex-row items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 active:opacity-70">
                            <View className="flex-row items-center">
                                <Iconify icon="logos:whatsapp-icon" size={20} />
                                <AppText className="font-bold text-emerald-600 dark:text-emerald-400 text-sm ml-3">Custom WhatsApp Text</AppText>
                            </View>
                            <Iconify icon="heroicons:chevron-right" size={16} color="#059669" />
                        </Pressable>

                        {/* Cloud System Pushes Option */}
                        <Pressable onPress={handleSendAnonymous} className="w-full flex-row items-center justify-between p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 active:opacity-70">
                            <View className="flex-row items-center">
                                <Iconify icon="heroicons:bell-alert" size={20} color="#71717A" />
                                <AppText className="font-bold text-text-primary text-sm ml-3">Send Anonymous Push</AppText>
                            </View>
                            <Iconify icon="heroicons:chevron-right" size={16} color="#71717A" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};