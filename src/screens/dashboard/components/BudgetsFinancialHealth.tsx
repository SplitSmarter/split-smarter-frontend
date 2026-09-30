import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from "@/src/components/common/AppText";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {BudgetGoal} from '../types/dashboard';

interface BudgetsFinancialHealthProps {
    budgets: BudgetGoal[];
    onCreateNewPress?: () => void;
}

export const BudgetsFinancialHealth: React.FC<BudgetsFinancialHealthProps> = ({
                                                                                  budgets,
                                                                                  onCreateNewPress,
                                                                              }) => {
    return (
        <View className="px-5 mb-6">
            {/* Header / Title Bar */}
            <View className="flex-row justify-between items-center mb-4">
                <AppText variant="h4" className="text-white font-bold">
                    Budgets & Goals
                </AppText>
                <TouchableOpacity onPress={onCreateNewPress} activeOpacity={0.7}>
                    <AppText variant="body-small" className="text-white/50 font-semibold">
                        Create New
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* Budget Cards List */}
            <View className="space-y-3">
                {budgets.map((budget) => {
                    const isLinear = budget.type === 'linear';
                    const remaining = budget.totalAmount - budget.usedAmount;

                    // Categories slicing logic (Max 3 visible + overflow count badge)
                    const categories = budget.categories || [];
                    const maxVisible = 3;
                    const visibleCategories = categories.slice(0, maxVisible);
                    const overflowCount = categories.length - maxVisible;

                    return (
                        <View
                            key={budget.id}
                            className="bg-zinc-900/80 p-4 rounded-3xl border border-white/10 shadow-2xl"
                        >
                            {/* Card Header: Title & Status / Remaining Pill */}
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1 pr-2">
                                    <AppText variant="body-base" className="text-white font-bold">
                                        {budget.title}
                                    </AppText>
                                    <AppText variant="caption-xs" className="text-white/40 mt-0.5 font-medium">
                                        {budget.statusText}
                                    </AppText>
                                </View>

                                {isLinear && (
                                    <View
                                        className="bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                        <AppText variant="caption-xs" className="text-emerald-400 font-bold">
                                            {budget.currencySymbol}{remaining.toLocaleString('en-IN')} left
                                        </AppText>
                                    </View>
                                )}
                            </View>

                            {/* Card Body: Progress (Linear vs Ring) */}
                            {isLinear ? (
                                /* Linear Progress Bar */
                                <View className="mt-1">
                                    <View className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                        <View
                                            style={{
                                                width: `${Math.min(budget.progressPercent, 100)}%`,
                                                backgroundColor: '#FF7A00',
                                            }}
                                            className="h-full rounded-full"
                                        />
                                    </View>
                                    <View className="flex-row justify-between items-center mt-2">
                                        <AppText variant="caption-xs" className="text-white/40 font-medium">
                                            {budget.currencySymbol}{budget.usedAmount.toLocaleString('en-IN')} spent
                                        </AppText>
                                        <AppText variant="caption-xs" className="text-white/80 font-bold">
                                            {budget.progressPercent}% used
                                        </AppText>
                                    </View>
                                </View>
                            ) : (
                                /* Ring Progress Layout */
                                <View className="flex-row items-center justify-between pt-1">
                                    <View className="w-12 h-12 items-center justify-center relative">
                                        <Svg height="48" width="48" viewBox="0 0 36 36">
                                            <Circle
                                                cx="18"
                                                cy="18"
                                                r="15.915"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="3.5"
                                                fill="transparent"
                                            />
                                            <Circle
                                                cx="18"
                                                cy="18"
                                                r="15.915"
                                                stroke="#FF7A00"
                                                strokeWidth="3.5"
                                                strokeDasharray={`${budget.progressPercent}, 100`}
                                                strokeLinecap="round"
                                                fill="transparent"
                                                transform="rotate(-90 18 18)"
                                            />
                                        </Svg>
                                        <AppText
                                            variant="caption-xs"
                                            className="absolute text-white font-bold text-[10px]"
                                        >
                                            {budget.progressPercent}%
                                        </AppText>
                                    </View>

                                    <View className="items-end">
                                        <AppText variant="caption-xs" className="text-white/40 font-medium">
                                            Goal Target
                                        </AppText>
                                        <AppText variant="body-base" className="text-white font-extrabold mt-0.5">
                                            {budget.currencySymbol}{budget.totalAmount.toLocaleString('en-IN')}
                                        </AppText>
                                    </View>
                                </View>
                            )}

                            {/* Card Footer: Category Images Row */}
                            {categories.length > 0 && (
                                <View
                                    className="flex-row items-center justify-between pt-3 mt-3 border-t border-white/5">
                                    <AppText variant="caption-xs" className="text-white/30 font-medium text-[10px]">
                                        Categories
                                    </AppText>

                                    <View className="flex-row items-center space-x-1.5">
                                        {visibleCategories.map((cat) => (
                                            <View
                                                key={cat.id}
                                                className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden items-center justify-center p-1"
                                            >
                                                <AppImageV2
                                                    id={cat.icon.id}
                                                    url={cat.icon.url}
                                                    contentFit="contain"
                                                    style={{width: '100%', height: '100%'}}
                                                />
                                            </View>
                                        ))}

                                        {/* Overflow Count Badge */}
                                        {overflowCount > 0 && (
                                            <View
                                                className="px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15 items-center justify-center">
                                                <AppText
                                                    variant="caption-xs"
                                                    className="text-white/80 font-bold text-[9px]"
                                                >
                                                    +{overflowCount}
                                                </AppText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};