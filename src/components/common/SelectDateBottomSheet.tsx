import React, {useCallback, useEffect} from 'react';
import {View, Pressable, Keyboard} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {Calendar, DateData} from 'react-native-calendars';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';

import {
    ExpenseRecurringPeriod,
    EndType,
    DayOfWeek,
    SelectDateBottomSheetProps as BaseSelectDateBottomSheetProps,
} from '@/src/components/common/types/selectDateBottomSheet.types';
import {useSelectDateBottomSheet} from '@/src/components/common/hooks/useSelectDateBottomSheet';
import {DebouncedNumberInput, DebouncedDateInput} from '@/src/components/common/components/DebouncedFormInputs';

export interface SelectDateBottomSheetProps extends BaseSelectDateBottomSheetProps {
    allowedModes?: 'single' | 'recurring' | 'both';
}

const DAYS_LIST: { label: string; value: DayOfWeek }[] = [
    {label: 'M', value: 'MO'},
    {label: 'T', value: 'TU'},
    {label: 'W', value: 'WE'},
    {label: 'T', value: 'TH'},
    {label: 'F', value: 'FR'},
    {label: 'S', value: 'SA'},
    {label: 'S', value: 'SU'},
];

export const SelectDateBottomSheet: React.FC<SelectDateBottomSheetProps> = ({
                                                                                visible,
                                                                                initialDate = new Date().toISOString().split('T')[0],
                                                                                allowedModes = 'both',
                                                                                onClose,
                                                                                onConfirm,
                                                                            }) => {
    const {
        isDark,
        bottomSheetModalRef,
        activeTab,
        selectedDate,
        period,
        interval,
        selectedWeekdays,
        monthlyOption,
        yearlyOption,
        endType,
        occurrenceCount,
        untilDate,
        snapPoints,
        palette,
        setActiveTab,
        setSelectedDate,
        setPeriod,
        setInterval,
        setMonthlyOption,
        setYearlyOption,
        setEndType,
        setOccurrenceCount,
        setUntilDate,
        toggleWeekday,
        handleSave,
    } = useSelectDateBottomSheet(visible, initialDate, onClose, onConfirm);

    // Enforce default tab based on allowedModes prop
    useEffect(() => {
        if (allowedModes === 'single' && activeTab !== 'NO_REPEAT') {
            setActiveTab('NO_REPEAT');
        } else if (allowedModes === 'recurring' && activeTab !== 'REPEAT') {
            setActiveTab('REPEAT');
        }
    }, [allowedModes, activeTab, setActiveTab]);

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

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            backgroundStyle={{
                backgroundColor: palette.background,
                borderRadius: 36,
            }}
            handleIndicatorStyle={{
                backgroundColor: palette.handle,
                width: 36,
                height: 4,
                borderRadius: 2,
            }}
        >
            <BottomSheetView className="flex-1 px-5">
                {/* Header Bar */}
                <View
                    className="flex-row items-center justify-between pb-3 border-b"
                    style={{borderBottomColor: palette.border}}
                >
                    <Pressable onPress={onClose} className="p-1.5 rounded-xl">
                        <Iconify icon="heroicons:x-mark" size={20} color={palette.textLighter}/>
                    </Pressable>
                    <AppText className="text-[17px] font-bold" style={{color: palette.textPrimary}}>
                        {allowedModes === 'single'
                            ? 'Select Date'
                            : allowedModes === 'recurring'
                                ? 'Recurrence Rule'
                                : 'Date & Recurrence'}
                    </AppText>
                    <Pressable
                        onPress={handleSave}
                        className="px-4 py-1.5 rounded-2xl"
                        style={{backgroundColor: palette.ctaBg}}
                    >
                        <AppText className="text-white font-bold text-sm">Save</AppText>
                    </Pressable>
                </View>

                {/* Segmented Tab Switcher - Rendered only if both modes are enabled */}
                {allowedModes === 'both' && (
                    <View
                        className="flex-row my-3 p-1 rounded-[18px]"
                        style={{backgroundColor: palette.segmentedBg}}
                    >
                        <Pressable
                            onPress={() => {
                                Keyboard.dismiss();
                                setActiveTab('NO_REPEAT');
                            }}
                            className={`flex-1 py-2 items-center rounded-2xl ${
                                activeTab === 'NO_REPEAT' ? 'elevation-2' : ''
                            }`}
                            style={
                                activeTab === 'NO_REPEAT'
                                    ? {
                                        backgroundColor: palette.cardBg,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                    }
                                    : undefined
                            }
                        >
                            <AppText
                                className={`text-sm ${
                                    activeTab === 'NO_REPEAT' ? 'font-bold' : 'font-medium'
                                }`}
                                style={{
                                    color:
                                        activeTab === 'NO_REPEAT'
                                            ? palette.textPrimary
                                            : palette.textLighter,
                                }}
                            >
                                Single Date
                            </AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                Keyboard.dismiss();
                                setActiveTab('REPEAT');
                            }}
                            className={`flex-1 py-2 items-center rounded-2xl ${
                                activeTab === 'REPEAT' ? 'elevation-2' : ''
                            }`}
                            style={
                                activeTab === 'REPEAT'
                                    ? {
                                        backgroundColor: palette.cardBg,
                                        shadowColor: '#000',
                                        shadowOffset: {width: 0, height: 2},
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                    }
                                    : undefined
                            }
                        >
                            <AppText
                                className={`text-sm ${
                                    activeTab === 'REPEAT' ? 'font-bold' : 'font-medium'
                                }`}
                                style={{
                                    color:
                                        activeTab === 'REPEAT'
                                            ? palette.textPrimary
                                            : palette.textLighter,
                                }}
                            >
                                Recurring Rule
                            </AppText>
                        </Pressable>
                    </View>
                )}

                {/* Scrollable Content */}
                <BottomSheetScrollView
                    contentContainerStyle={{paddingBottom: 40, paddingTop: allowedModes === 'both' ? 0 : 12}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'NO_REPEAT' ? (
                        <View
                            className="rounded-3xl p-2 border overflow-hidden"
                            style={{backgroundColor: palette.canvasBg, borderColor: palette.border}}
                        >
                            <Calendar
                                theme={{
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: palette.textLighter,
                                    selectedDayBackgroundColor: palette.accentSky,
                                    selectedDayTextColor: '#FFFFFF',
                                    todayTextColor: palette.accentSky,
                                    dayTextColor: palette.textPrimary,
                                    monthTextColor: palette.textPrimary,
                                    arrowColor: palette.accentSky,
                                    textMonthFontWeight: '700',
                                    textDayHeaderFontWeight: '600',
                                }}
                                current={selectedDate}
                                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: {
                                        selected: true,
                                        selectedColor: palette.accentSky,
                                    },
                                }}
                            />
                        </View>
                    ) : (
                        <View className="gap-3">
                            {/* Start Date Display Banner */}
                            <View
                                className="flex-row items-center justify-between p-3.5 rounded-2xl border"
                                style={{backgroundColor: palette.cardBg, borderColor: palette.border}}
                            >
                                <View className="flex-row items-center gap-2">
                                    <Iconify icon="heroicons:calendar-days" size={18} color={palette.accentSky}/>
                                    <AppText className="text-sm font-medium" style={{color: palette.textLighter}}>
                                        Start Date
                                    </AppText>
                                </View>
                                <AppText className="text-base font-bold" style={{color: palette.textPrimary}}>
                                    {selectedDate}
                                </AppText>
                            </View>

                            {/* Recurrence Pattern Configuration Card */}
                            <View
                                className="p-4 rounded-3xl border gap-4"
                                style={{backgroundColor: palette.cardBg, borderColor: palette.border}}
                            >
                                {/* Daily */}
                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.DAILY)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                period === ExpenseRecurringPeriod.DAILY
                                                    ? palette.accentSky
                                                    : palette.border,
                                        }}
                                    >
                                        {period === ExpenseRecurringPeriod.DAILY && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Every
                                    </AppText>
                                    <DebouncedNumberInput value={interval} onChangeValue={setInterval}/>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        day(s)
                                    </AppText>
                                </Pressable>

                                {/* Weekly */}
                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.WEEKLY)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                period === ExpenseRecurringPeriod.WEEKLY
                                                    ? palette.accentSky
                                                    : palette.border,
                                        }}
                                    >
                                        {period === ExpenseRecurringPeriod.WEEKLY && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Every
                                    </AppText>
                                    <DebouncedNumberInput value={interval} onChangeValue={setInterval}/>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        week(s)
                                    </AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.WEEKLY && (
                                    <View className="flex-row justify-between pl-7 -mt-1">
                                        {DAYS_LIST.map((d) => {
                                            const isSelected = selectedWeekdays.includes(d.value);
                                            return (
                                                <Pressable
                                                    key={d.value}
                                                    className="w-8 h-8 rounded-full items-center justify-center"
                                                    style={{
                                                        backgroundColor: isSelected
                                                            ? palette.accentSky
                                                            : isDark
                                                                ? '#374151'
                                                                : '#E2E8F0',
                                                    }}
                                                    onPress={() => toggleWeekday(d.value)}
                                                >
                                                    <AppText
                                                        className="text-xs font-bold"
                                                        style={{
                                                            color: isSelected ? '#FFFFFF' : palette.textLighter,
                                                        }}
                                                    >
                                                        {d.label}
                                                    </AppText>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Monthly */}
                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.MONTHLY)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                period === ExpenseRecurringPeriod.MONTHLY
                                                    ? palette.accentSky
                                                    : palette.border,
                                        }}
                                    >
                                        {period === ExpenseRecurringPeriod.MONTHLY && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Every
                                    </AppText>
                                    <DebouncedNumberInput value={interval} onChangeValue={setInterval}/>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        month(s)
                                    </AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.MONTHLY && (
                                    <View className="pl-7 gap-2">
                                        <Pressable
                                            className="self-start px-3.5 py-1.5 rounded-2xl border"
                                            style={{
                                                backgroundColor:
                                                    monthlyOption === 'DAY_OF_MONTH'
                                                        ? palette.accentSkyBg
                                                        : 'transparent',
                                                borderColor:
                                                    monthlyOption === 'DAY_OF_MONTH'
                                                        ? palette.accentSky
                                                        : palette.border,
                                            }}
                                            onPress={() => setMonthlyOption('DAY_OF_MONTH')}
                                        >
                                            <AppText
                                                className="text-xs font-semibold"
                                                style={{color: palette.accentSky}}
                                            >
                                                Repeat on the 1st
                                            </AppText>
                                        </Pressable>
                                        <Pressable
                                            className="self-start px-3.5 py-1.5 rounded-2xl border"
                                            style={{
                                                backgroundColor:
                                                    monthlyOption === 'NTH_WEEKDAY'
                                                        ? palette.accentSkyBg
                                                        : 'transparent',
                                                borderColor:
                                                    monthlyOption === 'NTH_WEEKDAY'
                                                        ? palette.accentSky
                                                        : palette.border,
                                            }}
                                            onPress={() => setMonthlyOption('NTH_WEEKDAY')}
                                        >
                                            <AppText
                                                className="text-xs font-semibold"
                                                style={{color: palette.accentSky}}
                                            >
                                                Repeat on the 1st Thursday
                                            </AppText>
                                        </Pressable>
                                    </View>
                                )}

                                {/* Yearly */}
                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.YEARLY)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                period === ExpenseRecurringPeriod.YEARLY
                                                    ? palette.accentSky
                                                    : palette.border,
                                        }}
                                    >
                                        {period === ExpenseRecurringPeriod.YEARLY && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Every
                                    </AppText>
                                    <DebouncedNumberInput value={interval} onChangeValue={setInterval}/>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        year(s)
                                    </AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.YEARLY && (
                                    <View className="pl-7 gap-2">
                                        <Pressable
                                            className="self-start px-3.5 py-1.5 rounded-2xl border"
                                            style={{
                                                backgroundColor:
                                                    yearlyOption === 'FIXED_DATE'
                                                        ? palette.accentSkyBg
                                                        : 'transparent',
                                                borderColor:
                                                    yearlyOption === 'FIXED_DATE'
                                                        ? palette.accentSky
                                                        : palette.border,
                                            }}
                                            onPress={() => setYearlyOption('FIXED_DATE')}
                                        >
                                            <AppText
                                                className="text-xs font-semibold"
                                                style={{color: palette.accentSky}}
                                            >
                                                Repeat on fixed date
                                            </AppText>
                                        </Pressable>
                                    </View>
                                )}
                            </View>

                            {/* Duration / Ending Rules Section */}
                            <AppText
                                className="text-[11px] font-bold tracking-wider mt-2 ml-1"
                                style={{color: palette.textLighter}}
                            >
                                DURATION
                            </AppText>
                            <View
                                className="p-4 rounded-3xl border gap-4"
                                style={{backgroundColor: palette.cardBg, borderColor: palette.border}}
                            >
                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setEndType(EndType.NEVER)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                endType === EndType.NEVER ? palette.accentSky : palette.border,
                                        }}
                                    >
                                        {endType === EndType.NEVER && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Forever
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setEndType(EndType.COUNT)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                endType === EndType.COUNT ? palette.accentSky : palette.border,
                                        }}
                                    >
                                        {endType === EndType.COUNT && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        End after
                                    </AppText>
                                    <DebouncedNumberInput
                                        value={occurrenceCount}
                                        onChangeValue={setOccurrenceCount}
                                    />
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        times
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    className="flex-row items-center gap-2"
                                    onPress={() => setEndType(EndType.UNTIL)}
                                >
                                    <View
                                        className="w-5 h-5 rounded-full border-2 items-center justify-center"
                                        style={{
                                            borderColor:
                                                endType === EndType.UNTIL ? palette.accentSky : palette.border,
                                        }}
                                    >
                                        {endType === EndType.UNTIL && (
                                            <View
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{backgroundColor: palette.accentSky}}
                                            />
                                        )}
                                    </View>
                                    <AppText className="text-base" style={{color: palette.textPrimary}}>
                                        Until
                                    </AppText>
                                    <DebouncedDateInput
                                        value={untilDate}
                                        onChangeValue={setUntilDate}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </Pressable>
                            </View>
                        </View>
                    )}
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
};