import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Dimensions, LayoutChangeEvent} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {PlaceSeriesPoint} from '@/src/api/dto/expense/place_analytics';
import {formatINR} from '../../utils/spatialMap.utils';
import type {VenueTrendMode} from './types';
import {seriesPeriodLabel} from './utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

/** Same sky/platinum line treatment as dashboard AnalyticsChart (on canvas). */
const VENUE_CHART = {
    light: {
        line: COLORS.light.accent.sky,
        fillStart: 'rgba(2, 132, 199, 0.28)',
        fillEnd: 'rgba(2, 132, 199, 0.0)',
        pointerBorder: COLORS.light.accent.sky,
        label: COLORS.light.text.lighter,
        rail: 'rgba(2, 132, 199, 0.12)',
    },
    dark: {
        line: COLORS.dark.accent.sky,
        fillStart: 'rgba(56, 189, 248, 0.32)',
        fillEnd: 'rgba(56, 189, 248, 0.0)',
        pointerBorder: COLORS.dark.accent.sky,
        label: COLORS.dark.text.lighter,
        rail: 'rgba(56, 189, 248, 0.18)',
    },
} as const;

type ChartPoint = {
    id: string;
    value: number;
    label: string;
    date: string;
    dataIndex: number;
};

function defaultIndex(length: number): number {
    if (length <= 0) return -1;
    return Math.min(2, length - 1);
}

/**
 * gifted-charts x-labels use left = spacing*i - spacing/2 inside a container
 * with paddingLeft = initialSpacing. Edge labels stay visible only when
 * initialSpacing/endSpacing >= spacing/2  ⇒  edge >= width / (2 * n).
 */
function chartLayout(chartWidth: number, pointCount: number) {
    const n = Math.max(pointCount, 1);
    const edge = Math.max(28, Math.ceil(chartWidth / (2 * n)));
    // Single point: give a non-zero spacing so the library still lays out a plot box.
    const spacing =
        pointCount > 1 ? (chartWidth - edge * 2) / (pointCount - 1) : Math.max(48, edge);
    return {edge, spacing};
}

function toChartPoints(
    points: PlaceSeriesPoint[],
    mode: VenueTrendMode
): ChartPoint[] {
    return points.map((p, dataIndex) => ({
        id: p.period_start,
        value: p.shared_inr,
        label: seriesPeriodLabel(p, mode),
        date: `${p.period_start} – ${p.period_end}`,
        dataIndex,
    }));
}

interface PlaceTrendChartProps {
    points: PlaceSeriesPoint[];
    mode: VenueTrendMode;
}

function SinglePointTrend({
    point,
    lineColor,
    railColor,
    pointerBorder,
}: {
    point: ChartPoint;
    lineColor: string;
    railColor: string;
    pointerBorder: string;
}) {
    return (
        <View className="w-full items-center px-2 pb-3 pt-3">
            <View className="z-10 mb-3 self-center rounded-2xl border border-border-input bg-bg-primary px-3 py-1.5">
                <View className="flex-row items-center justify-between gap-3">
                    <AppText variant="caption-xs" className="font-extrabold text-text-primary">
                        {formatINR(point.value)}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="font-semibold text-text-primary-lighter"
                    >
                        {point.label}
                    </AppText>
                </View>
            </View>

            <View className="h-[96px] w-full items-center justify-center">
                <View
                    className="absolute left-6 right-6 h-1.5 rounded-full"
                    style={{backgroundColor: railColor, top: '52%'}}
                />
                <View
                    className="h-4 w-4 rounded-full border-2 bg-bg-primary-lighter shadow-md"
                    style={{borderColor: pointerBorder, backgroundColor: lineColor}}
                />
            </View>

            <AppText
                variant="caption-xs"
                className="mt-1 font-semibold text-text-primary-lighter"
            >
                {point.label}
            </AppText>
        </View>
    );
}

export function PlaceTrendChart({points, mode}: PlaceTrendChartProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const chartColors = isDark ? VENUE_CHART.dark : VENUE_CHART.light;
    const data = useMemo(() => toChartPoints(points, mode), [points, mode]);
    const hasPointer = data.length >= 2;
    const activeIdRef = useRef<string | null>(null);
    const [chartWidth, setChartWidth] = useState(SCREEN_WIDTH - 88);

    const [activePoint, setActivePoint] = useState<ChartPoint | null>(
        () => data[defaultIndex(data.length)] ?? null
    );

    useEffect(() => {
        const next = data[defaultIndex(data.length)] ?? null;
        setActivePoint(next);
        activeIdRef.current = next?.id ?? null;
    }, [data]);

    const selectPoint = (point: ChartPoint | null) => {
        if (!point) return;
        if (activeIdRef.current === point.id) return;
        activeIdRef.current = point.id;
        setActivePoint(point);
    };

    const initialPointerIndex = Math.max(0, defaultIndex(data.length));
    const {edge, spacing} = useMemo(
        () => chartLayout(chartWidth, data.length),
        [chartWidth, data.length]
    );

    const onChartLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - chartWidth) > 1) {
            setChartWidth(w);
        }
    };

    const pointerConfig = useMemo(() => {
        if (!hasPointer) return undefined;
        return {
            pointerStripUptoDataPoint: true,
            pointerStripColor: isDark ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.35)',
            pointerStripWidth: 1.5,
            strokeDashArray: [4, 4],
            pointerColor: COLORS.light.bg.lighter,
            radius: 5,
            pointerVanishDelay: 0,
            persistPointer: true,
            initialPointerIndex,
            pointerLabelWidth: 0,
            pointerLabelHeight: 0,
            pointerLabelComponent: () => null,
            pointerComponent: () => (
                <View
                    className="h-4 w-4 rounded-full border-2 bg-bg-primary-lighter shadow-md"
                    style={{borderColor: chartColors.pointerBorder}}
                />
            ),
        };
    }, [hasPointer, initialPointerIndex, chartColors.pointerBorder, isDark]);

    if (data.length === 0) {
        return (
            <View className="items-center px-4 py-10">
                <AppText variant="body-small" className="text-text-primary-lighter">
                    No trend data in this range
                </AppText>
            </View>
        );
    }

    // LineChart with one point often collapses (spacing=0 / no segment). Use a centered marker.
    if (data.length === 1) {
        return (
            <SinglePointTrend
                point={data[0]}
                lineColor={chartColors.line}
                railColor={chartColors.rail}
                pointerBorder={chartColors.pointerBorder}
            />
        );
    }

    return (
        <View className="w-full px-2 pb-2 pt-3" onLayout={onChartLayout}>
            {activePoint ? (
                <View className="z-10 mb-1 self-center rounded-2xl border border-border-input bg-bg-primary px-3 py-1.5">
                    <View className="flex-row items-center justify-between gap-3">
                        <AppText variant="caption-xs" className="font-extrabold text-text-primary">
                            {formatINR(activePoint.value)}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="font-semibold text-text-primary-lighter"
                        >
                            {activePoint.label}
                        </AppText>
                    </View>
                </View>
            ) : null}

            <View style={{marginTop: activePoint ? -2 : 0}}>
                <LineChart
                    key={`venue-trend-${isDark ? 'd' : 'l'}-${mode}-${chartWidth}-${data.map((d) => d.id).join('-')}`}
                    data={data}
                    areaChart
                    curved={data.length >= 3}
                    height={112}
                    width={chartWidth}
                    parentWidth={chartWidth}
                    disableScroll
                    initialSpacing={edge}
                    endSpacing={edge}
                    spacing={spacing}
                    yAxisLabelWidth={0}
                    color={chartColors.line}
                    thickness={3}
                    startFillColor={chartColors.fillStart}
                    endFillColor={chartColors.fillEnd}
                    startOpacity={0.4}
                    endOpacity={0.0}
                    hideYAxisText
                    hideRules
                    hideAxesAndRules
                    overflowTop={0}
                    xAxisLabelTextStyle={{
                        color: chartColors.label,
                        fontSize: 10,
                        fontWeight: '600',
                        textAlign: 'center',
                    }}
                    pointerConfig={pointerConfig}
                    getPointerProps={(props: {pointerIndex?: number}) => {
                        const idx = props?.pointerIndex;
                        if (typeof idx !== 'number' || idx < 0 || idx >= data.length) return;
                        const point = data[idx];
                        if (!point || activeIdRef.current === point.id) return;
                        queueMicrotask(() => selectPoint(point));
                    }}
                    onPress={(
                        item:
                            | {dataIndex?: number; id?: string; label?: string; value?: number}
                            | Array<{dataIndex?: number}>
                    ) => {
                        if (!item) return;
                        const dataObj = Array.isArray(item) ? item[0] : item;
                        if (!dataObj) return;

                        if (typeof dataObj.dataIndex === 'number' && data[dataObj.dataIndex]) {
                            selectPoint(data[dataObj.dataIndex]);
                            return;
                        }
                        const byId =
                            dataObj.id != null
                                ? data.find((d) => d.id === String(dataObj.id))
                                : undefined;
                        if (byId) {
                            selectPoint(byId);
                            return;
                        }
                        const byLabel = data.find(
                            (d) => d.label === dataObj.label && d.value === dataObj.value
                        );
                        if (byLabel) selectPoint(byLabel);
                    }}
                />
            </View>
        </View>
    );
}
