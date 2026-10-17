import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';

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
    const colors = isDark ? COLORS.dark : COLORS.light;
    const trackBg = colors.bg.darker;
    const activeBg = colors.bg.lighter;
    const activeText = colors.text.primary;
    const inactiveText = colors.text.lighter;

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
                                          shadowColor: colors.text.darker,
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
