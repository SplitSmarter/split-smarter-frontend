import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

type Props = {
    title: string;
    hint?: string;
    renderIcon?: (color: string) => React.ReactNode;
};

/** Dashboard-style section title (h4) used above form cards. */
export function BudgetSectionHeader({title, hint, renderIcon}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
                {renderIcon ? renderIcon(colors.icon.primary) : null}
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    {title}
                </AppText>
            </View>
            {hint ? (
                <AppText
                    variant="body-small"
                    className="font-semibold"
                    style={{color: colors.text.lighter}}
                >
                    {hint}
                </AppText>
            ) : null}
        </View>
    );
}
