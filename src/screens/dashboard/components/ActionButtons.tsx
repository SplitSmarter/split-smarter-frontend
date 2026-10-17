import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

interface ActionButtonsProps {
    onDepositPress?: () => void;
    onSwitchPress?: () => void;
    onWithdrawPress?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onDepositPress,
    onSwitchPress,
    onWithdrawPress,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const ctaStyle = {
        backgroundColor: colors.brand.primary,
        borderColor: isDark ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.25)',
    };
    const labelColor = colors.text.contrast;

    return (
        <View className="z-10 mb-6 -mt-5 flex-row items-center justify-between px-5">
            <Pressable
                onPress={onDepositPress}
                style={ctaStyle}
                className="mr-2 flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3.5 shadow-xl active:opacity-90"
            >
                <Iconify icon="heroicons:arrow-up-right" size={18} color={labelColor} />
                <AppText variant="body-small" className="ml-2 font-bold" style={{color: labelColor}}>
                    Transfer
                </AppText>
            </Pressable>

            <Pressable
                onPress={onSwitchPress}
                accessibilityLabel="Convert"
                style={ctaStyle}
                className="mr-2 h-12 w-12 items-center justify-center rounded-2xl border shadow-xl active:opacity-90"
            >
                <Iconify icon="octicon:arrow-switch-16" size={18} color={labelColor} />
            </Pressable>

            <Pressable
                onPress={onWithdrawPress}
                style={ctaStyle}
                className="flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3.5 shadow-xl active:opacity-90"
            >
                <Iconify icon="heroicons:arrow-down-left" size={18} color={labelColor} />
                <AppText variant="body-small" className="ml-2 font-bold" style={{color: labelColor}}>
                    Settle
                </AppText>
            </Pressable>
        </View>
    );
};
