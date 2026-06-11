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
    const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
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

    const handleToggleWeekday = (day: string) => {
        setSelectedWeekdays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
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
            // Map selected state array blocks directly down to strict Pydantic definitions
            let selectedValues: DateComponentUnion[] = [];

            if (selectedPeriod === 'weekly') {
                selectedValues = selectedWeekdays.map(d => ({ weekday: d as unknown as Weekday }));
            } else if (selectedPeriod === 'monthly' || selectedPeriod === 'daily') {
                selectedValues = selectedDays.map(d => ({ day: d }));
            } else if (selectedPeriod === 'yearly') {
                selectedValues = selectedDays.map(d => ({ day: d, month: 'August' as unknown as Month }));
            }

            payload = {
                date: undefined,
                is_recurring: true,
                recurring_details: {
                    recurring_period: selectedPeriod.toUpperCase(), // converts to backend ENUM token format
                    interval: intervalValue,
                    selected_values: selectedValues,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: undefined // Forever loop
                }
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
                                <View className="p-8 mx-4 bg-emerald-700/10 rounded-3xl items-center border border-emerald-700/20">
                                    <AppText className="text-emerald-800 font-semibold mb-2">Daily Configuration Pool Active</AppText>
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

                    <AppButton variant="primary" className="w-full bg-emerald-700 py-3.5 rounded-full" onPress={handleCompilePayload}>
                        Set Schedule
                    </AppButton>
                </View>

            </SafeAreaView>
        </Modal>
    );
};