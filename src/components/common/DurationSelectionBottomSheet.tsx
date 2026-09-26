import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import {View, Pressable, Switch, Platform} from 'react-native';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {resolveCssVar} from '@/src/lib/utils';

interface DurationSelectionBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: {
        startDate: string;
        endDate: string;
        startTime: string;
        endTime: string;
        isAllDay: boolean;
    }) => void;
}

export const DurationSelectionBottomSheet = ({
                                                 visible,
                                                 onClose,
                                                 onSave,
                                             }: DurationSelectionBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => (Platform.OS === 'ios' ? ['62%'] : ['48%']), []);

    const [activeTarget, setActiveTarget] = useState<'START' | 'END'>('START');
    const [isAllDay, setIsAllDay] = useState(false);

    const [startDateTime, setStartDateTime] = useState(() => {
        const d = new Date();
        d.setHours(6, 0, 0, 0);
        return d;
    });

    const [endDateTime, setEndDateTime] = useState(() => {
        const d = new Date();
        d.setHours(7, 0, 0, 0);
        return d;
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePickerAndroid, setShowTimePickerAndroid] = useState(false);

    const startDateFormatted = useMemo(() => format(startDateTime, 'EEE, d MMM'), [startDateTime]);
    const endDateFormatted = useMemo(() => format(endDateTime, 'EEE, d MMM'), [endDateTime]);

    const startTimeFormatted = useMemo(() => format(startDateTime, 'h:mm a'), [startDateTime]);
    const endTimeFormatted = useMemo(() => format(endDateTime, 'h:mm a'), [endDateTime]);

    // Resolve bottom sheet container background color dynamically for Gorhom Sheet prop
    const sheetBgColor = useMemo(
        () => resolveCssVar('var(--color-bg-primary)', isDark ? '#111827' : '#F8FAFC'),
        [isDark]
    );

    const sheetHandleColor = useMemo(
        () => resolveCssVar('var(--color-handle)', isDark ? '#374151' : '#CBD5E1'),
        [isDark]
    );

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

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

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            if (activeTarget === 'START') {
                const updated = new Date(startDateTime);
                updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setStartDateTime(updated);

                if (updated > endDateTime) {
                    const newEnd = new Date(updated);
                    newEnd.setHours(updated.getHours() + 1);
                    setEndDateTime(newEnd);
                }
            } else {
                const updated = new Date(endDateTime);
                updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setEndDateTime(updated);
            }
        }
    };

    const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePickerAndroid(false);
        }

        if (event.type === 'set' && selectedTime) {
            if (activeTarget === 'START') {
                const updated = new Date(startDateTime);
                updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                setStartDateTime(updated);

                if (updated > endDateTime) {
                    const newEnd = new Date(updated);
                    newEnd.setHours(updated.getHours() + 1);
                    setEndDateTime(newEnd);
                }
            } else {
                const updated = new Date(endDateTime);
                updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                setEndDateTime(updated);
            }
        }
    };

    const handleOpenDatePicker = (target: 'START' | 'END') => {
        setActiveTarget(target);
        setShowDatePicker(true);
    };

    const handleOpenTimePicker = (target: 'START' | 'END') => {
        setActiveTarget(target);
        if (Platform.OS === 'android') {
            setShowTimePickerAndroid(true);
        }
    };

    const handleSave = () => {
        onSave({
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            isAllDay,
        });
        onClose();
    };

    const currentDateTime = activeTarget === 'START' ? startDateTime : endDateTime;

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: sheetBgColor,
                borderRadius: 36,
            }}
            handleIndicatorStyle={{
                backgroundColor: sheetHandleColor,
                width: 36,
                height: 4,
                borderRadius: 2,
            }}
        >
            <BottomSheetView className="flex-1 px-5 pb-6">
                <View className="flex-1">
                    {/* All Day Toggle Card */}
                    <View
                        className="flex-row items-center justify-between py-3 px-4 rounded-2xl border mt-2 mb-4 bg-bg-primary-lighter border-border-input">
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl items-center justify-center bg-accent-sky-bg">
                                <Iconify icon="heroicons:clock" size={20} color={isDark ? '#38BDF8' : '#0284C7'}/>
                            </View>
                            <View>
                                <AppText variant="body-large" className="font-semibold text-[15px] text-text-primary">
                                    All-Day Event
                                </AppText>
                                <AppText className="text-xs mt-0.5 text-text-primary-lighter">
                                    Set schedule without specific hours
                                </AppText>
                            </View>
                        </View>
                        <Switch
                            value={isAllDay}
                            onValueChange={setIsAllDay}
                            trackColor={{
                                false: isDark ? '#374151' : '#E2E8F0',
                                true: '#10B981',
                            }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    {/* Start vs End DateTime Matrix */}
                    {!isAllDay && (
                        <View className="flex-row items-center justify-between my-1">
                            {/* Start Section */}
                            <View className="items-center flex-1">
                                <AppText
                                    className="text-[11px] font-bold tracking-wider mb-2 text-text-primary-lighter">
                                    STARTS
                                </AppText>
                                <Pressable
                                    onPress={() => handleOpenDatePicker('START')}
                                    className="flex-row items-center gap-1.5 mb-2.5 px-3 py-1.5 rounded-xl border bg-bg-primary-lighter border-border-input"
                                >
                                    <Iconify icon="heroicons:calendar" size={14}
                                             color={isDark ? '#9CA3AF' : '#64748B'}/>
                                    <AppText
                                        className={
                                            activeTarget === 'START'
                                                ? 'text-xs text-text-primary font-bold'
                                                : 'text-xs text-text-primary-lighter font-medium'
                                        }
                                    >
                                        {startDateFormatted}
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    onPress={() => handleOpenTimePicker('START')}
                                    className={
                                        activeTarget === 'START'
                                            ? 'w-full items-center justify-center py-3 rounded-2xl bg-accent-sky-bg border-accent-sky border-[1.5px]'
                                            : 'w-full items-center justify-center py-3 rounded-2xl bg-bg-primary-lighter border-border-input border'
                                    }
                                >
                                    <AppText
                                        className={
                                            activeTarget === 'START'
                                                ? 'text-base tracking-tight text-accent-sky font-bold'
                                                : 'text-base tracking-tight text-text-primary font-semibold'
                                        }
                                    >
                                        {startTimeFormatted}
                                    </AppText>
                                </Pressable>
                            </View>

                            {/* Center Arrow Divider */}
                            <View className="mt-5 px-2">
                                <Iconify
                                    icon="heroicons:arrow-right-20-solid"
                                    size={18}
                                    color={isDark ? '#9CA3AF' : '#64748B'}
                                />
                            </View>

                            {/* End Section */}
                            <View className="items-center flex-1">
                                <AppText
                                    className="text-[11px] font-bold tracking-wider mb-2 text-text-primary-lighter">
                                    ENDS
                                </AppText>
                                <Pressable
                                    onPress={() => handleOpenDatePicker('END')}
                                    className="flex-row items-center gap-1.5 mb-2.5 px-3 py-1.5 rounded-xl border bg-bg-primary-lighter border-border-input"
                                >
                                    <Iconify icon="heroicons:calendar" size={14}
                                             color={isDark ? '#9CA3AF' : '#64748B'}/>
                                    <AppText
                                        className={
                                            activeTarget === 'END'
                                                ? 'text-xs text-text-primary font-bold'
                                                : 'text-xs text-text-primary-lighter font-medium'
                                        }
                                    >
                                        {endDateFormatted}
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    onPress={() => handleOpenTimePicker('END')}
                                    className={
                                        activeTarget === 'END'
                                            ? 'w-full items-center justify-center py-3 rounded-2xl bg-accent-sky-bg border-accent-sky border-[1.5px]'
                                            : 'w-full items-center justify-center py-3 rounded-2xl bg-bg-primary-lighter border-border-input border'
                                    }
                                >
                                    <AppText
                                        className={
                                            activeTarget === 'END'
                                                ? 'text-base tracking-tight text-accent-sky font-bold'
                                                : 'text-base tracking-tight text-text-primary font-semibold'
                                        }
                                    >
                                        {endTimeFormatted}
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Elevated Wheel Picker Canvas */}
                    {!isAllDay && Platform.OS === 'ios' && (
                        <View
                            className="items-center justify-center my-4 rounded-3xl border overflow-hidden bg-bg-canvas border-border-input">
                            <DateTimePicker
                                key={activeTarget}
                                value={currentDateTime}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeChange}
                                themeVariant={isDark ? 'dark' : 'light'}
                                style={{height: 140, width: '100%'}}
                            />
                        </View>
                    )}

                    {!isAllDay && Platform.OS === 'android' && showTimePickerAndroid && (
                        <DateTimePicker
                            value={currentDateTime}
                            mode="time"
                            display="default"
                            onChange={handleTimeChange}
                        />
                    )}
                </View>

                {/* Date Picker Modal Trigger */}
                {showDatePicker && (
                    <DateTimePicker
                        value={currentDateTime}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={handleDateChange}
                        themeVariant={isDark ? 'dark' : 'light'}
                    />
                )}

                {/* Action Deck */}
                <View className="flex-row items-center gap-3 mt-4">
                    <Pressable
                        className="flex-1 items-center justify-center py-3.5 rounded-2xl border bg-bg-primary-lighter border-border-input active:opacity-80"
                        onPress={onClose}
                    >
                        <AppText className="text-15 font-semibold text-text-primary-lighter">
                            Cancel
                        </AppText>
                    </Pressable>

                    <Pressable
                        className="flex-[2] flex-row items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-bg-secondary shadow-md elevation-4 active:opacity-90"
                        onPress={handleSave}
                    >
                        <AppText className="text-white text-15 font-bold">
                            Confirm Schedule
                        </AppText>
                        <Iconify icon="heroicons:check-16-solid" size={18} color="#FFFFFF"/>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};