import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {themeStore} from '@/src/store/themeStore';
import {getElevatedCardStyle} from '../styles/elevatedCard';
import {BudgetSectionHeader} from './BudgetSectionHeader';

type Props = {
    name: string;
    amountText: string;
    currencyCode: string;
    currencySymbol: string;
    onNameChange: (v: string) => void;
    onAmountChange: (v: string) => void;
};

export function BudgetEssentialsSection({
    name,
    amountText,
    currencyCode,
    currencySymbol,
    onNameChange,
    onAmountChange,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');

    return (
        <View>
            <BudgetSectionHeader
                title="Essentials"
                hint="Required"
                renderIcon={(c) => <Iconify icon="heroicons:bolt" size={18} color={c} />}
            />
            <View className="rounded-3xl border p-4" style={getElevatedCardStyle(isDark)}>
                <AppInput
                    label="Budget name"
                    placeholder="e.g. Groceries, Trip to Goa"
                    value={name}
                    onChangeText={onNameChange}
                    required
                />

                <View className="mt-4">
                    <View className="mb-2 flex-row items-center justify-between">
                        <AppText
                            variant="caption-xs"
                            className="font-semibold text-text-primary-lighter"
                        >
                            Spending cap
                        </AppText>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            {currencyCode} · your currency
                        </AppText>
                    </View>
                    <View className="flex-row items-end gap-2">
                        <View className="items-center pb-2">
                            <AppText variant="h2" className="font-bold text-text-primary">
                                {currencySymbol}
                            </AppText>
                        </View>
                        <View className="flex-1">
                            <AppInput
                                placeholder="0"
                                value={amountText}
                                onChangeText={onAmountChange}
                                keyboardType="decimal-pad"
                                required
                                renderRightIcon={
                                    amountText.trim().length > 0
                                        ? (c) => (
                                              <Pressable
                                                  onPress={() => onAmountChange('')}
                                                  hitSlop={10}
                                                  accessibilityRole="button"
                                                  accessibilityLabel="Clear amount"
                                                  className="active:opacity-70"
                                              >
                                                  <Iconify
                                                      icon="heroicons:x-circle"
                                                      size={20}
                                                      color={c}
                                                  />
                                              </Pressable>
                                          )
                                        : undefined
                                }
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
