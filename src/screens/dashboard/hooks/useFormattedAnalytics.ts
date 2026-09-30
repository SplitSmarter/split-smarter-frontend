import { useMemo, useState } from 'react';
import { ExpenseDataPoint, FormattedAnalyticsPoint } from '../types/dashboard';
import { getFormattedFullDate, getMonthShort } from '../utils/dashboard.utils';

export const useFormattedAnalytics = (rawData: ExpenseDataPoint[]) => {
    const analyticsData: FormattedAnalyticsPoint[] = useMemo(() => {
        return rawData.map((item, idx) => ({
            ...item,
            value: item.amount,
            label: getMonthShort(item.timestamp),
            date: getFormattedFullDate(item.timestamp),
            dataIndex: idx,
        }));
    }, [rawData]);

    const [selectedPoint, setSelectedPoint] = useState<FormattedAnalyticsPoint | null>(
        analyticsData[2] || null
    );

    const displayAmount = selectedPoint?.amount ?? selectedPoint?.value ?? 0;
    const displayCategory = selectedPoint?.category ?? 'General';

    return {
        analyticsData,
        selectedPoint,
        setSelectedPoint,
        displayAmount,
        displayCategory,
    };
};