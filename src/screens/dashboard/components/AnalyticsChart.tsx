import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { FormattedAnalyticsPoint } from '../types/dashboard';

const { width } = Dimensions.get('window');

interface AnalyticsChartProps {
    data: FormattedAnalyticsPoint[];
    onSelectPoint: (point: FormattedAnalyticsPoint) => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, onSelectPoint }) => {
    return (
        <View className="items-center">
            <LineChart
                data={data}
                areaChart
                curved
                height={130}
                width={width - 65}
                adjustToWidth={true}
                initialSpacing={1}
                endSpacing={1}
                color="rgba(255, 255, 255, 0.95)"
                thickness={3}
                startFillColor="rgba(255, 255, 255, 0.35)"
                endFillColor="rgba(255, 255, 255, 0.0)"
                startOpacity={0.4}
                endOpacity={0.0}
                hideYAxisText
                hideRules
                hideAxesAndRules
                overflowTop={50}
                xAxisLabelTextStyle={{
                    color: 'rgba(255, 255, 255, 0.65)',
                    fontSize: 10,
                    fontWeight: '600',
                }}
                pointerConfig={{
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'rgba(255, 255, 255, 0.4)',
                    pointerStripWidth: 1.5,
                    strokeDashArray: [4, 4],
                    pointerColor: '#FFFFFF',
                    radius: 5,
                    pointerVanishDelay: 0,
                    initialPointerIndex: 2,
                    pointerComponent: () => (
                        <View className="w-4 h-4 rounded-full bg-white border-2 border-[#B22222] shadow-md" />
                    ),
                    pointerLabelComponent: (items: any[]) => {
                        const rawItem = Array.isArray(items) ? items[0] : items;
                        if (!rawItem) return null;

                        const itemVal = rawItem.value ?? rawItem.amount ?? 0;
                        const totalPoints = data.length;

                        let itemIndex = rawItem.dataIndex;
                        if (itemIndex === undefined || itemIndex === null) {
                            itemIndex = data.findIndex(
                                (d) => d.value === itemVal && d.label === rawItem.label
                            );
                        }

                        const matchedData = data[itemIndex] || rawItem;
                        const itemAmount = matchedData.amount ?? matchedData.value ?? 0;
                        const itemCategory = matchedData.category ?? 'Expense';
                        const itemDate = matchedData.date ?? '';

                        let dynamicMarginLeft = -45;
                        if (itemIndex >= 0) {
                            if (itemIndex <= 2) {
                                dynamicMarginLeft = 0;
                            } else if (itemIndex >= totalPoints - 3) {
                                dynamicMarginLeft = -95;
                            }
                        }

                        const dynamicMarginTop = itemAmount > 1000 ? -15 : -35;

                        return (
                            <View
                                pointerEvents="none"
                                className="bg-white/95 rounded-2xl p-2.5 shadow-2xl min-w-[115px] border border-white/40"
                                style={{
                                    marginTop: dynamicMarginTop,
                                    marginLeft: dynamicMarginLeft,
                                }}
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-black font-extrabold text-xs">
                                        ${itemAmount.toFixed(2)}
                                    </Text>
                                    <View className="bg-black/90 rounded-full px-1.5 py-0.5 ml-1">
                                        <Text className="text-white text-[8px] font-bold">
                                            {itemCategory}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-gray-500 text-[9px] mt-0.5 font-medium">
                                    for {itemDate}
                                </Text>
                            </View>
                        );
                    },
                }}
                onPress={(item: any) => {
                    if (!item) return;
                    const dataObj = Array.isArray(item) ? item[0] : item;
                    onSelectPoint(dataObj);
                }}
            />
        </View>
    );
};