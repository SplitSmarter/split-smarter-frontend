import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import {View, Pressable, Switch, Platform} from 'react-native';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

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
    const colors = isDark ? COLORS.dark : COLORS.light;

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

    const elevatedSurface = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: colors.bg.primary,
                borderRadius: 36,
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.icon.lighter,
                width: 36,
                height: 4,
                borderRadius: 2,
            }}
        >
            <BottomSheetView className="flex-1 px-5 pb-6">
                <View className="flex-1">
                    {/* All Day Toggle Card */}
                    <View
                        className="mb-4 mt-2 flex-row items-center justify-between rounded-2xl border px-4 py-3"
                        style={elevatedSurface}
                    >
                        <View className="flex-row items-center gap-3">
                            <View
                                className="h-9 w-9 items-center justify-center rounded-xl"
                                style={{backgroundColor: colors.accent.skyBg}}
                            >
                                <Iconify icon="heroicons:clock" size={20} color={colors.accent.sky}/>
                            </View>
                            <View>
                                <AppText
                                    variant="body-large"
                                    className="text-[15px] font-semibold"
                                    style={{color: colors.text.primary}}
                                >
                                    All-Day Event
                                </AppText>
                                <AppText
                                    className="mt-0.5 text-xs"
                                    style={{color: colors.text.lighter}}
                                >
                                    Set schedule without specific hours
                                </AppText>
                            </View>
                        </View>
                        <Switch
                            value={isAllDay}
                            onValueChange={setIsAllDay}
                            trackColor={{
                                false: colors.bg.darker,
                                true: colors.brand.primary,
                            }}
                            thumbColor={colors.text.contrast}
                        />
                    </View>

                    {/* Start vs End DateTime Matrix */}
                    {!isAllDay && (
                        <View className="my-1 flex-row items-center justify-between">
                            <View className="flex-1 items-center">
                                <AppText
                                    className="mb-2 text-[11px] font-bold tracking-wider"
                                    style={{color: colors.text.lighter}}
                                >
                                    STARTS
                                </AppText>
                                <Pressable
                                    onPress={() => handleOpenDatePicker('START')}
                                    className="mb-2.5 flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5"
                                    style={elevatedSurface}
                                >
                                    <Iconify
                                        icon="heroicons:calendar"
                                        size={14}
                                        color={colors.icon.lighter}
                                    />
                                    <AppText
                                        className="text-xs font-medium"
                                        style={{
                                            color:
                                                activeTarget === 'START'
                                                    ? colors.text.primary
                                                    : colors.text.lighter,
                                            fontWeight: activeTarget === 'START' ? '700' : '500',
                                        }}
                                    >
                                        {startDateFormatted}
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    onPress={() => handleOpenTimePicker('START')}
                                    className="w-full items-center justify-center rounded-2xl border py-3"
                                    style={
                                        activeTarget === 'START'
                                            ? {
                                                  backgroundColor: colors.accent.skyBg,
                                                  borderColor: colors.accent.sky,
                                                  borderWidth: 1.5,
                                              }
                                            : {...elevatedSurface, borderWidth: 1}
                                    }
                                >
                                    <AppText
                                        className="text-base tracking-tight"
                                        style={{
                                            color:
                                                activeTarget === 'START'
                                                    ? colors.accent.sky
                                                    : colors.text.primary,
                                            fontWeight: activeTarget === 'START' ? '700' : '600',
                                        }}
                                    >
                                        {startTimeFormatted}
                                    </AppText>
                                </Pressable>
                            </View>

                            <View className="mt-5 px-2">
                                <Iconify
                                    icon="heroicons:arrow-right-20-solid"
                                    size={18}
                                    color={colors.icon.lighter}
                                />
                            </View>

                            <View className="flex-1 items-center">
                                <AppText
                                    className="mb-2 text-[11px] font-bold tracking-wider"
                                    style={{color: colors.text.lighter}}
                                >
                                    ENDS
                                </AppText>
                                <Pressable
                                    onPress={() => handleOpenDatePicker('END')}
                                    className="mb-2.5 flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5"
                                    style={elevatedSurface}
                                >
                                    <Iconify
                                        icon="heroicons:calendar"
                                        size={14}
                                        color={colors.icon.lighter}
                                    />
                                    <AppText
                                        className="text-xs font-medium"
                                        style={{
                                            color:
                                                activeTarget === 'END'
                                                    ? colors.text.primary
                                                    : colors.text.lighter,
                                            fontWeight: activeTarget === 'END' ? '700' : '500',
                                        }}
                                    >
                                        {endDateFormatted}
                                    </AppText>
                                </Pressable>

                                <Pressable
                                    onPress={() => handleOpenTimePicker('END')}
                                    className="w-full items-center justify-center rounded-2xl border py-3"
                                    style={
                                        activeTarget === 'END'
                                            ? {
                                                  backgroundColor: colors.accent.skyBg,
                                                  borderColor: colors.accent.sky,
                                                  borderWidth: 1.5,
                                              }
                                            : {...elevatedSurface, borderWidth: 1}
                                    }
                                >
                                    <AppText
                                        className="text-base tracking-tight"
                                        style={{
                                            color:
                                                activeTarget === 'END'
                                                    ? colors.accent.sky
                                                    : colors.text.primary,
                                            fontWeight: activeTarget === 'END' ? '700' : '600',
                                        }}
                                    >
                                        {endTimeFormatted}
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {!isAllDay && Platform.OS === 'ios' && (
                        <View
                            className="my-4 items-center justify-center overflow-hidden rounded-3xl border"
                            style={{
                                backgroundColor: colors.bg.canvas,
                                borderColor: colors.status.border,
                            }}
                        >
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

                {showDatePicker && (
                    <DateTimePicker
                        value={currentDateTime}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={handleDateChange}
                        themeVariant={isDark ? 'dark' : 'light'}
                    />
                )}

                <View className="mt-4 flex-row items-center gap-3">
                    <Pressable
                        className="flex-1 items-center justify-center rounded-2xl border py-3.5"
                        style={({pressed}) => [
                            elevatedSurface,
                            pressed ? {opacity: 0.8} : undefined,
                        ]}
                        onPress={onClose}
                    >
                        <AppText
                            className="text-15 font-semibold"
                            style={{color: colors.text.lighter}}
                        >
                            Cancel
                        </AppText>
                    </Pressable>

                    <Pressable
                        className="flex-[2] flex-row items-center justify-center gap-1.5 rounded-2xl py-3.5"
                        style={({pressed}) => ({
                            backgroundColor: colors.brand.primary,
                            elevation: 4,
                            shadowColor: COLORS.light.brand.primary,
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            opacity: pressed ? 0.9 : 1,
                        })}
                        onPress={handleSave}
                    >
                        <AppText
                            className="text-15 font-bold"
                            style={{color: colors.text.contrast}}
                        >
                            Confirm Schedule
                        </AppText>
                        <Iconify
                            icon="heroicons:check-16-solid"
                            size={18}
                            color={colors.text.contrast}
                        />
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};
