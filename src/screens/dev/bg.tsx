import React, {useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {LineChart} from 'react-native-gifted-charts';
import {
    Ionicons,
    Feather,
    MaterialCommunityIcons,
    Octicons,
    FontAwesome5,
} from '@expo/vector-icons';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";

const {width} = Dimensions.get('window');

// ================= DATA MODELS =================
export interface ExpenseDataPoint {
    id: string;
    timestamp: string;
    amount: number;
    category: string;
}

const RAW_EXPENSES: ExpenseDataPoint[] = [
    {id: '1', timestamp: '2026-01-15T10:20:00.000Z', amount: 420.5, category: 'Groceries'},
    {id: '2', timestamp: '2026-02-18T14:12:00.000Z', amount: 310.8, category: 'Shopping'},
    {id: '3', timestamp: '2026-03-22T08:45:00.000Z', amount: 648.24, category: 'Utilities'},
    {id: '4', timestamp: '2026-04-10T19:30:00.000Z', amount: 890.1, category: 'Dining Out'},
    {id: '5', timestamp: '2026-05-05T12:00:00.000Z', amount: 720.4, category: 'Entertainment'},
    {id: '6', timestamp: '2026-06-28T16:15:00.000Z', amount: 1150.0, category: 'Travel'},
    {id: '7', timestamp: '2026-07-14T09:10:00.000Z', amount: 980.0, category: 'Groceries'},
    {id: '8', timestamp: '2026-08-19T11:25:00.000Z', amount: 1050.5, category: 'Shopping'},
    {id: '9', timestamp: '2026-09-27T15:43:08.621Z', amount: 1280.75, category: 'Health'},
    {id: '10', timestamp: '2026-10-02T18:00:00.000Z', amount: 1100.0, category: 'Subscriptions'},
    {id: '11', timestamp: '2026-11-12T11:00:00.000Z', amount: 1150.0, category: 'Subscriptions'},
    {id: '12', timestamp: '2026-12-05T12:00:00.000Z', amount: 1300.0, category: 'Subscriptions'},
    {id: '13', timestamp: '2026-12-05T12:05:00.000Z', amount: 1310.0, category: 'Subscriptions'},
    {id: '14', timestamp: '2026-12-05T12:10:00.000Z', amount: 1320.0, category: 'Subscriptions'},
    {id: '15', timestamp: '2026-12-05T12:15:00.000Z', amount: 1330.0, category: 'Subscriptions'},
];

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthShort = (isoString: string) => {
    const d = new Date(isoString);
    return MONTH_NAMES_SHORT[d.getMonth()] || '';
};

const getFormattedFullDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

const ANALYTICS_DATA = RAW_EXPENSES.map((item, idx) => ({
    ...item,
    value: item.amount,
    label: getMonthShort(item.timestamp),
    date: getFormattedFullDate(item.timestamp),
    dataIndex: idx,
}));

export default function CompleteDashboardScreen() {
    const [selectedPoint, setSelectedPoint] = useState(ANALYTICS_DATA[2]);

    const displayAmount = selectedPoint?.amount ?? selectedPoint?.value ?? 0;
    const displayCategory = selectedPoint?.category ?? 'General';

    return (
        <ScreenWrapper
            backgroundColor="#8B0000"
            statusBarStyle="light-content"
            withPadding={false}
            className="bg-black"
        >
            <ScrollView
                className="flex-1 bg-black"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 110}}
            >
                {/* ================= SECTION 1: HEADER & BALANCE CARD (NATIVE CURVED BOTTOM) ================= */}
                <LinearGradient
                    colors={['#8B0000', '#B22222', '#D2691E', '#CC5500']}
                    start={{x: 0.1, y: 0.1}}
                    end={{x: 0.9, y: 0.9}}
                    className="pt-2 px-5 pb-10 rounded-b-3xl overflow-hidden"
                >
                    {/* Header Bar */}
                    <View className="flex-row justify-between items-center mb-5">
                        <Image
                            source={{
                                uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                            }}
                            className="w-10 h-10 rounded-full border-2 border-white/30"
                        />
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/20">
                            <Ionicons name="notifications-outline" size={20} color="white"/>
                        </TouchableOpacity>
                    </View>

                    {/* Main Balance Display */}
                    <View className="items-center mb-4">
                        <Text className="text-white/70 text-xs font-semibold tracking-wider uppercase mb-1">
                            Total Balance
                        </Text>
                        <Text className="text-white text-4xl font-extrabold tracking-tight mb-2">
                            $12,680.42
                        </Text>
                        <View
                            className="bg-white/20 px-3 py-1 rounded-full flex-row items-center border border-white/20">
                            <Feather name="arrow-up-right" size={13} color="white"/>
                            <Text className="text-white text-xs font-medium ml-1">
                                {displayCategory}
                            </Text>
                        </View>
                    </View>

                    <View className="items-center">
                        <LineChart
                            data={ANALYTICS_DATA}
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
                                    <View
                                        className="w-4 h-4 rounded-full bg-white border-2 border-[#B22222] shadow-md"/>
                                ),
                                pointerLabelComponent: (items: any[]) => {
                                    const rawItem = Array.isArray(items) ? items[0] : items;
                                    if (!rawItem) return null;

                                    const itemVal = rawItem.value ?? rawItem.amount ?? 0;
                                    const totalPoints = ANALYTICS_DATA.length;

                                    let itemIndex = rawItem.dataIndex;
                                    if (itemIndex === undefined || itemIndex === null) {
                                        itemIndex = ANALYTICS_DATA.findIndex(
                                            (d) => d.value === itemVal && d.label === rawItem.label
                                        );
                                    }

                                    const matchedData = ANALYTICS_DATA[itemIndex] || rawItem;
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
                                setSelectedPoint(dataObj);
                            }}
                        />
                    </View>
                </LinearGradient>

                {/* ================= SECTION 2: ACTION BUTTONS ================= */}
                <View className="flex-row items-center justify-between px-5 -mt-5 mb-6 z-10">
                    <TouchableOpacity
                        className="flex-1 bg-white/95 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl mr-2 border border-white/20">
                        <Feather name="arrow-up-right" size={18} color="#000"/>
                        <Text className="text-black font-semibold ml-2">Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-12 h-12 bg-white/95 rounded-2xl items-center justify-center shadow-xl mr-2 border border-white/20">
                        <Octicons name="arrow-switch" size={18} color="#000"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-white/95 flex-row items-center justify-center py-3.5 px-3 rounded-2xl shadow-xl border border-white/20">
                        <Feather name="arrow-down-left" size={18} color="#000"/>
                        <Text className="text-black font-semibold ml-2">Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* ================= SECTION 3: RECENT TRANSACTIONS ================= */}
                <View className="px-5 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg font-bold">
                            Recent Transactions
                        </Text>
                        <TouchableOpacity>
                            <Text className="text-white/50 text-xs font-semibold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-col space-y-3">
                        <View className="flex-row items-center justify-between py-2 border-b border-white/5">
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="credit-card-outline" size={20} color="#FF4D4D"/>
                                </View>
                                <View className="justify-center">
                                    <Text className="text-white font-semibold">Adobe Creative Cloud</Text>
                                    <Text className="text-white/40 text-xs mt-0.5">Today, 09:42</Text>
                                </View>
                            </View>
                            <Text className="text-white font-bold">-$59.99</Text>
                        </View>

                        <View className="flex-row items-center justify-between py-2 border-b border-white/5">
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center mr-3">
                                    <FontAwesome5 name="stripe" size={18} color="#635BFF"/>
                                </View>
                                <View className="justify-center">
                                    <Text className="text-white font-semibold">Stripe Payout</Text>
                                    <Text className="text-white/40 text-xs mt-0.5">Today, 08:15</Text>
                                </View>
                            </View>
                            <Text className="text-emerald-400 font-bold">+$187.50</Text>
                        </View>

                        <View className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 items-center justify-center mr-3">
                                    <Feather name="box" size={18} color="#FFF"/>
                                </View>
                                <View className="justify-center">
                                    <Text className="text-white font-semibold">Office Supplies</Text>
                                    <Text className="text-white/40 text-xs mt-0.5">Jun 28, 10:22</Text>
                                </View>
                            </View>
                            <Text className="text-white font-bold">-$24.00</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}