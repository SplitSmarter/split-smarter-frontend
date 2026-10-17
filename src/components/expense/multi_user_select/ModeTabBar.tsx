import React, { memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { SplitMode } from "@/src/components/expense/MultiUserSelect";
import { COLORS } from '@/src/constants/colors';

interface ModeTabBarProps {
    splitMode: SplitMode;
    isDark: boolean;
    onChangeMode: (mode: SplitMode) => void;
}

const TABS: { mode: SplitMode; label: string; hint: string }[] = [
    { mode: 'equal', label: 'Equal', hint: 'Split evenly' },
    { mode: 'amount', label: 'Amount', hint: 'Enter ₹' },
    { mode: 'percentage', label: '%', hint: 'By percent' },
    { mode: 'shares', label: 'Shares', hint: 'By parts' },
];

const ModeTabBar = memo(({ splitMode, isDark, onChangeMode }: ModeTabBarProps) => {
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View
            style={[
                styles.bar,
                {
                    backgroundColor: colors.bg.lighter,
                    borderBottomColor: colors.status.border,
                },
            ]}
        >
            {TABS.map((tab) => {
                const isActive = splitMode === tab.mode;
                const activeColor = isActive ? colors.accent.sky : colors.icon.lighter;
                const labelColor = isActive ? colors.accent.sky : colors.text.lighter;

                return (
                    <Pressable
                        key={tab.mode}
                        onPress={() => onChangeMode(tab.mode)}
                        style={styles.tab}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={`${tab.label}: ${tab.hint}`}
                    >
                        {tab.mode === 'equal' ? (
                            <Iconify icon="heroicons:equals" size={20} color={activeColor} />
                        ) : null}
                        {tab.mode === 'amount' ? (
                            <Iconify icon="heroicons:currency-rupee" size={20} color={activeColor} />
                        ) : null}
                        {tab.mode === 'percentage' ? (
                            <Iconify icon="heroicons:variable" size={20} color={activeColor} />
                        ) : null}
                        {tab.mode === 'shares' ? (
                            <Iconify icon="heroicons:chart-pie" size={20} color={activeColor} />
                        ) : null}

                        <AppText
                            variant="caption-xs"
                            className={isActive ? 'font-bold' : 'font-medium'}
                            style={[styles.label, { color: labelColor }]}
                            numberOfLines={1}
                        >
                            {tab.label}
                        </AppText>

                        {isActive ? (
                            <View
                                style={[
                                    styles.activeUnderline,
                                    { backgroundColor: colors.accent.sky },
                                ]}
                            />
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
});

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        minHeight: 64,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        position: 'relative',
    },
    label: {
        marginTop: 4,
    },
    activeUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 12,
        right: 12,
        height: 3,
        borderTopLeftRadius: 999,
        borderTopRightRadius: 999,
    },
});

export default ModeTabBar;

ModeTabBar.displayName = 'ModeTabBar';
