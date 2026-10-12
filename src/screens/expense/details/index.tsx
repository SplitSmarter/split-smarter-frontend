import React from 'react';
import {View, Pressable} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

/**
 * Placeholder expense details screen.
 * Route: /(authenticated)/expense/details?id={expenseId}
 * Later: fetch full expense by id and replace this shell.
 */
export const ExpenseDetailsScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{id?: string}>();
    const expenseId = params.id ? String(params.id) : undefined;
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <ScreenWrapper
            backgroundColor={isDark ? colors.bg.canvas : colors.bg.primary}
            statusBarStyle={isDark ? 'light-content' : 'dark-content'}
            withPadding={false}
        >
            <View
                className="flex-row items-center justify-between border-b px-4 pb-3 pt-2"
                style={{borderBottomColor: colors.status.border}}
            >
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={12}
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{backgroundColor: colors.bg.overlay}}
                >
                    <Iconify
                        icon="heroicons:chevron-left"
                        size={22}
                        color={colors.icon.primary}
                    />
                </Pressable>
                <AppText
                    className="text-[17px] font-bold"
                    style={{color: colors.text.primary}}
                >
                    Expense details
                </AppText>
                <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center px-8">
                <View
                    className="mb-4 h-16 w-16 items-center justify-center rounded-full"
                    style={{backgroundColor: colors.bg.overlay}}
                >
                    <Iconify
                        icon="heroicons:document-text"
                        size={28}
                        color={colors.icon.lighter}
                    />
                </View>
                <AppText
                    className="text-center text-base font-bold"
                    style={{color: colors.text.primary}}
                >
                    Details coming soon
                </AppText>
                <AppText
                    className="mt-2 text-center text-sm"
                    style={{color: colors.text.lighter}}
                >
                    We’ll load the full expense here using its id.
                </AppText>
                {expenseId ? (
                    <View
                        className="mt-5 rounded-2xl border px-4 py-3"
                        style={{
                            backgroundColor: colors.bg.overlay,
                            borderColor: colors.status.border,
                        }}
                    >
                        <AppText
                            className="text-center text-[11px] font-semibold uppercase tracking-wider"
                            style={{color: colors.text.lighter}}
                        >
                            Expense id
                        </AppText>
                        <AppText
                            className="mt-1 text-center text-sm font-bold"
                            style={{color: colors.text.primary}}
                        >
                            {expenseId}
                        </AppText>
                    </View>
                ) : (
                    <AppText
                        className="mt-4 text-center text-xs"
                        style={{color: colors.status.error}}
                    >
                        Missing expense id in route
                    </AppText>
                )}
            </View>
        </ScreenWrapper>
    );
};

export default ExpenseDetailsScreen;
