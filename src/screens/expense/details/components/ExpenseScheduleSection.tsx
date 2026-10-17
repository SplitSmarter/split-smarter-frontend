import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {ScheduledBlueprintDetail} from '@/src/api/dto/expense/expense';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

interface ExpenseScheduleSectionProps {
    blueprint: ScheduledBlueprintDetail;
}

export function ExpenseScheduleSection({blueprint}: ExpenseScheduleSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const last = blueprint.last_expenses ?? [];

    return (
        <View>
            <AppText
                variant="h4"
                className="mb-3 font-bold"
                style={{color: colors.text.primary}}
            >
                Schedule
            </AppText>
            <View
                className="rounded-3xl border p-4"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                    shadowColor: COLORS.light.brand.primary,
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 12,
                    shadowOffset: {width: 0, height: 4},
                    elevation: 3,
                }}
            >
                <AppText
                    variant="body-base"
                    className="font-semibold"
                    style={{color: colors.text.primary}}
                >
                    {blueprint.recurring_period}
                    {blueprint.is_active ? ' · Active' : ' · Paused'}
                </AppText>
                <AppText
                    variant="caption-xs"
                    className="mt-1"
                    style={{color: colors.text.lighter}}
                >
                    {[
                        blueprint.start_date
                            ? `From ${String(blueprint.start_date).slice(0, 10)}`
                            : null,
                        blueprint.next_run_date
                            ? `Next ${String(blueprint.next_run_date).slice(0, 10)}`
                            : null,
                        `Every ${blueprint.interval}`,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </AppText>

                {last.length > 0 ? (
                    <View
                        className="mt-3 border-t pt-3"
                        style={{borderTopColor: colors.status.border}}
                    >
                        <AppText
                            variant="caption-xs"
                            className="mb-2 font-semibold"
                            style={{color: colors.text.lighter}}
                        >
                            Recent runs
                        </AppText>
                        {last.slice(0, 5).map((e) => (
                            <View
                                key={e.id}
                                className="mb-2 flex-row items-center justify-between"
                            >
                                <AppText
                                    variant="body-small"
                                    className="min-w-0 flex-1"
                                    style={{color: colors.text.primary}}
                                    numberOfLines={1}
                                >
                                    {e.name}
                                </AppText>
                                <AppText
                                    variant="body-small"
                                    className="ml-2 font-semibold"
                                    style={{color: colors.text.primary}}
                                >
                                    {formatExpenseMoney(e.total_amount, e.currency)}
                                </AppText>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
        </View>
    );
}
