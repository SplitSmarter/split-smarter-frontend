import React, { useState, useMemo } from 'react';
import { Modal, View, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';

// Internal Splitted Modules
import { ScheduleTabs } from './ScheduleTabs';
import { PeriodSelector } from './PeriodSelector';
import { CalendarGrid } from './CalendarGrid';
import { WeekdaySelector } from './WeekdaySelector';
import { SelectionTags } from './SelectionTags';
import {
    DateComponentPayload,
    DateComponentUnion,
    RecurringPeriod,
    SchedulingTab
} from "@/src/constants/expense/schedule";
import { Month, Weekday } from '@/src/api/dto/expense/constant';


interface ExpenseScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSaveSchedule: (payload: DateComponentPayload) => void;
    initialDate?: string;
}

export const ExpenseScheduleModal = ({ visible, onClose, onSaveSchedule, initialDate }: ExpenseScheduleModalProps) => {
    const [activeTab, setActiveTab] = useState<SchedulingTab>('one_time');
    const [selectedPeriod, setSelectedPeriod] = useState<RecurringPeriod>('monthly');

    // Day Selection states
    const [selectedDays, setSelectedDays] = useState<number[]>([17]);
    const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>([]);
    const [intervalValue, setIntervalValue] = useState<number>(1);

    // Human Readable String Computed Property Summary
    const summaryText = useMemo(() => {
        if (activeTab === 'one_time') return "Occurs once on selected target calendar point.";
        if (selectedPeriod === 'daily') return `Occurs every ${intervalValue} day${intervalValue > 1 ? 's' : ''}.`;
        if (selectedPeriod === 'weekly') return `Occurs every week on explicit chosen target weekdays.`;

        if (selectedDays.length === 0) return "Select calendar days to construct recurring execution loop.";
        const daysSorted = [...selectedDays].sort((a, b) => a - b).join(' and ');
        return `Occurs every ${intervalValue} month${intervalValue > 1 ? 's' : ''} on day ${daysSorted}`;
    }, [activeTab, selectedPeriod, selectedDays, intervalValue]);

    // Format active items into visual display tags dynamically
    const summaryTags = useMemo(() => {
        if (activeTab === 'one_time') return [];
        return selectedDays.map(day => ({
            id: String(day),
            label: `${day}th August` // matches image formatting style
        }));
    }, [activeTab, selectedDays]);

    const handleToggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleToggleWeekday = (day: Weekday) => {
        setSelectedWeekdays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const handleRemoveTag = (id: string) => {
        setSelectedDays(prev => prev.filter(d => String(d) !== id));
    };

    const handleSelectIntervalCycle = () => {
        Alert.prompt(
            "Set Loop Interval",
            "Specify continuous sequence gap interval step metrics (e.g. 3 for every 3 months):",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Set",
                    onPress: (val) => {
                        const parsed = parseInt(val || '1', 10);
                        if (!isNaN(parsed) && parsed > 0) setIntervalValue(parsed);
                    }
                }
            ],
            "plain-text",
            String(intervalValue)
        );
    };

    const handleCompilePayload = () => {
        let payload: DateComponentPayload;

        if (activeTab === 'one_time') {
            payload = {
                date: initialDate || new Date().toISOString().split('T')[0],
                is_recurring: false,
                recurring_details: null
            };
        } else {
            // Map UI selections to backend DateWeekly | DateMonthly | DateYearly | DateCustom
            let selectedValues: DateComponentUnion[] = [];
            const startYmd = (initialDate || new Date().toISOString()).split('T')[0];
            const startMonthIndex = Number(startYmd.split('-')[1]) - 1;
            const months: Month[] = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december',
            ];
            const startMonth = months[Math.max(0, Math.min(11, startMonthIndex))];

            if (selectedPeriod === 'weekly') {
                if (selectedWeekdays.length === 0) {
                    Alert.alert('Select weekdays', 'Pick at least one weekday for a weekly schedule.');
                    return;
                }
                selectedValues = selectedWeekdays.map((d) => ({weekday: d}));
            } else if (selectedPeriod === 'monthly') {
                selectedValues = selectedDays.map((d) => ({day: d}));
            } else if (selectedPeriod === 'yearly') {
                selectedValues = selectedDays.map((d) => ({day: d, month: startMonth}));
            } else if (selectedPeriod === 'daily') {
                selectedValues = [];
            }

            payload = {
                date: undefined,
                is_recurring: true,
                recurring_details: {
                    recurring_period: selectedPeriod, // lowercase: daily|weekly|monthly|yearly
                    interval: intervalValue,
                    selected_values: selectedValues,
                    start_date: startYmd,
                    end_date: undefined,
                },
            };
        }

        onSaveSchedule(payload);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <SafeAreaView className="flex-1 bg-white">

                {/* 1. Header Navigation Bar Component */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Pressable onPress={onClose} className="p-1 active:opacity-60">
                        <Iconify icon="heroicons:chevron-left" size={26} color="#111827" />
                    </Pressable>
                    <AppText variant="h3" className="text-gray-900 font-bold text-center flex-1">
                        Select Date
                    </AppText>
                    <View className="w-8" />
                </View>

                <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>

                    {/* 2. Primary Tabs (One-Time vs Recurring Selector) */}
                    <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {activeTab === 'recurring' && (
                        <>
                            {/* 3. Horizontal Period Frequency Picker Carousel Component */}
                            <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />

                            {/* 4. Active Selection Removables Row Panel */}
                            <SelectionTags tags={summaryTags} onRemoveTag={handleRemoveTag} />

                            {/* 5. Dynamic Engine Context Board Modulators */}
                            {selectedPeriod === 'weekly' ? (
                                <WeekdaySelector selectedWeekdays={selectedWeekdays} onToggleWeekday={handleToggleWeekday} />
                            ) : selectedPeriod === 'daily' ? (
                                <View className="p-8 mx-4 bg-bg-secondary-lighter rounded-3xl items-center border border-bg-secondary/20">
                                    <AppText className="text-bg-secondary font-semibold mb-2">Daily Configuration Pool Active</AppText>
                                    <AppText className="text-gray-500 text-center text-sm">Triggers automatically across ongoing dates based on selected operational interval metrics.</AppText>
                                </View>
                            ) : (
                                <CalendarGrid
                                    selectedDays={selectedDays}
                                    onToggleDay={handleToggleDay}
                                    showMonthHeader={true}
                                    monthName={selectedPeriod === 'yearly' ? "August" : "Monthly Options"}
                                    intervalValue={intervalValue}
                                    onIntervalChangeClick={selectedPeriod === 'monthly' ? handleSelectIntervalCycle : undefined}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'one_time' && (
                        <CalendarGrid selectedDays={selectedDays} onToggleDay={handleToggleDay} monthName="Target Execution Day" />
                    )}

                </ScrollView>

                {/* 6. Human Summary & Double Sticky Confirmation Action Deck */}
                <View className="p-6 bg-gray-50 border-t border-gray-100 items-center">
                    <View className="flex-row items-center bg-gray-200/60 rounded-2xl px-5 py-3 w-full mb-4">
                        <Iconify icon="heroicons:calendar" size={20} color="#374151" />
                        <AppText variant="body-small" className="ml-3 text-gray-700 font-semibold flex-1" numberOfLines={2}>
                            {summaryText}
                        </AppText>
                    </View>

                    <AppButton variant="primary" className="w-full py-3.5 rounded-full" onPress={handleCompilePayload}>
                        Set Schedule
                    </AppButton>
                </View>

            </SafeAreaView>
        </Modal>
    );
};