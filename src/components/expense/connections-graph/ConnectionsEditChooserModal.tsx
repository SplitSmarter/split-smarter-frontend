import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppButton } from '@/src/components/common/AppButton';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';

/** Which section to open from the Connections edit chooser. */
export type ConnectionsEditTarget =
    | 'paidBy'
    | 'items'
    | 'assignItems'
    | 'split';

interface ConnectionsEditChooserModalProps {
    visible: boolean;
    isDark: boolean;
    onClose: () => void;
    onSelect: (target: ConnectionsEditTarget) => void;
}

const OPTIONS: {
    target: ConnectionsEditTarget;
    title: string;
    subtitle: string;
    renderIcon: (color: string) => React.ReactNode;
}[] = [
    {
        target: 'paidBy',
        title: 'Paid by',
        subtitle: 'Who put money in for this expense',
        renderIcon: (color) => (
            <Iconify icon="heroicons:banknotes" size={22} color={color} />
        ),
    },
    {
        target: 'items',
        title: 'Items',
        subtitle: 'What was bought (catalog lines)',
        renderIcon: (color) => (
            <Iconify icon="heroicons:shopping-bag" size={22} color={color} />
        ),
    },
    {
        target: 'assignItems',
        title: 'Assign items',
        subtitle: 'Who funded / who shares each item',
        renderIcon: (color) => (
            <Iconify icon="heroicons:link" size={22} color={color} />
        ),
    },
    {
        target: 'split',
        title: 'Split between',
        subtitle: 'Who owes a share of the total',
        renderIcon: (color) => (
            <Iconify icon="heroicons:user-group" size={22} color={color} />
        ),
    },
];

export function ConnectionsEditChooserModal({
    visible,
    isDark,
    onClose,
    onSelect,
}: ConnectionsEditChooserModalProps) {
    const colors = isDark ? COLORS.dark : COLORS.light;

    const handleSelect = (target: ConnectionsEditTarget) => {
        onSelect(target);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel="Dismiss" />

                <View className="w-full rounded-[32px] border border-border-input bg-bg-canvas p-6 shadow-2xl">
                    <View className="mb-5 items-center">
                        <View className="mb-3 rounded-full bg-accent-sky-bg p-3">
                            <Iconify
                                icon="heroicons:pencil-square"
                                size={28}
                                color={colors.accent.sky}
                            />
                        </View>
                        <AppText variant="h3" className="text-center font-bold text-text-primary">
                            Edit what?
                        </AppText>
                        <AppText
                            variant="body-small"
                            className="mt-1 text-center text-text-primary-lighter"
                        >
                            Choose a section to update
                        </AppText>
                    </View>

                    <View className="mb-5 gap-y-2">
                        {OPTIONS.map((option) => (
                            <Pressable
                                key={option.target}
                                onPress={() => handleSelect(option.target)}
                                accessibilityRole="button"
                                className="flex-row items-center rounded-2xl border border-border-input bg-bg-primary-lighter px-4 py-3.5 active:bg-accent-sky-bg"
                            >
                                <View
                                    className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                                    style={{ backgroundColor: isDark ? '#0C4A6E' : '#E0F2FE' }}
                                >
                                    {option.renderIcon(colors.accent.sky)}
                                </View>
                                <View className="flex-1 pr-2">
                                    <AppText
                                        variant="body-small"
                                        className="font-semibold text-text-primary"
                                    >
                                        {option.title}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5 text-text-primary-lighter"
                                    >
                                        {option.subtitle}
                                    </AppText>
                                </View>
                                <Iconify
                                    icon="heroicons:chevron-right"
                                    size={18}
                                    color={colors.icon.lighter}
                                />
                            </Pressable>
                        ))}
                    </View>

                    <AppButton variant="secondary" size="md" onPress={onClose}>
                        Cancel
                    </AppButton>
                </View>
            </View>
        </Modal>
    );
}
