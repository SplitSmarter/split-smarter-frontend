import React, {useMemo, useEffect, useState, useCallback, useRef} from 'react';
import {View, Pressable, TextInput, Keyboard} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {Calendar, DateData} from 'react-native-calendars';
import {Iconify} from 'react-native-iconify';
import {z} from 'zod';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';

// --- Types & Enums ---

export enum ExpenseRecurringPeriod {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum EndType {
    NEVER = 'NEVER',
    COUNT = 'COUNT',
    UNTIL = 'UNTIL',
}

export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

// --- Zod Schemas ---

export const NonRecurringDateSchema = z.object({
    isRecurring: z.literal(false),
    selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const RecurringDateSchema = z.object({
    isRecurring: z.literal(true),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    recurringPeriod: z.nativeEnum(ExpenseRecurringPeriod),
    interval: z.number().int().min(1),
    selectedValues: z
        .object({
            byDay: z.array(z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])).optional(),
            monthlyOption: z.enum(['DAY_OF_MONTH', 'NTH_WEEKDAY', 'SPECIFIC_DATES']).optional(),
            yearlyOption: z.enum(['FIXED_DATE', 'NTH_WEEKDAY_OCT', 'SPECIFIC_MONTHS']).optional(),
        })
        .optional(),
    endType: z.nativeEnum(EndType),
    occurrenceCount: z.number().int().min(1).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const DateSelectionSchema = z.discriminatedUnion('isRecurring', [
    NonRecurringDateSchema,
    RecurringDateSchema,
]);

export type DateSelectionResult = z.infer<typeof DateSelectionSchema>;

// --- Dedicated Numeric Input with Local State & Blur Fallback ---

interface DebouncedNumberInputProps {
    value: number;
    onChangeValue: (val: number) => void;
    min?: number;
    className?: string;
}

const DebouncedNumberInput = React.memo(({value, onChangeValue, min = 1, className}: DebouncedNumberInputProps) => {
    // Local string state allows user to clear text ("") when pressing backspace
    const [text, setText] = useState<string>(String(value));

    useEffect(() => {
        setText(String(value));
    }, [value]);

    const handleTextChange = (raw: string) => {
        // Strip out non-numeric characters immediately
        const cleaned = raw.replace(/[^0-9]/g, '');
        setText(cleaned);
    };

    const handleCommit = () => {
        Keyboard.dismiss();
        const parsed = parseInt(text, 10);

        // Fall back to `min` if empty, invalid, or below minimum
        if (isNaN(parsed) || parsed < min) {
            setText(String(min));
            onChangeValue(min);
        } else {
            setText(String(parsed));
            onChangeValue(parsed);
        }
    };

    return (
        <TextInput
            className={className}
            keyboardType="number-pad"
            value={text}
            onChangeText={handleTextChange}
            onBlur={handleCommit}
            onSubmitEditing={handleCommit}
            returnKeyType="done"
        />
    );
});

DebouncedNumberInput.displayName = 'DebouncedNumberInput';

// --- Dedicated Date Text Input with Commit on Blur ---

interface DebouncedDateInputProps {
    value: string;
    onChangeValue: (val: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    className?: string;
}

const DebouncedDateInput = React.memo(({
                                           value,
                                           onChangeValue,
                                           placeholder,
                                           placeholderTextColor,
                                           className
                                       }: DebouncedDateInputProps) => {
    const [text, setText] = useState<string>(value);

    useEffect(() => {
        setText(value);
    }, [value]);

    const handleCommit = () => {
        Keyboard.dismiss();
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(text)) {
            // Revert back to previous valid parent value if invalid format
            setText(value);
        } else {
            onChangeValue(text);
        }
    };

    return (
        <TextInput
            className={className}
            value={text}
            onChangeText={setText}
            onBlur={handleCommit}
            onSubmitEditing={handleCommit}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            returnKeyType="done"
        />
    );
});

DebouncedDateInput.displayName = 'DebouncedDateInput';

// --- Main Bottom Sheet Component ---

interface SelectDateBottomSheetProps {
    visible: boolean;
    initialDate?: string;
    onClose: () => void;
    onConfirm: (result: DateSelectionResult) => void;
}

export const SelectDateBottomSheet = ({
                                          visible,
                                          initialDate = new Date().toISOString().split('T')[0],
                                          onClose,
                                          onConfirm,
                                      }: SelectDateBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [activeTab, setActiveTab] = useState<'NO_REPEAT' | 'REPEAT'>('NO_REPEAT');
    const [selectedDate, setSelectedDate] = useState<string>(initialDate);

    // Recurrence options state
    const [period, setPeriod] = useState<ExpenseRecurringPeriod>(ExpenseRecurringPeriod.DAILY);
    const [interval, setInterval] = useState<number>(1);
    const [selectedWeekdays, setSelectedWeekdays] = useState<DayOfWeek[]>(['TH']);
    const [monthlyOption, setMonthlyOption] = useState<'DAY_OF_MONTH' | 'NTH_WEEKDAY' | 'SPECIFIC_DATES'>('DAY_OF_MONTH');
    const [yearlyOption, setYearlyOption] = useState<'FIXED_DATE' | 'NTH_WEEKDAY_OCT' | 'SPECIFIC_MONTHS'>('FIXED_DATE');

    // Duration options state
    const [endType, setEndType] = useState<EndType>(EndType.NEVER);
    const [occurrenceCount, setOccurrenceCount] = useState<number>(10);
    const [untilDate, setUntilDate] = useState<string>(initialDate);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    const snapPoints = useMemo(() => ['85%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    const toggleWeekday = (day: DayOfWeek) => {
        if (selectedWeekdays.includes(day)) {
            setSelectedWeekdays(selectedWeekdays.filter((d) => d !== day));
        } else {
            setSelectedWeekdays([...selectedWeekdays, day]);
        }
    };

    const handleSave = () => {
        Keyboard.dismiss();
        if (activeTab === 'NO_REPEAT') {
            const payload: DateSelectionResult = {
                isRecurring: false,
                selectedDate: selectedDate,
            };
            const parsed = NonRecurringDateSchema.parse(payload);
            onConfirm(parsed);
        } else {
            let selectedValuesPayload: any = {};

            if (period === ExpenseRecurringPeriod.WEEKLY) {
                selectedValuesPayload.byDay = selectedWeekdays;
            } else if (period === ExpenseRecurringPeriod.MONTHLY) {
                selectedValuesPayload.monthlyOption = monthlyOption;
            } else if (period === ExpenseRecurringPeriod.YEARLY) {
                selectedValuesPayload.yearlyOption = yearlyOption;
            }

            const payload: DateSelectionResult = {
                isRecurring: true,
                startDate: selectedDate,
                recurringPeriod: period,
                interval: interval || 1,
                selectedValues: Object.keys(selectedValuesPayload).length > 0 ? selectedValuesPayload : undefined,
                endType: endType,
                occurrenceCount: endType === EndType.COUNT ? (occurrenceCount || 1) : undefined,
                endDate: endType === EndType.UNTIL ? untilDate : undefined,
            };

            const parsed = RecurringDateSchema.parse(payload);
            onConfirm(parsed);
        }
        onClose();
    };

    const daysList: { label: string; value: DayOfWeek }[] = [
        {label: 'M', value: 'MO'},
        {label: 'T', value: 'TU'},
        {label: 'W', value: 'WE'},
        {label: 'T', value: 'TH'},
        {label: 'F', value: 'FR'},
        {label: 'S', value: 'SA'},
        {label: 'S', value: 'SU'},
    ];

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            backgroundStyle={{
                backgroundColor: isDark ? 'rgb(26, 26, 26)' : 'rgb(255, 255, 255)',
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? 'rgb(63, 63, 70)' : 'rgb(224, 224, 224)',
                width: 48,
                height: 6,
            }}
        >
            <BottomSheetView className="flex-1 px-4">
                {/* Header Bar */}
                <View className="flex-row items-center justify-between pb-3 border-b border-bg-primary-darker/20">
                    <Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={isDark ? 'rgb(235, 235, 235)' : 'rgb(43, 43, 43)'}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Repeat
                    </AppText>
                    <Pressable onPress={handleSave} className="p-2 active:opacity-60">
                        <AppText className="font-semibold text-text-link">Save</AppText>
                    </Pressable>
                </View>

                {/* Switcher Segmented Control */}
                <View className="flex-row my-3 p-1 bg-bg-primary-darker/20 rounded-2xl">
                    <Pressable
                        onPress={() => {
                            Keyboard.dismiss();
                            setActiveTab('NO_REPEAT');
                        }}
                        className={`flex-1 py-2.5 items-center rounded-xl ${
                            activeTab === 'NO_REPEAT' ? 'bg-bg-canvas' : 'bg-transparent'
                        }`}
                    >
                        <AppText
                            className={`font-semibold ${
                                activeTab === 'NO_REPEAT' ? 'text-text-primary' : 'text-text-primary-placeholder'
                            }`}
                        >
                            Don&#39;t repeat
                        </AppText>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            Keyboard.dismiss();
                            setActiveTab('REPEAT');
                        }}
                        className={`flex-1 py-2.5 items-center rounded-xl ${
                            activeTab === 'REPEAT' ? 'bg-bg-canvas' : 'bg-transparent'
                        }`}
                    >
                        <AppText
                            className={`font-semibold ${
                                activeTab === 'REPEAT' ? 'text-text-primary' : 'text-text-primary-placeholder'
                            }`}
                        >
                            Repeat
                        </AppText>
                    </Pressable>
                </View>

                {/* Scrollable Content View */}
                <BottomSheetScrollView
                    contentContainerStyle={{paddingBottom: 100}}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'NO_REPEAT' ? (
                        <View
                            className="rounded-2xl overflow-hidden bg-bg-canvas p-2 border border-bg-primary-darker/10">
                            <Calendar
                                theme={{
                                    calendarBackground: isDark ? 'rgb(12, 12, 12)' : 'rgb(255, 255, 255)',
                                    textSectionTitleColor: isDark ? 'rgb(170, 170, 170)' : 'rgb(100, 100, 100)',
                                    selectedDayBackgroundColor: isDark ? 'rgb(50, 150, 110)' : 'rgb(43, 135, 97)',
                                    selectedDayTextColor: 'rgb(255, 255, 255)',
                                    todayTextColor: isDark ? 'rgb(75, 180, 140)' : 'rgb(43, 135, 97)',
                                    dayTextColor: isDark ? 'rgb(235, 235, 235)' : 'rgb(43, 43, 43)',
                                    monthTextColor: isDark ? 'rgb(235, 235, 235)' : 'rgb(43, 43, 43)',
                                    arrowColor: isDark ? 'rgb(50, 150, 110)' : 'rgb(43, 135, 97)',
                                }}
                                current={selectedDate}
                                onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate]: {
                                        selected: true,
                                        selectedColor: isDark ? 'rgb(50, 150, 110)' : 'rgb(43, 135, 97)',
                                    },
                                }}
                            />
                        </View>
                    ) : (
                        <View className="gap-3">
                            {/* Selected Base Date Display */}
                            <View
                                className="flex-row justify-between p-3.5 rounded-2xl bg-bg-canvas border border-bg-primary-darker/10">
                                <AppText className="text-text-primary-lighter">Start Date:</AppText>
                                <AppText className="font-semibold text-text-primary">{selectedDate}</AppText>
                            </View>

                            {/* Recurrence Pattern Options */}
                            <View className="p-3.5 rounded-2xl bg-bg-canvas border border-bg-primary-darker/10 gap-4">
                                {/* Daily */}
                                <Pressable
                                    className="flex-row items-center"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.DAILY)}
                                >
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {period === ExpenseRecurringPeriod.DAILY && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Every</AppText>
                                    <DebouncedNumberInput
                                        className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg mx-2 min-w-[40px] text-center"
                                        value={interval}
                                        onChangeValue={setInterval}
                                    />
                                    <AppText className="text-text-primary text-base">day</AppText>
                                </Pressable>

                                {/* Weekly */}
                                <Pressable
                                    className="flex-row items-center"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.WEEKLY)}
                                >
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {period === ExpenseRecurringPeriod.WEEKLY && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Every</AppText>
                                    <DebouncedNumberInput
                                        className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg mx-2 min-w-[40px] text-center"
                                        value={interval}
                                        onChangeValue={setInterval}
                                    />
                                    <AppText className="text-text-primary text-base">week</AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.WEEKLY && (
                                    <View className="flex-row justify-between pl-8 mt-1">
                                        {daysList.map((d) => {
                                            const isSelected = selectedWeekdays.includes(d.value);
                                            return (
                                                <Pressable
                                                    key={d.value}
                                                    className={`w-8 h-8 rounded-full items-center justify-center ${
                                                        isSelected ? 'bg-bg-secondary' : 'bg-bg-primary-darker/20'
                                                    }`}
                                                    onPress={() => toggleWeekday(d.value)}
                                                >
                                                    <AppText
                                                        className={`text-xs ${
                                                            isSelected
                                                                ? 'text-text-secondary font-bold'
                                                                : 'text-text-primary-lighter'
                                                        }`}
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
                                    className="flex-row items-center"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.MONTHLY)}
                                >
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {period === ExpenseRecurringPeriod.MONTHLY && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Every</AppText>
                                    <DebouncedNumberInput
                                        className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg mx-2 min-w-[40px] text-center"
                                        value={interval}
                                        onChangeValue={setInterval}
                                    />
                                    <AppText className="text-text-primary text-base">month</AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.MONTHLY && (
                                    <View className="pl-8 gap-2 mt-1">
                                        <Pressable
                                            className={`border border-bg-secondary rounded-full py-1.5 px-3 self-start ${
                                                monthlyOption === 'DAY_OF_MONTH' ? 'bg-bg-secondary-lighter' : 'bg-transparent'
                                            }`}
                                            onPress={() => setMonthlyOption('DAY_OF_MONTH')}
                                        >
                                            <AppText className="text-text-link text-xs">Repeat on the 1st</AppText>
                                        </Pressable>
                                        <Pressable
                                            className={`border border-bg-secondary rounded-full py-1.5 px-3 self-start ${
                                                monthlyOption === 'NTH_WEEKDAY' ? 'bg-bg-secondary-lighter' : 'bg-transparent'
                                            }`}
                                            onPress={() => setMonthlyOption('NTH_WEEKDAY')}
                                        >
                                            <AppText className="text-text-link text-xs">Repeat on the 1st
                                                Thursday</AppText>
                                        </Pressable>
                                        <Pressable
                                            className={`border border-bg-secondary rounded-full py-1.5 px-3 self-start ${
                                                monthlyOption === 'SPECIFIC_DATES' ? 'bg-bg-secondary-lighter' : 'bg-transparent'
                                            }`}
                                            onPress={() => setMonthlyOption('SPECIFIC_DATES')}
                                        >
                                            <AppText className="text-text-link text-xs">Select dates to repeat</AppText>
                                        </Pressable>
                                    </View>
                                )}

                                {/* Yearly */}
                                <Pressable
                                    className="flex-row items-center"
                                    onPress={() => setPeriod(ExpenseRecurringPeriod.YEARLY)}
                                >
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {period === ExpenseRecurringPeriod.YEARLY && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Every</AppText>
                                    <DebouncedNumberInput
                                        className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg mx-2 min-w-[40px] text-center"
                                        value={interval}
                                        onChangeValue={setInterval}
                                    />
                                    <AppText className="text-text-primary text-base">year</AppText>
                                </Pressable>

                                {period === ExpenseRecurringPeriod.YEARLY && (
                                    <View className="pl-8 gap-2 mt-1">
                                        <Pressable
                                            className={`border border-bg-secondary rounded-full py-1.5 px-3 self-start ${
                                                yearlyOption === 'FIXED_DATE' ? 'bg-bg-secondary-lighter' : 'bg-transparent'
                                            }`}
                                            onPress={() => setYearlyOption('FIXED_DATE')}
                                        >
                                            <AppText className="text-text-link text-xs">Repeat on 1st Oct</AppText>
                                        </Pressable>
                                        <Pressable
                                            className={`border border-bg-secondary rounded-full py-1.5 px-3 self-start ${
                                                yearlyOption === 'NTH_WEEKDAY_OCT' ? 'bg-bg-secondary-lighter' : 'bg-transparent'
                                            }`}
                                            onPress={() => setYearlyOption('NTH_WEEKDAY_OCT')}
                                        >
                                            <AppText className="text-text-link text-xs">Repeat on the 1st Thursday of
                                                Oct</AppText>
                                        </Pressable>
                                    </View>
                                )}
                            </View>

                            {/* Duration Section */}
                            <AppText className="text-text-primary-lighter text-xs uppercase font-medium mt-2 mb-1 px-1">
                                Duration
                            </AppText>
                            <View className="p-3.5 rounded-2xl bg-bg-canvas border border-bg-primary-darker/10 gap-4">
                                <Pressable className="flex-row items-center" onPress={() => setEndType(EndType.NEVER)}>
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {endType === EndType.NEVER && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Forever</AppText>
                                </Pressable>

                                <Pressable className="flex-row items-center" onPress={() => setEndType(EndType.COUNT)}>
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {endType === EndType.COUNT && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Specific number of times</AppText>
                                    {endType === EndType.COUNT && (
                                        <DebouncedNumberInput
                                            className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg mx-2 min-w-[40px] text-center"
                                            value={occurrenceCount}
                                            onChangeValue={setOccurrenceCount}
                                        />
                                    )}
                                </Pressable>

                                <Pressable className="flex-row items-center" onPress={() => setEndType(EndType.UNTIL)}>
                                    <View
                                        className="h-5 w-5 rounded-full border-2 border-bg-secondary items-center justify-center mr-3">
                                        {endType === EndType.UNTIL && (
                                            <View className="h-2.5 w-2.5 rounded-full bg-bg-secondary"/>
                                        )}
                                    </View>
                                    <AppText className="text-text-primary text-base">Until</AppText>
                                    {endType === EndType.UNTIL && (
                                        <DebouncedDateInput
                                            className="bg-bg-primary-secondary border border-border-input text-text-primary px-2.5 py-1 rounded-lg ml-2 w-[110px] text-center"
                                            value={untilDate}
                                            onChangeValue={setUntilDate}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                                        />
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    )}
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

SelectDateBottomSheet.displayName = 'SelectDateBottomSheet';