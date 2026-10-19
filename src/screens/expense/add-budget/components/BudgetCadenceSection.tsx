import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {BudgetCapMode} from '@/src/api/dto/expense/constant';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {getElevatedCardStyle} from '../styles/elevatedCard';
import {BudgetSectionHeader} from './BudgetSectionHeader';

type Props = {
    capMode: BudgetCapMode;
    onCapModeChange: (c: BudgetCapMode) => void;
};

export function BudgetCadenceSection({capMode, onCapModeChange}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const isHard = capMode === BudgetCapMode.HARD;

    return (
        <View>
            <BudgetSectionHeader
                title="Enforcement"
                renderIcon={(c) => (
                    <Iconify icon="heroicons:shield-check" size={18} color={c} />
                )}
            />
            <View className="rounded-3xl border p-4" style={getElevatedCardStyle(isDark)}>
                <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-2">
                            <AppText className="font-bold text-text-primary">
                                Cap strength
                            </AppText>
                            <View
                                className={`rounded-full px-2 py-0.5 ${
                                    isHard ? 'bg-red-decrease/10' : 'bg-accent-sky-bg'
                                }`}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className={`font-bold uppercase ${
                                        isHard ? 'text-red-decrease' : 'text-accent-sky'
                                    }`}
                                >
                                    {isHard ? 'Hard' : 'Soft'}
                                </AppText>
                            </View>
                        </View>
                        <AppText
                            variant="caption-xs"
                            className="mt-1 text-text-primary-lighter"
                        >
                            {isHard
                                ? 'Blocks spend past the cap'
                                : 'Warns near and at the cap'}
                        </AppText>
                    </View>
                    <Pressable
                        onPress={() =>
                            onCapModeChange(
                                isHard ? BudgetCapMode.SOFT : BudgetCapMode.HARD,
                            )
                        }
                        accessibilityRole="switch"
                        accessibilityState={{checked: isHard}}
                        className={`h-8 w-14 justify-center rounded-full p-1 ${
                            isHard
                                ? 'bg-red-decrease'
                                : 'border border-border-input bg-bg-primary'
                        }`}
                    >
                        <View
                            className={`h-6 w-6 rounded-full bg-bg-canvas ${
                                isHard ? 'self-end' : 'self-start'
                            }`}
                            style={{
                                shadowColor: '#000',
                                shadowOpacity: 0.15,
                                shadowRadius: 2,
                                shadowOffset: {width: 0, height: 1},
                                elevation: 2,
                            }}
                        />
                    </Pressable>
                </View>

                <View
                    className={`flex-row items-start gap-2.5 rounded-2xl border px-3 py-3 ${
                        isHard
                            ? 'border-red-decrease/20 bg-red-decrease/10'
                            : 'border-border-input bg-bg-primary'
                    }`}
                >
                    {isHard ? (
                        <Iconify
                            icon="heroicons:shield-exclamation"
                            size={16}
                            color={colors.status.decrease}
                        />
                    ) : (
                        <Iconify
                            icon="heroicons:shield-check"
                            size={16}
                            color={colors.accent.sky}
                        />
                    )}
                    <AppText
                        variant="caption-xs"
                        className={`flex-1 ${
                            isHard ? 'text-red-decrease' : 'text-text-primary-lighter'
                        }`}
                    >
                        {isHard
                            ? 'Hard mode rejects transactions that would exceed this budget.'
                            : 'Soft mode alerts you around 80% and 100% — spending still goes through.'}
                    </AppText>
                </View>
            </View>
        </View>
    );
}
