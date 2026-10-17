import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {formatINR} from '../../utils/spatialMap.utils';
import type {ViewportAnalysisViewModel} from '../../utils/viewportAnalytics';
import {SurfaceCard} from '../venue-details/SurfaceCard';

interface ViewportAnalysisHeroProps {
    analysis: ViewportAnalysisViewModel;
}

export function ViewportAnalysisHero({analysis}: ViewportAnalysisHeroProps) {
    const pct =
        analysis.shareOfRange > 0
            ? `${(analysis.shareOfRange * 100).toFixed(0)}% of filtered range`
            : null;

    return (
        <SurfaceCard className="gap-y-2 p-4">
            <AppText variant="h2" className="font-bold text-text-primary">
                {formatINR(analysis.sharedInr)}
            </AppText>
            <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                <AppText variant="body-small" className="text-text-primary-lighter">
                    {analysis.placeCount}{' '}
                    {analysis.placeCount === 1 ? 'place' : 'places'} in view
                </AppText>
                {pct ? (
                    <>
                        <AppText
                            variant="body-small"
                            className="text-text-primary-lighter"
                        >
                            ·
                        </AppText>
                        <AppText
                            variant="body-small"
                            className="font-medium text-accent-sky"
                        >
                            {pct}
                        </AppText>
                    </>
                ) : null}
            </View>
            {analysis.netInr !== 0 ? (
                <AppText variant="body-xs" className="text-text-primary-lighter">
                    Net {analysis.netInr >= 0 ? '+' : ''}
                    {formatINR(analysis.netInr)} (paid − share)
                </AppText>
            ) : null}
        </SurfaceCard>
    );
}
