import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';

export type AssignmentMode = 'paidBy' | 'split';

interface AssignmentModeToggleProps {
    mode: AssignmentMode;
    onChange: (mode: AssignmentMode) => void;
}

const TABS: { mode: AssignmentMode; label: string }[] = [
    { mode: 'paidBy', label: 'Paid by' },
    { mode: 'split', label: 'Split between' },
];

export function AssignmentModeToggle({ mode, onChange }: AssignmentModeToggleProps) {
    return (
        <View className="flex-row rounded-2xl border border-border-input bg-bg-primary p-1">
            {TABS.map((tab) => {
                const active = mode === tab.mode;
                return (
                    <Pressable
                        key={tab.mode}
                        onPress={() => onChange(tab.mode)}
                        className={`flex-1 items-center rounded-xl px-3 py-2.5 ${
                            active ? 'bg-accent-sky-bg' : ''
                        }`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                    >
                        <AppText
                            variant="body-small"
                            className={`font-semibold ${
                                active ? 'text-accent-sky' : 'text-text-primary-lighter'
                            }`}
                        >
                            {tab.label}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    );
}
