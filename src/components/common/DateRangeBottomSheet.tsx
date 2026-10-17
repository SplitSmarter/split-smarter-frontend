import React, {useCallback, useMemo} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetFooter,
    BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import {Calendar} from 'react-native-calendars';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {DateRangeDay} from '@/src/components/common/components/DateRangeDay';
import {useDateRangeBottomSheet} from '@/src/components/common/hooks/useDateRangeBottomSheet';
import type {
    DateRangeBottomSheetProps,
    DateRangePresetId,
} from '@/src/components/common/types/dateRangeBottomSheet.types';

const PRESETS: {id: DateRangePresetId; label: string}[] = [
    {id: '7d', label: '7 days'},
    {id: '30d', label: '30 days'},
    {id: 'this_month', label: 'Month'},
    {id: 'this_year', label: 'Year'},
];

export const DateRangeBottomSheet: React.FC<DateRangeBottomSheetProps> = ({
    visible,
    initialStartDate,
    initialEndDate,
    maxDate,
    title = 'Select duration',
    confirmLabel = 'Apply',
    onClose,
    onConfirm,
    onClearFilter,
}) => {
    const insets = useSafeAreaInsets();
    const {
        theme,
        isDark,
        bottomSheetModalRef,
        snapPoints,
        palette,
        startDate,
        endDate,
        activePreset,
        markedDates,
        canConfirm,
        calendarCurrent,
        maxDate: maxSelectable,
        onDayPress,
        applyPreset,
        clearRange,
        handleSave,
        formatLabel,
    } = useDateRangeBottomSheet(
        visible,
        initialStartDate,
        initialEndDate,
        onClose,
        onConfirm,
        maxDate,
        onClearFilter
    );

    const footerPad = Math.max(insets.bottom, 12) + 8;

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.7 : 0.4}
            />
        ),
        [isDark]
    );

    const dayTheme = useMemo(
        () => ({
            dayTextColor: palette.textPrimary,
            textDisabledColor: palette.textDisabled,
            todayTextColor: palette.todayText,
            todayRingColor: palette.todayRing,
        }),
        [palette]
    );

    const BoundDay = useMemo(() => {
        const Comp = (props: any) => <DateRangeDay {...props} theme={dayTheme} />;
        Comp.displayName = 'BoundDateRangeDay';
        return Comp;
    }, [dayTheme]);

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={0}>
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: footerPad,
                        backgroundColor: palette.background,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: palette.borderSoft,
                    }}
                >
                    <Pressable
                        onPress={handleSave}
                        disabled={!canConfirm}
                        className="h-12 flex-row items-center justify-center gap-2 rounded-2xl"
                        style={{
                            backgroundColor: canConfirm ? palette.ctaBg : palette.ctaDisabled,
                        }}
                    >
                        <Iconify
                            icon="heroicons:check-circle"
                            size={20}
                            color={canConfirm ? palette.ctaLabel : palette.ctaLabelDisabled}
                        />
                        <AppText
                            className="text-base font-bold"
                            style={{
                                color: canConfirm ? palette.ctaLabel : palette.ctaLabelDisabled,
                            }}
                        >
                            {confirmLabel}
                        </AppText>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [footerPad, palette, canConfirm, handleSave, confirmLabel]
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            footerComponent={renderFooter}
            backgroundStyle={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
            }}
            handleIndicatorStyle={{
                backgroundColor: palette.handle,
                width: 40,
                height: 4,
                marginTop: 6,
            }}
        >
            {/* Balanced header — equal side slots keep title centered */}
            <View
                className="flex-row items-center px-4 pb-3 pt-1"
                style={{
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: palette.borderSoft,
                }}
            >
                <View className="w-16 items-start">
                    <Pressable
                        onPress={onClose}
                        hitSlop={12}
                        className="h-9 w-9 items-center justify-center rounded-full"
                        style={{backgroundColor: palette.chipBg}}
                    >
                        <Iconify icon="heroicons:x-mark" size={18} color={palette.iconPrimary} />
                    </Pressable>
                </View>

                <AppText
                    className="flex-1 text-center text-[17px] font-bold"
                    style={{color: palette.textPrimary}}
                >
                    {title}
                </AppText>

                <View className="w-16 items-end">
                    <Pressable onPress={clearRange} hitSlop={12} className="py-2">
                        <AppText className="text-sm font-semibold" style={{color: palette.todayText}}>
                            Clear
                        </AppText>
                    </Pressable>
                </View>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 88 + footerPad,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Compact duration summary */}
                <View
                    className="flex-row items-center rounded-2xl border px-3.5 py-2.5"
                    style={{
                        backgroundColor: palette.cardBg,
                        borderColor: startDate || endDate ? palette.chipActiveBorder : palette.border,
                    }}
                >
                    <View className="min-w-0 flex-1 pr-3">
                        <AppText
                            className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider"
                            style={{color: palette.textLighter}}
                        >
                            Duration
                        </AppText>
                        <AppText
                            className="text-[15px] font-bold"
                            numberOfLines={1}
                            style={{color: palette.textPrimary}}
                        >
                            {startDate || endDate
                                ? `${formatLabel(startDate)}  –  ${formatLabel(endDate)}`
                                : 'Pick start and end'}
                        </AppText>
                    </View>
                    <View
                        className="h-9 w-9 items-center justify-center rounded-xl"
                        style={{backgroundColor: palette.chipActiveBg}}
                    >
                        <Iconify icon="heroicons:calendar-days" size={18} color={palette.range} />
                    </View>
                </View>

                {/* Equal-width preset row */}
                <View className="flex-row gap-2">
                    {PRESETS.map((preset) => {
                        const active = activePreset === preset.id;
                        return (
                            <Pressable
                                key={preset.id}
                                onPress={() => applyPreset(preset.id)}
                                className="h-9 flex-1 items-center justify-center rounded-full border"
                                style={{
                                    backgroundColor: active ? palette.chipActiveBg : palette.chipBg,
                                    borderColor: active ? palette.chipActiveBorder : palette.border,
                                }}
                            >
                                <AppText
                                    className="text-[11px] font-semibold"
                                    style={{color: active ? palette.range : palette.textLighter}}
                                >
                                    {preset.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Calendar — same surface as duration field (cardBg everywhere) */}
                <View
                    className="overflow-hidden rounded-3xl border px-1 pb-2 pt-1"
                    style={{
                        backgroundColor: palette.cardBg,
                        borderColor: palette.border,
                    }}
                >
                    <Calendar
                        // Remount on theme/surface or open/preset month — never on day taps
                        // (start/end in the key was remounting ~42 day cells every press).
                        key={`cal-${theme}-${palette.cardBg}-${calendarCurrent}`}
                        current={calendarCurrent}
                        onDayPress={onDayPress}
                        maxDate={maxSelectable}
                        markingType="period"
                        markedDates={markedDates}
                        dayComponent={BoundDay}
                        enableSwipeMonths
                        hideExtraDays={false}
                        style={{backgroundColor: palette.cardBg}}
                        headerStyle={{backgroundColor: palette.cardBg}}
                        theme={
                            {
                                calendarBackground: palette.cardBg,
                                textSectionTitleColor: palette.textLighter,
                                selectedDayBackgroundColor: palette.range,
                                selectedDayTextColor: palette.ctaLabel,
                                todayTextColor: palette.todayText,
                                todayBackgroundColor: 'transparent',
                                dayTextColor: palette.textPrimary,
                                textDisabledColor: palette.textDisabled,
                                monthTextColor: palette.textPrimary,
                                arrowColor: palette.range,
                                textMonthFontWeight: '700',
                                textDayHeaderFontWeight: '600',
                                textDayFontWeight: '500',
                                textDayHeaderFontSize: 12,
                                weekVerticalMargin: 6,
                                // Supported at runtime; omitted from published Theme typings
                                'stylesheet.calendar.main': {
                                    container: {
                                        paddingLeft: 0,
                                        paddingRight: 0,
                                        backgroundColor: palette.cardBg,
                                    },
                                    monthView: {
                                        backgroundColor: palette.cardBg,
                                    },
                                    week: {
                                        marginVertical: 6,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        backgroundColor: palette.cardBg,
                                    },
                                    dayContainer: {
                                        flex: 1,
                                        alignItems: 'center',
                                        backgroundColor: 'transparent',
                                    },
                                },
                                'stylesheet.calendar.header': {
                                    header: {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingHorizontal: 4,
                                        marginTop: 2,
                                        marginBottom: 6,
                                        backgroundColor: palette.cardBg,
                                    },
                                    week: {
                                        marginTop: 4,
                                        marginBottom: 2,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        backgroundColor: palette.cardBg,
                                    },
                                    dayHeader: {
                                        marginTop: 2,
                                        marginBottom: 2,
                                        width: 32,
                                        textAlign: 'center',
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: palette.textLighter,
                                        backgroundColor: 'transparent',
                                    },
                                },
                            } as React.ComponentProps<typeof Calendar>['theme']
                        }
                    />
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
};
