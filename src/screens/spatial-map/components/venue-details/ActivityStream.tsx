import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {PlaceActivityItem} from '@/src/api/dto/expense/place_analytics';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';
import {formatINR} from '../../utils/spatialMap.utils';
import {SectionLabel} from './SectionLabel';
import {SurfaceCard} from './SurfaceCard';

interface ActivityStreamProps {
    items: PlaceActivityItem[];
    onClose: () => void;
}

export function ActivityStream({items, onClose}: ActivityStreamProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const openExpense = (expenseId: number) => {
        onClose();
        setTimeout(() => {
            expenseDetailsSheetStore.getState().open(expenseId, {
                useDummy: true,
            });
        }, 200);
    };

    return (
        <View className="pb-1">
            <SectionLabel
                icon={
                    <Iconify
                        icon="heroicons:queue-list"
                        size={13}
                        color={colors.icon.lighter}
                    />
                }
                trailing={
                    items.length > 0 ? (
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            Tap to open
                        </AppText>
                    ) : null
                }
            >
                Activity
            </SectionLabel>

            {items.length === 0 ? (
                <SurfaceCard>
                    <View className="items-center px-4 py-8">
                        <AppText variant="body-small" className="text-text-primary-lighter">
                            No activity in this range
                        </AppText>
                    </View>
                </SurfaceCard>
            ) : (
                <SurfaceCard>
                    {items.map((item, index) => {
                        const isSplit = Math.abs(item.paid_inr - item.shared_inr) > 0.5;
                        const isLast = index === items.length - 1;
                        return (
                            <Pressable
                                key={item.expense_id}
                                onPress={() => openExpense(item.expense_id)}
                                accessibilityRole="button"
                                accessibilityLabel={`Open expense ${item.name}`}
                                className={`flex-row items-center justify-between px-4 py-4 active:opacity-80 ${
                                    isLast ? '' : 'border-b border-border-input'
                                }`}
                            >
                                <View className="min-w-0 flex-1 pr-3">
                                    <AppText
                                        variant="body-base"
                                        className="font-semibold text-text-primary"
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </AppText>
                                    <AppText
                                        variant="body-small"
                                        className="mt-1 text-text-primary-lighter"
                                    >
                                        {item.expense_date}
                                        {item.category_name ? ` · ${item.category_name}` : ''}
                                        {isSplit ? ' · Split' : ''}
                                    </AppText>
                                </View>
                                <View className="flex-row items-center gap-x-2">
                                    <AppText
                                        variant="body-base"
                                        className="font-bold text-text-primary"
                                    >
                                        {formatINR(item.shared_inr)}
                                    </AppText>
                                    <Iconify
                                        icon="heroicons:chevron-right"
                                        size={14}
                                        color={colors.icon.lighter}
                                    />
                                </View>
                            </Pressable>
                        );
                    })}
                </SurfaceCard>
            )}
        </View>
    );
}
