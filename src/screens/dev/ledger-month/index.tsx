import React, {useCallback, useMemo, useState} from 'react';
import {ScrollView, View, Pressable} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {useExpenseDraftStore} from '@/src/store/draft/expenseDraftStore';
import {PLATINUM_HERO_GRADIENT} from '@/src/screens/dashboard/constants/dashboard.constants';
import {useLedgerMonth} from '@/src/screens/dev/ledger-month/hooks/useLedgerMonth';
import {MonthStatStrip} from '@/src/screens/dev/ledger-month/components/MonthStatStrip';
import {LedgerMonthGrid} from '@/src/screens/dev/ledger-month/components/LedgerMonthGrid';
import {LedgerBudgetStrip} from '@/src/screens/dev/ledger-month/components/LedgerBudgetStrip';
import {LedgerDaySheet} from '@/src/screens/dev/ledger-month/components/LedgerDaySheet';
import {LedgerFiltersSheet} from '@/src/screens/dev/ledger-month/components/LedgerFiltersSheet';
import {formatInr} from '@/src/screens/dev/ledger-month/utils/formatInr';

/**
 * Dev playground: Monday-start ledger month with October 2026 dummy data.
 * Wired from the settings tab for visual QA.
 */
export default function LedgerMonthPlayground() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const gradient = isDark ? PLATINUM_HERO_GRADIENT.dark : PLATINUM_HERO_GRADIENT.light;
    const router = useRouter();
    const setExpenseDate = useExpenseDraftStore((s) => s.setExpenseDate);

    const ledger = useLedgerMonth();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const handleSelectDay = useCallback(
        (day: number) => {
            ledger.setSelectedDay(day);
            setSheetOpen(true);
        },
        [ledger.setSelectedDay],
    );

    const handleAddExpense = useCallback(
        (day: number) => {
            const iso = new Date(
                Date.UTC(ledger.year, ledger.month - 1, day, 12, 0, 0),
            ).toISOString();
            setExpenseDate(iso);
            setSheetOpen(false);
            setTimeout(() => {
                router.push('/(authenticated)/expense/add');
            }, 200);
        },
        [ledger.year, ledger.month, router, setExpenseDate],
    );

    const inMemoryDay =
        ledger.memoryVisible &&
        ledger.selectedDay != null &&
        ledger.selectedDay >= ledger.memory.startDay &&
        ledger.selectedDay <= ledger.memory.endDay;

    const heroAmount = ledger.cells.reduce((sum, c) => sum + c.postedSumInr, 0);
    const heroAmountLabel =
        ledger.lens === 'paid'
            ? 'You paid'
            : ledger.lens === 'total'
              ? 'Full expenses'
              : 'Your share';

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (ledger.lens !== 'share') count += 1;
        if (ledger.scope !== 'all') count += 1;
        if (!ledger.showUpcoming) count += 1;
        if (!ledger.showMemory) count += 1;
        if (ledger.openOnly) count += 1;
        return count;
    }, [
        ledger.lens,
        ledger.scope,
        ledger.showUpcoming,
        ledger.showMemory,
        ledger.openOnly,
    ]);

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <ScrollView
                className="flex-1"
                style={{backgroundColor: heroStatusBar}}
                contentContainerStyle={{paddingBottom: 120, flexGrow: 1}}
                showsVerticalScrollIndicator={false}
            >
                {/* Flat-bottom hero — curve lives on the sheet below (inverted U). */}
                <LinearGradient
                    colors={[...gradient]}
                    start={{x: 0.1, y: 0.1}}
                    end={{x: 0.9, y: 0.9}}
                    className="px-5 pt-1"
                    style={{paddingBottom: 44}}
                >
                    <View className="mb-3 flex-row items-center justify-between">
                        <Pressable
                            onPress={ledger.goPrevMonth}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Previous month"
                            className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
                        >
                            <Iconify
                                icon="heroicons:chevron-left"
                                size={20}
                                color={COLORS.light.text.contrast}
                            />
                        </Pressable>

                        <View className="items-center px-2">
                            <AppText
                                variant="caption-xs"
                                className="uppercase font-semibold tracking-wider text-white/70"
                            >
                                Ledger calendar
                            </AppText>
                            <AppText variant="h4" className="font-bold text-white">
                                {ledger.monthLabel}
                            </AppText>
                        </View>

                        <Pressable
                            onPress={ledger.goNextMonth}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Next month"
                            className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
                        >
                            <Iconify
                                icon="heroicons:chevron-right"
                                size={20}
                                color={COLORS.light.text.contrast}
                            />
                        </Pressable>
                    </View>

                    <View className="items-center">
                        <AppText
                            variant="caption-xs"
                            className="mb-0.5 font-semibold uppercase tracking-wider text-white/70"
                        >
                            {heroAmountLabel}
                        </AppText>
                        <AppText
                            variant="h1"
                            className="font-extrabold tracking-tight text-white"
                        >
                            {formatInr(heroAmount)}
                        </AppText>
                    </View>
                </LinearGradient>

                {/* Inverted-U sheet: rounded top overlapping only the hero padding, not the amount. */}
                <View
                    className="flex-1 gap-y-6 px-5 pb-6 pt-3"
                    style={{
                        marginTop: -20,
                        backgroundColor: colors.bg.primary,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        overflow: 'hidden',
                        minHeight: 480,
                    }}
                >
                    <LedgerMonthGrid
                        cells={ledger.cells}
                        leadingBlanks={ledger.leadingBlanks}
                        selectedDay={ledger.selectedDay}
                        onSelectDay={handleSelectDay}
                        onFilterPress={() => setFiltersOpen(true)}
                        activeFilterCount={activeFilterCount}
                    />

                    <MonthStatStrip
                        shareInr={ledger.totals.shareInr}
                        paidInr={ledger.totals.paidInr}
                        openShareInr={ledger.totals.openShareInr}
                        postedCount={ledger.totals.postedCount}
                    />

                    <LedgerBudgetStrip budgets={ledger.budgetProgress} />
                </View>
            </ScrollView>

            <LedgerFiltersSheet
                visible={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                lens={ledger.lens}
                onLensChange={ledger.setLens}
                scope={ledger.scope}
                onScopeChange={ledger.setScope}
                showUpcoming={ledger.showUpcoming}
                onToggleUpcoming={() => ledger.setShowUpcoming((v) => !v)}
                showMemory={ledger.showMemory}
                onToggleMemory={() => ledger.setShowMemory((v) => !v)}
                openOnly={ledger.openOnly}
                onToggleOpenOnly={() => ledger.setOpenOnly((v) => !v)}
            />

            <LedgerDaySheet
                visible={sheetOpen}
                day={ledger.selectedDay}
                monthLabel={ledger.monthLabel}
                events={ledger.dayEvents}
                lens={ledger.lens}
                memory={ledger.memory}
                inMemory={inMemoryDay}
                onClose={() => setSheetOpen(false)}
                onAddExpense={handleAddExpense}
            />
        </ScreenWrapper>
    );
}
