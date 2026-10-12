import React, {useCallback, useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {DateData} from 'react-native-calendars';

const CELL_H = 40;
const ENDPOINT = 34;

export type DateRangeDayMarking = {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    /** Continuous in-range track behind endpoints */
    rangeFill?: string;
    disabled?: boolean;
};

type DateRangeDayProps = {
    date?: DateData;
    state?: '' | 'disabled' | 'inactive' | 'today' | 'selected';
    marking?: DateRangeDayMarking;
    onPress?: (date?: DateData) => void;
    children?: React.ReactNode;
    theme?: {
        dayTextColor?: string;
        textDisabledColor?: string;
        todayTextColor?: string;
        todayRingColor?: string;
    };
};

/**
 * Continuous pill-style range day for react-native-calendars.
 * Middles fill edge-to-edge; start/end keep solid endpoints on the same track.
 */
export const DateRangeDay: React.FC<DateRangeDayProps> = React.memo(({
    date,
    state,
    marking,
    onPress,
    children,
    theme,
}) => {
    const isDisabled = state === 'disabled' || marking?.disabled;
    const isToday = state === 'today';
    const isStart = Boolean(marking?.startingDay);
    const isEnd = Boolean(marking?.endingDay);
    const inRange = Boolean(marking?.color || marking?.rangeFill);
    const isEndpoint = isStart || isEnd;
    const isSingle = isStart && isEnd;

    const trackColor = marking?.rangeFill ?? marking?.color;
    const endpointColor = marking?.color;
    const dayNumber = String(children ?? date?.day ?? '');

    const textColor = useMemo(() => {
        if (marking?.textColor) return marking.textColor;
        if (isDisabled) return theme?.textDisabledColor ?? '#A1A1AA';
        if (isToday) return theme?.todayTextColor ?? theme?.dayTextColor ?? '#2B2B2B';
        return theme?.dayTextColor ?? '#2B2B2B';
    }, [marking?.textColor, isDisabled, isToday, theme]);

    const handlePress = useCallback(() => {
        if (!isDisabled) onPress?.(date);
    }, [isDisabled, onPress, date]);

    return (
        <Pressable
            onPress={handlePress}
            disabled={isDisabled}
            accessibilityRole="button"
            style={styles.pressable}
        >
            <View style={styles.cell}>
                {/* Continuous range track */}
                {inRange && trackColor && !isSingle && (
                    <View style={styles.trackRow} pointerEvents="none">
                        {isStart && !isEnd && (
                            <>
                                <View style={styles.trackSpacer} />
                                <View style={[styles.trackSegment, {backgroundColor: trackColor}]} />
                            </>
                        )}
                        {isEnd && !isStart && (
                            <>
                                <View style={[styles.trackSegment, {backgroundColor: trackColor}]} />
                                <View style={styles.trackSpacer} />
                            </>
                        )}
                        {!isStart && !isEnd && (
                            <View style={[styles.trackFull, {backgroundColor: trackColor}]} />
                        )}
                    </View>
                )}

                {/* Solid endpoint pill */}
                {isEndpoint && endpointColor && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.endpoint,
                            {
                                backgroundColor: endpointColor,
                                borderRadius: 10,
                            },
                        ]}
                    />
                )}

                {/* Today ring when not an endpoint */}
                {isToday && !isEndpoint && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.todayRing,
                            {borderColor: theme?.todayRingColor ?? '#E07A2F'},
                        ]}
                    />
                )}

                <Text
                    allowFontScaling={false}
                    style={[
                        styles.label,
                        {
                            color: textColor,
                            fontWeight: isEndpoint || isToday ? '700' : '500',
                            opacity: isDisabled ? 0.35 : 1,
                        },
                    ]}
                >
                    {dayNumber}
                </Text>
            </View>
        </Pressable>
    );
});

DateRangeDay.displayName = 'DateRangeDay';

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
        alignSelf: 'stretch',
    },
    cell: {
        height: CELL_H,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackRow: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
    },
    trackFull: {
        flex: 1,
        height: ENDPOINT,
    },
    trackSegment: {
        flex: 1,
        height: ENDPOINT,
    },
    trackSpacer: {
        flex: 1,
    },
    endpoint: {
        position: 'absolute',
        width: ENDPOINT,
        height: ENDPOINT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayRing: {
        position: 'absolute',
        width: ENDPOINT,
        height: ENDPOINT,
        borderRadius: 10,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 14,
        zIndex: 2,
    },
});
