import React from 'react';
import {View, Pressable, ActivityIndicator} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {COLORS} from '@/src/constants/colors';
import {TransactionTabType} from '../constants/addTransaction.constants';

interface TransactionFooterProps {
    activeTab: TransactionTabType;
    readableDate: string;
    isValidating: boolean;
    activeValidationContent: any;
    transferAmount: number;
    transferCurrency: string;
    isInitiatingPayment: boolean;
    onOpenDatePicker: () => void;
    onOpenValidationModal: () => void;
    onSubmit: () => void;
    onInitiatePayment: () => void;
}

export const TransactionFooter: React.FC<TransactionFooterProps> = ({
                                                                        activeTab,
                                                                        readableDate,
                                                                        isValidating,
                                                                        activeValidationContent,
                                                                        transferAmount,
                                                                        transferCurrency,
                                                                        isInitiatingPayment,
                                                                        onOpenDatePicker,
                                                                        onOpenValidationModal,
                                                                        onSubmit,
                                                                        onInitiatePayment,
                                                                    }) => {
    return (
        <View
            className="absolute bottom-0 w-full bg-bg-primary pt-4 pb-10 px-6 rounded-t-[40px] shadow-2xl border-t border-bg-secondary-lighter">
            <View className="flex-row justify-between items-center mb-6">
                <Pressable
                    onPress={onOpenDatePicker}
                    className="flex-row items-center bg-bg-canvas rounded-full px-5 py-2 active:opacity-80"
                >
                    <Iconify icon="heroicons:calendar" size={18} color={COLORS.color_red_decrease}/>
                    <AppText variant="body-base" className="ml-2 text-text-primary font-bold">
                        {readableDate}
                    </AppText>
                </Pressable>

                {activeTab === 'expense' && (
                    <>
                        {isValidating ? (
                            <View className="flex-row items-center space-x-1">
                                <ActivityIndicator size="small" color="#9CA3AF"/>
                                <AppText variant="caption-xs" className="text-text-secondary font-medium">
                                    Checking group...
                                </AppText>
                            </View>
                        ) : activeValidationContent ? (
                            <Pressable
                                onPress={onOpenValidationModal}
                                className={`flex-row items-center space-x-1 px-3 py-1.5 rounded-xl max-w-[55%] active:opacity-70 ${
                                    activeValidationContent.type === 'ERROR'
                                        ? 'bg-red-500/10 dark:bg-red-500/20'
                                        : 'bg-amber-500/10 dark:bg-amber-500/20'
                                }`}
                            >
                                {activeValidationContent.type === 'ERROR' ? (
                                    <Iconify icon="heroicons:exclamation-circle" size={14} color="#EF4444"/>
                                ) : (
                                    <Iconify icon="heroicons:exclamation-triangle" size={14} color="#D97706"/>
                                )}
                                <AppText
                                    variant="caption-xs"
                                    className={`font-semibold mr-1 flex-1 ${
                                        activeValidationContent.type === 'ERROR'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-amber-700 dark:text-amber-400'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {activeValidationContent.payload?.message}
                                </AppText>
                                <Iconify
                                    icon="heroicons:information-circle"
                                    size={14}
                                    color={activeValidationContent.type === 'ERROR' ? '#EF4444' : '#D97706'}
                                />
                            </Pressable>
                        ) : (
                            <View className="flex-row items-center space-x-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                                <Iconify icon="heroicons:check-circle" size={14} color="#10B981"/>
                                <AppText variant="caption-xs"
                                         className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    Ready
                                </AppText>
                            </View>
                        )}
                    </>
                )}
            </View>

            {activeTab === 'expense' ? (
                <AppButton variant="primary" size="lg" onPress={onSubmit}>
                    SUBMIT
                </AppButton>
            ) : (
                <View className="space-y-3">
                    <AppButton
                        variant="primary"
                        size="lg"
                        onPress={onInitiatePayment}
                        disabled={isInitiatingPayment}
                    >
                        {isInitiatingPayment ? "INITIATING..." : `PAY NOW (${transferCurrency} ${transferAmount})`}
                    </AppButton>
                    <AppButton
                        variant="primary"
                        size="md"
                        onPress={onSubmit}
                    >
                        RECORD ONLY (NO PAYMENT)
                    </AppButton>
                </View>
            )}
        </View>
    );
};