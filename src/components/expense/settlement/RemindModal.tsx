import React from 'react';
import { View, Modal, Pressable, Alert, Linking } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';

interface RemindModalProps {
    visible: boolean;
    onClose: () => void;
    userName: string;
}

export const RemindModal: React.FC<RemindModalProps> = ({ visible, onClose, userName }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

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
                <View className="bg-background w-full rounded-[32px] p-6 border border-border-input items-center relative">

                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full active:opacity-60"
                        style={{ backgroundColor: colors.bg.primary }}
                    >
                        <Iconify icon="heroicons:x-mark" size={18} color={colors.icon.primary} />
                    </Pressable>

                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mb-3"
                        style={{ backgroundColor: colors.accent.skyBg }}
                    >
                        <Iconify icon="heroicons:paper-airplane" size={22} color={colors.text.link} />
                    </View>

                    <AppText variant="h3" className="font-black text-foreground text-center text-lg mb-1">
                        Send Payment Reminder
                    </AppText>
                    <AppText className="text-text-primary-lighter text-xs text-center mb-6 px-4">
                        Choose your transmission line to request tracking settlement from <AppText className="font-bold text-foreground">{userName}</AppText>.
                    </AppText>

                    <View className="w-full space-y-3">
                        {/* WhatsApp Routing Option */}
                        <Pressable onPress={handleSendWhatsApp} className="w-full flex-row items-center justify-between p-4 rounded-xl bg-accent-sky-bg border border-accent-sky/30 active:opacity-70">
                            <View className="flex-row items-center">
                                <Iconify icon="logos:whatsapp-icon" size={20} />
                                <AppText className="font-bold text-text-primary text-sm ml-3">Custom WhatsApp Text</AppText>
                            </View>
                            <Iconify icon="heroicons:chevron-right" size={16} color={colors.icon.primary} />
                        </Pressable>

                        {/* Cloud System Pushes Option */}
                        <Pressable
                            onPress={handleSendAnonymous}
                            className="w-full flex-row items-center justify-between p-4 rounded-xl border border-border-input active:opacity-70"
                            style={{ backgroundColor: colors.bg.primary }}
                        >
                            <View className="flex-row items-center">
                                <Iconify icon="heroicons:bell-alert" size={20} color={colors.icon.primary} />
                                <AppText className="font-bold text-text-primary text-sm ml-3">Send Anonymous Push</AppText>
                            </View>
                            <Iconify icon="heroicons:chevron-right" size={16} color={colors.icon.primary} />
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};