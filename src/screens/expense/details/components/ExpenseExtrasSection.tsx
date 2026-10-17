import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {ExpenseExtraFieldDetail} from '@/src/api/dto/expense/expense';
import {ExpenseExtraDetailType} from '@/src/api/dto/expense/constant';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface ExpenseExtrasSectionProps {
    description?: string | null;
    extras: ExpenseExtraFieldDetail[];
}

function formatExtra(extra: ExpenseExtraFieldDetail): string {
    const d = extra.details;
    if (!d) return extra.key;
    if (d.detail_type === ExpenseExtraDetailType.LIST) {
        return d.details?.join(', ') || d.description || extra.key;
    }
    if (d.detail_type === ExpenseExtraDetailType.TEXT) {
        return d.description || extra.key;
    }
    if (d.detail_type === ExpenseExtraDetailType.PLACE) {
        return d.description || `Place #${d.place_id}`;
    }
    return extra.key;
}

export function ExpenseExtrasSection({
    description,
    extras,
}: ExpenseExtrasSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const hasDescription = Boolean(description?.trim());
    if (!hasDescription && extras.length === 0) return null;

    const surface = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
        shadowColor: COLORS.light.brand.primary,
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4} as const,
        elevation: 3,
    };

    return (
        <View className="gap-y-6">
            {hasDescription ? (
                <View>
                    <AppText
                        variant="h4"
                        className="mb-3 font-bold"
                        style={{color: colors.text.primary}}
                    >
                        Notes
                    </AppText>
                    <View className="rounded-3xl border p-4" style={surface}>
                        <AppText
                            variant="body-small"
                            style={{color: colors.text.primary}}
                        >
                            {description}
                        </AppText>
                    </View>
                </View>
            ) : null}

            {extras.length > 0 ? (
                <View>
                    <AppText
                        variant="h4"
                        className="mb-3 font-bold"
                        style={{color: colors.text.primary}}
                    >
                        Extra details
                    </AppText>
                    <View className="overflow-hidden rounded-3xl border" style={surface}>
                        {extras.map((extra, i) => (
                            <View
                                key={`${extra.key}-${i}`}
                                className="px-4 py-3"
                                style={
                                    i === extras.length - 1
                                        ? undefined
                                        : {borderBottomWidth: 1, borderBottomColor: colors.status.border}
                                }
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold uppercase"
                                    style={{color: colors.text.lighter}}
                                >
                                    {extra.key}
                                </AppText>
                                <AppText
                                    variant="body-small"
                                    className="mt-0.5"
                                    style={{color: colors.text.primary}}
                                >
                                    {formatExtra(extra)}
                                </AppText>
                            </View>
                        ))}
                    </View>
                </View>
            ) : null}
        </View>
    );
}
