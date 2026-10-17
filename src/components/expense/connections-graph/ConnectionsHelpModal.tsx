import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';

interface ConnectionsHelpModalProps {
    visible: boolean;
    isDark: boolean;
    onClose: () => void;
}

const TIPS: { title: string; body: string }[] = [
    {
        title: 'Three columns',
        body: 'Paid by → who put money in. Items → what was bought. Split between → who owes a share.',
    },
    {
        title: 'Tap to trace',
        body: 'Tap any chip to highlight its path. Related chips light up; everything else dims. Tap again to clear.',
    },
    {
        title: 'Colored items',
        body: 'Each item has its own color. Links and highlights for that item use the same color so paths stay easy to follow.',
    },
    {
        title: 'Solid vs dashed lines',
        body: 'Solid lines mean an item is assigned to specific people. Dashed lines mean the item is pooled across everyone in the split.',
    },
    {
        title: 'Amounts on the path',
        body: 'When something is selected, chip amounts switch to the share for that path only—not each person’s full expense total.',
    },
];

export function ConnectionsHelpModal({
    visible,
    isDark,
    onClose,
}: ConnectionsHelpModalProps) {
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Dismiss" />

                <View className="w-full max-h-[80%] rounded-[32px] border border-border-input bg-bg-canvas p-6 shadow-2xl">
                    <View className="mb-4 items-center">
                        <View className="mb-3 rounded-full bg-accent-sky-bg p-3">
                            <Iconify
                                icon="heroicons:information-circle"
                                size={32}
                                color={colors.accent.sky}
                            />
                        </View>
                        <AppText variant="h3" className="text-center font-bold text-text-primary">
                            How Connections works
                        </AppText>
                        <AppText
                            variant="body-small"
                            className="mt-1 text-center text-text-primary-lighter"
                        >
                            A quick map of who paid, what for, and who owes
                        </AppText>
                    </View>

                    <ScrollView className="mb-5" showsVerticalScrollIndicator={false}>
                        <View className="gap-y-4">
                            {TIPS.map((tip) => (
                                <View
                                    key={tip.title}
                                    className="rounded-2xl border border-border-input bg-bg-primary-lighter p-3.5"
                                >
                                    <AppText
                                        variant="body-small"
                                        className="mb-1 font-semibold text-text-primary"
                                    >
                                        {tip.title}
                                    </AppText>
                                    <AppText
                                        variant="body-small"
                                        className="leading-relaxed text-text-primary-lighter"
                                    >
                                        {tip.body}
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <AppButton variant="primary" size="md" onPress={onClose}>
                        Got it
                    </AppButton>
                </View>
            </View>
        </Modal>
    );
}
