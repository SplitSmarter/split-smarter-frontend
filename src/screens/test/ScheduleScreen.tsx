import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { themeStore } from '@/src/store/themeStore';
import {
    SelectDateBottomSheet,
    DateSelectionResult,
    ExpenseRecurringPeriod,
    EndType,
} from './SelectDateBottomSheet';

export const ScheduledExpenseConfigScreen = () => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState<boolean>(false);
    const [selectedSchedule, setSelectedSchedule] = useState<DateSelectionResult | null>(null);

    const handleConfirmSchedule = (result: DateSelectionResult) => {
        setSelectedSchedule(result);
    };

    const formatScheduleDisplay = (schedule: DateSelectionResult) => {
        if (!schedule.isRecurring) {
            return `One-time on ${schedule.selectedDate}`;
        }

        const { recurringPeriod, interval, endType, occurrenceCount, endDate, startDate } = schedule;
        let periodText = `Every ${interval > 1 ? interval + ' ' : ''}${recurringPeriod.toLowerCase()}`;

        if (interval > 1) {
            periodText += 's';
        }

        let endText = '';
        if (endType === EndType.NEVER) {
            endText = 'forever';
        } else if (endType === EndType.COUNT) {
            endText = `for ${occurrenceCount} times`;
        } else if (endType === EndType.UNTIL) {
            endText = `until ${endDate}`;
        }

        return `${periodText} starting ${startDate} (${endText})`;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F8F8' }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Screen Header */}
                <View className="mb-6">
                    <AppText variant="h2" className="font-bold text-text-primary">
                        Recurring Expense
                    </AppText>
                    <AppText className="text-text-secondary mt-1">
                        Configure dates and recurrence options for this entry.
                    </AppText>
                </View>

                {/* Date / Repeat Trigger Button Card */}
                <Pressable
                    onPress={() => setIsBottomSheetVisible(true)}
                    className="flex-row items-center justify-between p-4 rounded-2xl bg-gray-200 dark:bg-zinc-800 active:opacity-70"
                >
                    <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View className="p-2.5 rounded-xl bg-blue-500/10">
                            <Iconify
                                icon="heroicons:calendar-days"
                                size={22}
                                color="#007AFF"
                            />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-xs text-text-secondary font-medium uppercase">
                                Repeat Pattern
                            </AppText>
                            <AppText className="text-base font-semibold text-text-primary mt-0.5">
                                {selectedSchedule
                                    ? formatScheduleDisplay(selectedSchedule)
                                    : "Select date or repeat rule"}
                            </AppText>
                        </View>
                    </View>
                    <Iconify
                        icon="heroicons:chevron-right"
                        size={20}
                        color={isDark ? '#A1A1AA' : '#71717A'}
                    />
                </Pressable>

                {/* Payload Debug Result Box */}
                {selectedSchedule && (
                    <View className="mt-6 p-4 rounded-2xl bg-gray-200/60 dark:bg-zinc-900 border border-gray-500/10">
                        <View className="flex-row items-center justify-between mb-2">
                            <AppText className="text-xs font-semibold text-text-secondary uppercase">
                                Validated Payload
                            </AppText>
                            <View className="px-2 py-0.5 rounded-full bg-green-500/10">
                                <AppText className="text-xs text-green-500 font-semibold">
                                    {selectedSchedule.isRecurring ? 'Recurring' : 'One-time'}
                                </AppText>
                            </View>
                        </View>
                        <AppText style={styles.jsonCode}>
                            {JSON.stringify(selectedSchedule, null, 2)}
                        </AppText>
                    </View>
                )}
            </ScrollView>

            {/* Date & Recurrence Picker Bottom Sheet */}
            <SelectDateBottomSheet
                visible={isBottomSheetVisible}
                initialDate={selectedSchedule?.isRecurring ? selectedSchedule.startDate : selectedSchedule?.selectedDate}
                onClose={() => setIsBottomSheetVisible(false)}
                onConfirm={handleConfirmSchedule}
            />
        </SafeAreaView>
    );
};

ScheduledExpenseConfigScreen.displayName = 'ScheduledExpenseConfigScreen';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 16,
    },
    jsonCode: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#34C759',
    },
});

export default ScheduledExpenseConfigScreen;