import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';

export type SplitSelectType = 'split' | 'paidBy';

interface TypeToggleBarProps {
    activeType: SplitSelectType;
    isDark: boolean;
    onChangeType: (type: SplitSelectType) => void;
}

const TABS: { type: SplitSelectType; label: string }[] = [
    { type: 'paidBy', label: 'Paid By' },
    { type: 'split', label: 'Split Between' },
];

const TypeToggleBar = memo(({ activeType, isDark, onChangeType }: TypeToggleBarProps) => {
    const trackBg = isDark ? '#1F2937' : '#E2E8F0';
    const activeBg = isDark ? '#374151' : '#FFFFFF';
    const activeText = isDark ? '#F9FAFB' : '#0F172A';
    const inactiveText = isDark ? '#9CA3AF' : '#64748B';

    return (
        <View className="px-4 pt-3 pb-2">
            <View
                className="flex-row p-1.5 rounded-[20px]"
                style={{ backgroundColor: trackBg }}
            >
                {TABS.map(tab => {
                    const isActive = activeType === tab.type;
                    return (
                        <Pressable
                            key={tab.type}
                            onPress={() => onChangeType(tab.type)}
                            className={`flex-1 py-3.5 items-center rounded-2xl ${isActive ? 'elevation-2' : ''}`}
                            style={
                                isActive
                                    ? {
                                          backgroundColor: activeBg,
                                          shadowColor: '#000',
                                          shadowOffset: { width: 0, height: 2 },
                                          shadowOpacity: 0.1,
                                          shadowRadius: 4,
                                      }
                                    : undefined
                            }
                        >
                            <AppText
                                className={`text-base ${isActive ? 'font-bold' : 'font-medium'}`}
                                style={{ color: isActive ? activeText : inactiveText }}
                            >
                                {tab.label}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});

TypeToggleBar.displayName = 'TypeToggleBar';

export default TypeToggleBar;
