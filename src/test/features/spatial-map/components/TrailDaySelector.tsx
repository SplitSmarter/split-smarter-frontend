import React from 'react';
import {ScrollView, Pressable, StyleSheet, View} from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { MONTH_FILTERS } from '@/src/screens/test/spatial-map/dummyExpenseMapData';
import { DisplayView } from '@/src/test/features/spatial-map/types/spatialMap.types';
import { formatTrailDay } from '@/src/test/features/spatial-map/utils/spatialMap.utils';

interface TrailDaySelectorProps {
    insetsBottom: number;
    mapMode: DisplayView;
    days: Array<{ date: string }>;
    trailDate: string | null;
    onSelectTrailDate: (date: string) => void;
    monthId: string;
    onSelectMonth: (monthId: string) => void;
}

export function TrailDaySelector({
                                     insetsBottom,
                                     mapMode,
                                     days,
                                     trailDate,
                                     onSelectTrailDate,
                                     monthId,
                                     onSelectMonth,
                                 }: TrailDaySelectorProps) {
    return (
        <View className="absolute left-0 right-0" style={{ bottom: insetsBottom + 8 }} pointerEvents="box-none">
            {mapMode === 'trail' && days.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                    className="mb-2"
                >
                    {days.map((d) => (
                        <Pressable
                            key={d.date}
                            onPress={() => onSelectTrailDate(d.date)}
                            className={`px-3 py-1.5 rounded-full mr-2 ${
                                trailDate === d.date ? 'bg-[#2D8A5B]' : 'bg-black/75'
                            }`}
                        >
                            <AppText variant="body-xs" className="text-white font-semibold">
                                {formatTrailDay(d.date)}
                            </AppText>
                        </Pressable>
                    ))}
                </ScrollView>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
            >
                {MONTH_FILTERS.map((m) => (
                    <Pressable
                        key={m.id}
                        onPress={() => onSelectMonth(m.id)}
                        className={`px-3 py-1.5 rounded-full mr-2 ${
                            monthId === m.id ? 'bg-[#2D8A5B]' : 'bg-black/75'
                        }`}
                    >
                        <AppText variant="body-xs" className="text-white font-semibold">
                            {m.label}
                        </AppText>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    chipRow: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
    },
});