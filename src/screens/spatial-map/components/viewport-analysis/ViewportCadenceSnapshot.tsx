import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {SectionLabel} from '../venue-details/SectionLabel';
import {SurfaceCard} from '../venue-details/SurfaceCard';

interface ViewportCadenceSnapshotProps {
    peakWeekdayLabel: string | null;
    lastVisitOn: string | null;
}

function formatVisitDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function ViewportCadenceSnapshot({
    peakWeekdayLabel,
    lastVisitOn,
}: ViewportCadenceSnapshotProps) {
    if (!peakWeekdayLabel && !lastVisitOn) return null;

    return (
        <View>
            <SectionLabel>When you spend here</SectionLabel>
            <SurfaceCard className="flex-row gap-x-4 p-4">
                {peakWeekdayLabel ? (
                    <View className="min-w-0 flex-1">
                        <AppText
                            variant="caption-xs"
                            className="mb-1 text-text-primary-lighter"
                        >
                            Peak day
                        </AppText>
                        <AppText
                            variant="body-base"
                            className="font-semibold text-text-primary"
                        >
                            {peakWeekdayLabel}
                        </AppText>
                    </View>
                ) : null}
                {lastVisitOn ? (
                    <View className="min-w-0 flex-1">
                        <AppText
                            variant="caption-xs"
                            className="mb-1 text-text-primary-lighter"
                        >
                            Last visit
                        </AppText>
                        <AppText
                            variant="body-base"
                            className="font-semibold text-text-primary"
                        >
                            {formatVisitDate(lastVisitOn)}
                        </AppText>
                    </View>
                ) : null}
            </SurfaceCard>
        </View>
    );
}
