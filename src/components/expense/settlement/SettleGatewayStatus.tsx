import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Pressable, Alert, Linking, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Iconify } from 'react-native-iconify';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { AppText } from '@/src/components/common/AppText';
import { AppButtonV2 } from "@/src/components/common/AppButtonV2";
import { AppInput } from "@/src/components/common/AppInput";
import { expensePaymentStore } from '@/src/store/expensePaymentStore';
import { GroupMemberDetails } from "@/src/api/dto/user/group";
import { themeStore } from '@/src/store/themeStore';
import { userStore } from '@/src/store/userStore';
import { Currency } from '@/src/constants/expense/currency';
import { CurrencyModal } from "@/src/components/expense/currency/CurrencyModal";
import { ExchangeRateDetails } from "@/src/api/dto/expense/expense";
import SettleHeader from "@/src/components/expense/settlement/SettleHeader";

interface SettleGatewayStatusProps {
    loading: boolean;
    gatewayDetails: { hasValidGateway: boolean; gatewayName: string; handleIdentifier: string } | null;
    selectedCurrencyCode: string;
}

const SettleGatewayStatus = React.memo(({ loading, gatewayDetails, selectedCurrencyCode }: SettleGatewayStatusProps) => {
    if (loading) {
        return (
            <View className="w-full p-4 rounded-2xl mb-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 h-16 justify-center">
                <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#2D6A4F" />
                    <AppText className="text-xs text-text-primary-lighter ml-3 font-medium">Resolving routing parameters...</AppText>
                </View>
            </View>
        );
    }

    return (
        <View className="w-full p-4 rounded-2xl mb-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 min-h-[64px] justify-center">
            {gatewayDetails?.hasValidGateway ? (
                <View className="flex-row items-start">
                    <View className="p-1.5 rounded-lg bg-emerald-500/10 mt-0.5">
                        <View className="w-2 h-2 rounded-full bg-emerald-500" />
                    </View>
                    <View className="ml-3 flex-1">
                        <AppText className="font-bold text-text-primary text-sm leading-5">
                            Paying via: {gatewayDetails.gatewayName}
                        </AppText>
                        <AppText className="text-xs text-text-primary-lighter mt-0.5">
                            UPI ID: {gatewayDetails.handleIdentifier}
                        </AppText>
                    </View>
                </View>
            ) : (
                <View className="flex-row items-start">
                    <View className="p-1.5 rounded-lg bg-amber-500/10 mt-0.5">
                        <View className="w-2 h-2 rounded-full bg-amber-500" />
                    </View>
                    <View className="ml-3 flex-1">
                        <AppText className="font-bold text-amber-700 dark:text-amber-500 text-sm leading-5">
                            Recipient hasn&#39;t linked a bank account yet
                        </AppText>
                        <AppText className="text-xs text-text-primary-lighter mt-0.5">
                            Digital routing rails unavailable for {selectedCurrencyCode} tier exchanges.
                        </AppText>
                    </View>
                </View>
            )}
        </View>
    );
});
SettleGatewayStatus.displayName = 'SettleGatewayStatus';


export default SettleGatewayStatus;