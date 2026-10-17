import React from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {PlaceAnalyticsBundle} from '@/src/api/dto/expense/place_analytics';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {WEEKDAY_LABELS} from './constants';
import {SectionLabel} from './SectionLabel';
import {SurfaceCard} from './SurfaceCard';

interface CadenceSectionProps {
    analytics: PlaceAnalyticsBundle;
}

export function CadenceSection({analytics}: CadenceSectionProps) {
    const c = analytics.cadence;
    if (!c) return null;

    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const topWd = [...(c.by_weekday ?? [])].sort((a, b) => b.visit_count - a.visit_count)[0];

    return (
        <View>
            <SectionLabel
                icon={
                    <Iconify icon="heroicons:clock" size={13} color={colors.icon.lighter} />
                }
            >
                Cadence
            </SectionLabel>
            <View className="flex-row gap-3">
                <SurfaceCard className="min-w-0 flex-1">
                    <View className="gap-y-2 px-4 py-4">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-bg-primary">
                            <Iconify
                                icon="heroicons:calendar-days"
                                size={16}
                                color={colors.icon.primary}
                            />
                        </View>
                        <AppText
                            variant="caption-xs"
                            className="font-medium uppercase tracking-wide text-text-primary-lighter"
                        >
                            Last visit
                        </AppText>
                        <AppText variant="body-base" className="font-bold text-text-primary">
                            {c.days_since_last_visit != null
                                ? `${c.days_since_last_visit}d ago`
                                : '—'}
                        </AppText>
                        {c.last_visit_on ? (
                            <AppText variant="caption-xs" className="text-text-primary-lighter">
                                {c.last_visit_on}
                            </AppText>
                        ) : null}
                    </View>
                </SurfaceCard>
                <SurfaceCard className="min-w-0 flex-1">
                    <View className="gap-y-2 px-4 py-4">
                        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-accent-sky-bg">
                            <Iconify
                                icon="heroicons:bolt"
                                size={16}
                                color={colors.accent.sky}
                            />
                        </View>
                        <AppText
                            variant="caption-xs"
                            className="font-medium uppercase tracking-wide text-text-primary-lighter"
                        >
                            Peak day
                        </AppText>
                        <AppText variant="body-base" className="font-bold text-text-primary">
                            {topWd ? WEEKDAY_LABELS[topWd.weekday] ?? '—' : '—'}
                        </AppText>
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            {topWd
                                ? `${topWd.visit_count} visit${topWd.visit_count === 1 ? '' : 's'}`
                                : 'No peak yet'}
                        </AppText>
                    </View>
                </SurfaceCard>
            </View>
        </View>
    );
}
