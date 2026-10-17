import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {PlaceSeriesPoint} from '@/src/api/dto/expense/place_analytics';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {VenueTrendMode} from './types';
import {SectionLabel} from './SectionLabel';
import {SurfaceCard} from './SurfaceCard';
import {PlaceTrendChart} from './PlaceTrendChart';

interface TrendSectionProps {
    points: PlaceSeriesPoint[];
    mode: VenueTrendMode;
    onModeChange: (mode: VenueTrendMode) => void;
}

export function TrendSection({points, mode, onModeChange}: TrendSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View>
            <SectionLabel
                icon={
                    <Iconify
                        icon="heroicons:arrow-trending-up"
                        size={13}
                        color={colors.icon.lighter}
                    />
                }
                trailing={
                    <View className="flex-row rounded-full bg-bg-primary p-1">
                        {(
                            [
                                {id: 'daily', label: 'Daily'},
                                {id: 'monthly', label: 'Monthly'},
                            ] as const
                        ).map((item) => {
                            const active = mode === item.id;
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => onModeChange(item.id)}
                                    className={`rounded-full px-3 py-1.5 ${
                                        active ? 'bg-bg-canvas' : ''
                                    }`}
                                    style={
                                        active
                                            ? {
                                                  shadowColor: COLORS.light.text.darker,
                                                  shadowOpacity: 0.08,
                                                  shadowRadius: 4,
                                                  shadowOffset: {width: 0, height: 1},
                                                  elevation: 2,
                                              }
                                            : undefined
                                    }
                                >
                                    <AppText
                                        variant="caption-xs"
                                        className={`font-semibold ${
                                            active
                                                ? 'text-text-primary'
                                                : 'text-text-primary-lighter'
                                        }`}
                                    >
                                        {item.label}
                                    </AppText>
                                </Pressable>
                            );
                        })}
                    </View>
                }
            >
                Spending trend
            </SectionLabel>

            <SurfaceCard>
                <PlaceTrendChart points={points} mode={mode} />
            </SurfaceCard>
        </View>
    );
}
