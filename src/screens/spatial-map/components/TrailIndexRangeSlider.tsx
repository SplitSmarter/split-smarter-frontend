import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {LayoutChangeEvent, PanResponder, Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {DisplayView} from '../types/spatialMap.types';

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;
const HIT_SLOP = 12;

interface TrailIndexRangeSliderProps {
    insetsBottom: number;
    mapMode: DisplayView;
    count: number;
    minIndex: number;
    maxIndex: number;
    /** Fired when the user finishes sliding (release), not while dragging. */
    onChangeRange: (min: number, max: number) => void;
    /** Opens the filtered trail stop list for the committed range. */
    onOpenList?: () => void;
    /** Stops in the committed [min, max] range — shown on the List control. */
    listCount?: number;
}

function clamp(n: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, n));
}

function xToIndex(x: number, trackWidth: number, count: number): number {
    if (count <= 1 || trackWidth <= 0) return 1;
    const ratio = clamp(x / trackWidth, 0, 1);
    return Math.round(1 + ratio * (count - 1));
}

function indexToX(index: number, trackWidth: number, count: number): number {
    if (count <= 1 || trackWidth <= 0) return 0;
    return ((index - 1) / (count - 1)) * trackWidth;
}

export function TrailIndexRangeSlider({
    insetsBottom,
    mapMode,
    count,
    minIndex,
    maxIndex,
    onChangeRange,
    onOpenList,
    listCount,
}: TrailIndexRangeSliderProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const [trackWidth, setTrackWidth] = useState(0);
    /** Live UI while dragging; map commits only on release. */
    const [draft, setDraft] = useState({min: minIndex, max: maxIndex});
    const stopsInRange =
        listCount ?? Math.max(0, draft.max - draft.min + 1);

    const trackRef = useRef<View>(null);
    const trackWidthRef = useRef(0);
    /** Screen X of the track — use with pageX/moveX (locationX jumps on re-render). */
    const trackOriginXRef = useRef(0);
    const countRef = useRef(count);
    const draftRef = useRef({min: minIndex, max: maxIndex});
    const draggingRef = useRef(false);
    const activeThumbRef = useRef<'min' | 'max' | null>(null);
    const onChangeRangeRef = useRef(onChangeRange);

    countRef.current = count;
    onChangeRangeRef.current = onChangeRange;

    const refreshTrackWindow = useCallback(() => {
        trackRef.current?.measureInWindow((x, _y, width) => {
            trackOriginXRef.current = x;
            if (width > 0) {
                trackWidthRef.current = width;
            }
        });
    }, []);

    useEffect(() => {
        if (draggingRef.current) return;
        const next = {min: minIndex, max: maxIndex};
        draftRef.current = next;
        setDraft(next);
    }, [minIndex, maxIndex]);

    const applyDraftIfChanged = useCallback((min: number, max: number) => {
        const prev = draftRef.current;
        if (prev.min === min && prev.max === max) return;
        const next = {min, max};
        draftRef.current = next;
        setDraft(next);
    }, []);

    const updateFromPageX = useCallback(
        (pageX: number) => {
            const thumb = activeThumbRef.current;
            if (!thumb) return;
            const w = trackWidthRef.current;
            const c = countRef.current;
            if (w <= 0 || c < 1) return;

            const localX = pageX - trackOriginXRef.current;
            const next = xToIndex(localX, w, c);
            const {min, max} = draftRef.current;

            if (thumb === 'min') {
                applyDraftIfChanged(clamp(next, 1, max), max);
            } else {
                applyDraftIfChanged(min, clamp(next, min, c));
            }
        },
        [applyDraftIfChanged]
    );

    const commitDraft = useCallback(() => {
        const {min, max} = draftRef.current;
        draggingRef.current = false;
        activeThumbRef.current = null;
        onChangeRangeRef.current(min, max);
    }, []);

    const onTrackLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const w = e.nativeEvent.layout.width;
            trackWidthRef.current = w;
            setTrackWidth(w);
            refreshTrackWindow();
        },
        [refreshTrackWindow]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => countRef.current > 1,
                onMoveShouldSetPanResponder: () => countRef.current > 1,
                onPanResponderTerminationRequest: () => false,
                onPanResponderGrant: (evt) => {
                    draggingRef.current = true;
                    refreshTrackWindow();

                    const pageX = evt.nativeEvent.pageX;
                    const w = trackWidthRef.current;
                    const c = countRef.current;
                    const localX = pageX - trackOriginXRef.current;
                    const {min, max} = draftRef.current;
                    const minPos = indexToX(min, w, c);
                    const maxPos = indexToX(max, w, c);
                    // Pick nearest thumb only — do not jump value on press.
                    activeThumbRef.current =
                        Math.abs(localX - minPos) <= Math.abs(localX - maxPos)
                            ? 'min'
                            : 'max';
                },
                onPanResponderMove: (_evt, gestureState) => {
                    // moveX is screen-space and stays stable across re-renders.
                    updateFromPageX(gestureState.moveX);
                },
                onPanResponderRelease: commitDraft,
                onPanResponderTerminate: commitDraft,
            }),
        [commitDraft, refreshTrackWindow, updateFromPageX]
    );

    if (mapMode !== 'trail' || count < 1) return null;

    const minX = indexToX(draft.min, trackWidth, count);
    const maxX = indexToX(draft.max, trackWidth, count);
    const selectedWidth = Math.max(0, maxX - minX);

    return (
        <View
            className="absolute left-0 right-0 px-4"
            style={{bottom: insetsBottom + 8}}
            pointerEvents="box-none"
        >
            <View className="rounded-2xl border border-border-input bg-bg-primary/95 px-4 py-3 shadow-lg dark:bg-bg-overlay/95">
                <View className="mb-2 flex-row items-center justify-between">
                    <AppText
                        variant="caption-xs"
                        className="font-semibold text-text-primary-lighter"
                    >
                        Trail stops
                    </AppText>
                    <View className="flex-row items-center gap-2">
                        <AppText
                            variant="caption-xs"
                            className="font-bold text-text-primary"
                        >
                            {`${draft.min} – ${draft.max} / ${count}`}
                        </AppText>
                        {onOpenList ? (
                            <Pressable
                                onPress={onOpenList}
                                accessibilityRole="button"
                                accessibilityLabel={`List ${stopsInRange} stops`}
                                className="flex-row items-center gap-1 rounded-full border border-border-input px-2.5 py-1 active:opacity-70"
                                style={{backgroundColor: colors.bg.darker}}
                            >
                                <Iconify
                                    icon="heroicons:list-bullet"
                                    size={14}
                                    color={colors.icon.primary}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="font-semibold text-text-primary"
                                >
                                    {`List · ${stopsInRange}`}
                                </AppText>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <View
                    ref={trackRef}
                    className="justify-center"
                    style={{height: THUMB_SIZE + HIT_SLOP}}
                    onLayout={onTrackLayout}
                    {...panResponder.panHandlers}
                >
                    <View
                        pointerEvents="none"
                        className="rounded-full bg-border-input"
                        style={{height: TRACK_HEIGHT}}
                    />
                    {trackWidth > 0 ? (
                        <View
                            pointerEvents="none"
                            className="absolute rounded-full bg-accent-sky"
                            style={{
                                left: minX,
                                width: selectedWidth,
                                height: TRACK_HEIGHT,
                                top: (THUMB_SIZE + HIT_SLOP - TRACK_HEIGHT) / 2,
                            }}
                        />
                    ) : null}
                    {trackWidth > 0 ? (
                        <>
                            <View
                                pointerEvents="none"
                                className="absolute items-center justify-center rounded-full border-2 border-white bg-accent-sky shadow-sm"
                                style={{
                                    width: THUMB_SIZE,
                                    height: THUMB_SIZE,
                                    left: minX - THUMB_SIZE / 2,
                                    top: HIT_SLOP / 2,
                                }}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="font-bold text-white"
                                >
                                    {draft.min}
                                </AppText>
                            </View>
                            <View
                                pointerEvents="none"
                                className="absolute items-center justify-center rounded-full border-2 border-white bg-accent-sky shadow-sm"
                                style={{
                                    width: THUMB_SIZE,
                                    height: THUMB_SIZE,
                                    left: maxX - THUMB_SIZE / 2,
                                    top: HIT_SLOP / 2,
                                }}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="font-bold text-white"
                                >
                                    {draft.max}
                                </AppText>
                            </View>
                        </>
                    ) : null}
                </View>

                <View className="mt-1 flex-row justify-between">
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter"
                    >
                        1
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="text-text-primary-lighter"
                    >
                        {count}
                    </AppText>
                </View>
            </View>
        </View>
    );
}
