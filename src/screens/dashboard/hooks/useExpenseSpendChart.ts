import {useEffect, useMemo, useState} from 'react';
import {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {ExpenseSpendPoint} from '../types/dashboard';
import {mapExpensesToChartPoints} from '../utils/mappers';

/**
 * Chart series is 1:1 with expenses: each point is that expense's
 * user_share (spend) converted via that expense's exchange_rate.
 */
export const useExpenseSpendChart = (
    expenses: ExpenseDetailsBasicResponse[],
    userCurrency: string
) => {
    const spendChartData: ExpenseSpendPoint[] = useMemo(
        () => mapExpensesToChartPoints(expenses, userCurrency),
        [expenses, userCurrency]
    );

    const defaultIndex = Math.min(2, Math.max(0, spendChartData.length - 1));

    const [selectedPoint, setSelectedPoint] = useState<ExpenseSpendPoint | null>(
        () => spendChartData[defaultIndex] ?? null
    );

    useEffect(() => {
        const nextIndex = Math.min(2, Math.max(0, spendChartData.length - 1));
        setSelectedPoint(spendChartData[nextIndex] ?? null);
    }, [spendChartData]);

    const selectedCategory = selectedPoint?.category ?? 'Spend';

    return {
        spendChartData,
        selectedPoint,
        setSelectedPoint,
        selectedCategory,
    };
};
