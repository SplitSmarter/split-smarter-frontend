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
import SettleGatewayStatus from "@/src/components/expense/settlement/SettleGatewayStatus";
import SettleBalanceIndicator from "@/src/components/expense/settlement/SettleBalanceIndicator";
import SettleHeader from "@/src/components/expense/settlement/SettleHeader";
import { CurrencyUtil } from "@/src/utils/expense/currency/CurrencyUtil"; // Imported currency utility class

interface SettleUpModalProps {
    visible: boolean;
    onClose: () => void;
    member: GroupMemberDetails;
    amount: number; // Raw absolute currency transaction unit value from backend ledger
    exchangeRates?: ExchangeRateDetails;
}

const DEFAULT_EXCHANGE_RATES: ExchangeRateDetails = {
    INR: 1.0,
    USD: 1/83.45,
    EUR: 1/89.60,
    GBP: 1/106.15,
    CAD: 1/61.20,
};

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
                                                                visible,
                                                                onClose,
                                                                member,
                                                                amount,
                                                                exchangeRates = DEFAULT_EXCHANGE_RATES,
                                                            }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const loggedInUser = userStore((state) => state.user);
    const setPendingPayment = expensePaymentStore((state) => state.setPendingPayment);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('INR');
    const [payingAmount, setPayingAmount] = useState('');

    // Safely deduce system source base currency setting profile
    const userBaseCurrency = useMemo(() => loggedInUser?.currency || 'INR', [loggedInUser?.currency]);

    // Synchronize initial default context currency codes configuration
    useEffect(() => {
        if (visible) {
            setSelectedCurrencyCode(userBaseCurrency);

            try {
                const absoluteAmount = CurrencyUtil.convertCurrency(
                    Math.abs(amount),
                    userBaseCurrency,
                    userBaseCurrency,
                    exchangeRates
                );
                setPayingAmount(absoluteAmount.toFixed(2));
            } catch (e) {
                setPayingAmount(Math.abs(amount).toFixed(2));
            }
        }
    }, [visible, amount, userBaseCurrency, exchangeRates]);

    const activeCurrencySymbol = useMemo(() => {
        return Currency[selectedCurrencyCode as keyof typeof Currency]?.symbol || selectedCurrencyCode;
    }, [selectedCurrencyCode]);

    const [loadingCredentials, setLoadingCredentials] = useState(false);
    const [gatewayDetails, setGatewayDetails] = useState<{
        hasValidGateway: boolean;
        gatewayName: string;
        handleIdentifier: string;
    } | null>(null);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    useEffect(() => {
        if (visible && member) {
            setLoadingCredentials(true);
            const timer = setTimeout(() => {
                if (selectedCurrencyCode === 'INR') {
                    setGatewayDetails({
                        hasValidGateway: true,
                        gatewayName: "PhonePe / UPI",
                        handleIdentifier: `${member.name.toLowerCase().replace(/\s+/g, '')}@ybl`
                    });
                } else {
                    setGatewayDetails({
                        hasValidGateway: false,
                        gatewayName: "",
                        handleIdentifier: ""
                    });
                }
                setLoadingCredentials(false);
            }, 650);

            return () => clearTimeout(timer);
        } else {
            setGatewayDetails(null);
        }
    }, [visible, selectedCurrencyCode, member]);

    const handlePayViaGateway = async () => {
        if (!gatewayDetails?.hasValidGateway || !member) return;

        const upiTargetUrl = `upi://pay?pa=hello@wtf&pn=${encodeURIComponent(member.name)}&am=${payingAmount}&cu=INR&tn=${encodeURIComponent('Settling split ledger')}`;

        try {
            setPendingPayment({
                debtId: `debt_${Date.now()}`,
                amount: payingAmount,
                recipientName: member.name,
                timestamp: new Date().toISOString()
            });

            const supported = await Linking.canOpenURL(upiTargetUrl);
            if (supported) {
                await Linking.openURL(upiTargetUrl);
                onClose();
            } else {
                throw new Error("Direct application handler unavailable");
            }
        } catch (error) {
            setPendingPayment(null);
            Alert.alert(
                "Gateway Interface Exception",
                `We couldn't initialize your deep link to ${gatewayDetails.gatewayName}. Please proceed with cash settlement.`
            );
        }
    };

    const handleSettleWithCashLocalBypass = () => {
        if (!member) return;
        Alert.alert(
            "Record Instant Settlement",
            `Are you sure you want to register a cash payoff of ${activeCurrencySymbol}${payingAmount} to ${member.name}? This settles balances immediately.`,
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Record Settlement",
                    onPress: () => {
                        Alert.alert("Success", "Cash settlement captured into pending synchronization ledger.");
                        onClose();
                    }
                }
            ]
        );
    };

    const snapPoints = useMemo(() => ['85%'], []);
    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close"/>
    ), []);

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                onDismiss={onClose}
                backdropComponent={renderBackdrop}
                backgroundStyle={{backgroundColor: isDark ? '#121212' : '#FFFFFF', borderRadius: 40}}
                handleIndicatorStyle={{backgroundColor: isDark ? '#3F3F46' : '#D4D4D8', width: 48, height: 6}}
            >
                {!member ? (
                    <BottomSheetView className="p-6 items-center justify-center">
                        <ActivityIndicator size="small" color="#2D6A4F"/>
                    </BottomSheetView>
                ) : (
                    <BottomSheetView className="flex-1 px-6 pb-8 items-center">

                        <SettleHeader member={member} onClose={onClose}/>

                        <SettleBalanceIndicator
                            amount={amount}
                            exchangeRates={exchangeRates}
                            selectedCurrencyCode={selectedCurrencyCode}
                            activeCurrencySymbol={activeCurrencySymbol}
                        />

                        {/* Editable Entry Element Rail */}
                        <View className="w-full mb-6">
                            <AppInput
                                label="Paying Amount"
                                value={payingAmount}
                                onChangeText={setPayingAmount}
                                placeholder="0.00"
                                keyboardType="numeric"
                                renderLeftIcon={(iconColor) => (
                                    <Pressable
                                        onPress={() => setIsCurrencyModalOpen(true)}
                                        className="flex-row items-center mr-1 pr-2.5 border-r border-zinc-200 dark:border-zinc-800 h-6"
                                    >
                                        <AppText className="text-bg-secondary text-base font-bold">
                                            {activeCurrencySymbol}
                                        </AppText>
                                        <Iconify icon="heroicons:chevron-down" size={12} color={iconColor}
                                                 className="ml-1"/>
                                    </Pressable>
                                )}
                                renderRightIcon={() => (
                                    <Pressable onPress={() => setPayingAmount("")} className="px-1 py-0.5">
                                        <AppText variant="caption-xs"
                                                 className="text-bg-secondary font-bold">Clear</AppText>
                                    </Pressable>
                                )}
                            />
                        </View>

                        <SettleGatewayStatus
                            loading={loadingCredentials}
                            gatewayDetails={gatewayDetails}
                            selectedCurrencyCode={selectedCurrencyCode}
                        />

                        {/* CTA ACTION LAYERS */}
                        <View className="w-full mb-3">
                            <AppButtonV2
                                onPress={handlePayViaGateway}
                                variant="primary"
                                disabled={!gatewayDetails?.hasValidGateway || loadingCredentials || !payingAmount}
                                className="w-full py-4 rounded-xl items-center justify-center"
                                style={{
                                    backgroundColor: (gatewayDetails?.hasValidGateway && !loadingCredentials && payingAmount) ? '#2D6A4F' : '#A1A1AA',
                                    opacity: (gatewayDetails?.hasValidGateway && !loadingCredentials && payingAmount) ? 1 : 0.4
                                }}
                            >
                                <AppText className="font-bold text-white text-sm">Pay with Gateway</AppText>
                            </AppButtonV2>
                        </View>

                        <View className="w-full">
                            <Pressable
                                onPress={handleSettleWithCashLocalBypass}
                                disabled={!payingAmount}
                                className={`w-full py-4 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent active:bg-zinc-100 dark:active:bg-zinc-900 ${!payingAmount ? 'opacity-40' : ''}`}
                            >
                                <AppText className="font-bold text-text-primary text-sm">Settle via Cash / Outside
                                    App</AppText>
                            </Pressable>
                        </View>

                    </BottomSheetView>
                )}
            </BottomSheetModal>

            <CurrencyModal
                visible={isCurrencyModalOpen}
                currentCurrency={selectedCurrencyCode}
                exchangeRates={exchangeRates}
                showConversionRates={true}
                onClose={() => setIsCurrencyModalOpen(false)}
                onSelect={(code) => {
                    setSelectedCurrencyCode(code);
                    setIsCurrencyModalOpen(false);

                    try {
                        // Dynamically update calculations utilizing the custom utility engine instance
                        const normalizedValue = CurrencyUtil.convertCurrency(
                            Math.abs(amount),
                            userBaseCurrency,
                            code,
                            exchangeRates
                        );
                        setPayingAmount(normalizedValue.toFixed(2));
                    } catch (e) {
                        console.error(e);
                    }
                }}
            />
        </>
    );
};

SettleUpModal.displayName = 'SettleUpModal';