import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {View, Pressable, Alert, Linking, ActivityIndicator} from 'react-native';
import {Image} from 'expo-image';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppButtonV2} from "@/src/components/common/AppButtonV2";
import {AppInput} from "@/src/components/common/AppInput";
import {expensePaymentStore} from '@/src/store/expensePaymentStore';
import {GroupMemberDetails} from "@/src/api/dto/user/group";
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';
import {Currency} from '@/src/constants/expense/currency';
import {CurrencyModal} from "@/src/components/expense/currency/CurrencyModal";
import {ExchangeRateDetails} from "@/src/api/dto/expense/expense";
import SettleGatewayStatus from "@/src/components/expense/settlement/SettleGatewayStatus";


interface SettleBalanceIndicatorProps {
    amount: number;
    exchangeRates: ExchangeRateDetails;
    selectedCurrencyCode: string;
    activeCurrencySymbol: string;
}

const SettleBalanceIndicator = React.memo(({
                                               amount,
                                               exchangeRates,
                                               selectedCurrencyCode,
                                               activeCurrencySymbol
                                           }: SettleBalanceIndicatorProps) => {
    const loggedInUser = userStore((state) => state.user);

    const convertedTotalOwed = useMemo(() => {
        const userBaseCurrency = loggedInUser?.currency || 'INR';
        const absoluteAmount = Math.abs(amount);

        const rateUserBase = exchangeRates[userBaseCurrency as keyof ExchangeRateDetails] || 1.0;
        const rateTarget = exchangeRates[selectedCurrencyCode as keyof ExchangeRateDetails] || 1.0;

        // Normalizes input amount to absolute platform baseline value, then maps it to selected viewport rate
        const amountInBaseStandard = absoluteAmount / rateUserBase;
        return (amountInBaseStandard * rateTarget).toFixed(2);
    }, [amount, exchangeRates, selectedCurrencyCode, loggedInUser?.currency]);

    return (
        <AppText className="text-text-primary-lighter text-xs font-semibold mb-5">
            Total Outstanding Balance:{' '}
            <AppText className="text-rose-600 dark:text-rose-400 font-bold">
                {activeCurrencySymbol}{convertedTotalOwed}
            </AppText>
        </AppText>
    );
});
SettleBalanceIndicator.displayName = 'SettleBalanceIndicator';


export default SettleBalanceIndicator;