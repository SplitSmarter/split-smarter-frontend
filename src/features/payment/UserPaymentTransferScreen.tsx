import React, {useEffect, useState, useCallback, useRef} from "react";
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    BackHandler,
    useColorScheme,
} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

// API imports
import {
    CancelTransactionApi,
    RecordTransactionStepApi,
    VerifyTransactionApi,
} from "@/src/api/user_payment/transaction";
import {
    GetMerchantPaymentAccountsApi,
    GetUserPaymentAccountsApi,
} from "@/src/api/user_payment/accounts";
import {
    UserPaymentAccountItemDTO,
    UPIRegistrySummaryDTO,
} from "@/src/api/dto/user_payments/account";
import {GetMerchantByIdApi} from "@/src/api/expense/merchant";
import {GetUserDetailsByIdAndTypeApi} from "@/src/api/user/user";
import {FailureReasonType, UserTransactionStatus} from "@/src/api/dto/user_payments/constant";

// Native Utility
import {getInstalledUPIApps, openUPIPayment, UPIInstalledApp} from "@/src/utils/upiNativeModule";

// UI Tokens & Local Components
import {THEME} from "./constants/theme";
import {PayeeEntity} from "./types/payment";
import {createStyles} from "./styles/UserPaymentTransferScreen.styles";

import {HeaderNav} from "./components/HeaderNav";
import {RecipientHeader} from "./components/RecipientHeader";
import {VpaSelector} from "./components/VpaSelector";
import {InstalledUpiAppsSelector} from "./components/InstalledUpiAppsSelector";
import {PayFooter} from "./components/PayFooter";

export default function UserPaymentTransferScreen() {
    const router = useRouter();
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === "dark";
    const colors = isDark ? THEME.dark : THEME.light;
    const styles = createStyles(colors);

    // 1. Accept parameters via router params
    const params = useLocalSearchParams<{
        transactionId: string;
        amount?: string;
        userId?: string;
        userType?: 'USER' | 'CUSTOM_USER';
        merchantId?: string;
    }>();

    const transactionId = params.transactionId;
    const amount = params.amount || "0.00";

    // Screen Functional States
    const [loading, setLoading] = useState<boolean>(true);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [payeeEntity, setPayeeEntity] = useState<PayeeEntity | null>(null);
    const [upiApps, setUpiApps] = useState<UPIInstalledApp[]>([]);
    const [selectedApp, setSelectedApp] = useState<UPIInstalledApp | null>(null);
    const [payeeAccounts, setPayeeAccounts] = useState<UserPaymentAccountItemDTO[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<UserPaymentAccountItemDTO | null>(null);

    const isProcessingPayment = useRef<boolean>(false);
    const buttonScale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{scale: buttonScale.value}],
    }));

    // ----------------------------------------------------
    // CANCELLATION / FAILURE ROUTING HELPER
    // ----------------------------------------------------
    const handlePaymentFailure = useCallback(
        async (reasonType: FailureReasonType, errorMessage: string) => {
            try {
                if (transactionId) {
                    await CancelTransactionApi(transactionId, {
                        failure_reason_type: reasonType,
                        failure_reason_raw: errorMessage,
                    });
                }
            } catch (err) {
                console.error("Failed to update cancellation/failure status on backend:", err);
            } finally {
                Alert.alert("Payment Failed", errorMessage, [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]);
            }
        },
        [transactionId, router]
    );

    // ----------------------------------------------------
    // INITIALIZATION & DATA FETCHING
    // ----------------------------------------------------
    const initializeScreen = useCallback(async () => {
        if (!transactionId) {
            Alert.alert("Error", "Invalid transaction identifier provided.", [
                {text: "OK", onPress: () => router.back()},
            ]);
            return;
        }

        setLoading(true);
        try {
            // Step A: Fetch Payee / Receiver Details (Merchant or User)
            if (params.merchantId) {
                const merchantRes = await GetMerchantByIdApi(Number(params.merchantId));
                if (merchantRes && "data" in merchantRes && merchantRes.data) {
                    const merchantData = merchantRes.data;
                    setPayeeEntity({
                        name: merchantData.name,
                        iconUrl: merchantData.logo?.url || merchantData.mcc_code?.icon?.url,
                    });
                }
            } else if (params.userId) {
                const userRes = await GetUserDetailsByIdAndTypeApi({
                    userId: Number(params.userId),
                    userType: params.userType,
                });
                if (userRes && "data" in userRes && userRes.data) {
                    const userData = userRes.data;
                    setPayeeEntity({
                        name: userData.name,
                        iconUrl: userData.avatar?.url,
                    });
                }
            }

            // Step B: Fetch installed local UPI apps
            const apps = await getInstalledUPIApps();
            setUpiApps(apps);
            if (apps.length > 0) {
                setSelectedApp(apps[0]);
            }

            // Step C: Fetch Payee / Receiver Payment Accounts
            let accountsData: UserPaymentAccountItemDTO[] = [];
            if (params.merchantId) {
                const res = await GetMerchantPaymentAccountsApi(Number(params.merchantId));
                if (res && "data" in res && res.data) {
                    accountsData = (res.data.accounts as any) || [];
                }
            } else if (params.userId && params.userType) {
                const res = await GetUserPaymentAccountsApi({
                    user_id: params.userId ? Number(params.userId) : undefined,
                    user_type: params.userType?.toLowerCase(),
                });
                if (res && "data" in res && res.data) {
                    accountsData = res.data.accounts || [];
                }
            }

            setPayeeAccounts(accountsData);

            // Auto-select preference rank 1 or first active account
            if (accountsData.length > 0) {
                const active = accountsData.filter((a) => a.is_active);
                const defaultAcc = active.find((a) => a.preference_rank === 1) || active[0];
                if (defaultAcc) {
                    setSelectedAccount(defaultAcc);
                    await RecordTransactionStepApi(transactionId, {
                        step_name: "ACCOUNT_SELECTED",
                        to_user_payment_account_mapping_id: defaultAcc.mapping_id,
                    });
                }
            }
        } catch (err: any) {
            console.error("Initialization error:", err);
            Alert.alert("Error", "Unable to load payment options.", [
                {text: "OK", onPress: () => router.back()},
            ]);
        } finally {
            setLoading(false);
        }
    }, [transactionId, params.userId, params.userType, params.merchantId, router]);

    useEffect(() => {
        initializeScreen();
    }, [initializeScreen]);

    // ----------------------------------------------------
    // HARDWARE BACK BUTTON & USER CANCELLATION HANDLER
    // ----------------------------------------------------
    const handleUserCancellation = useCallback(async () => {
        if (isProcessingPayment.current) return;
        await handlePaymentFailure(
            FailureReasonType.USER_ABORTED,
            "User exited payment screen before completion."
        );
    }, [handlePaymentFailure]);

    const confirmUserCancellation = useCallback(() => {
        Alert.alert(
            "Cancel Payment?",
            "Are you sure you want to cancel this payment process?",
            [
                {text: "No", style: "cancel"},
                {text: "Yes, Cancel", style: "destructive", onPress: handleUserCancellation},
            ]
        );
    }, [handleUserCancellation]);

    useEffect(() => {
        const onBackPress = () => {
            confirmUserCancellation();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => backHandler.remove();
    }, [confirmUserCancellation]);

    const handleSelectAccount = async (account: UserPaymentAccountItemDTO) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedAccount(account);
        if (transactionId) {
            await RecordTransactionStepApi(transactionId, {
                step_name: "ACCOUNT_UPDATED",
                to_user_payment_account_mapping_id: account.mapping_id,
            });
        }
    };

    const handleSelectApp = (app: UPIInstalledApp) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedApp(app);
    };

    // ----------------------------------------------------
    // EXECUTE PAYMENT VIA SELECTED UPI APP
    // ----------------------------------------------------
    const handlePayPress = async () => {
        if (!selectedAccount) {
            Alert.alert("Account Required", "Please select a payee receiving account.");
            return;
        }

        if (!selectedApp) {
            Alert.alert("UPI App Required", "Please select an installed UPI app to pay with.");
            return;
        }

        const upiDetails = selectedAccount.registry_details as UPIRegistrySummaryDTO;
        if (!upiDetails?.vpa) {
            Alert.alert("Invalid Account", "Selected receiver account does not have a valid VPA.");
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        buttonScale.value = withSpring(0.96, {}, () => {
            buttonScale.value = withSpring(1);
        });

        try {
            isProcessingPayment.current = true;
            setVerifying(true);

            // Audit Log: DEEPLINK_TRIGGERED
            await RecordTransactionStepApi(transactionId, {
                step_name: "DEEPLINK_TRIGGERED",
                to_user_payment_account_mapping_id: selectedAccount.mapping_id,
                metadata_snapshot: {target_app: selectedApp.packageName},
            });

            // Launch Native Gateway
            const response = await openUPIPayment(selectedApp.packageName, {
                pa: upiDetails.vpa,
                pn: "SplitSmarter Payee",
                am: amount,
                tn: `TxnRef-${transactionId}`,
                tr: transactionId,
                mode: "02"
            });

            // Verification Step
            const verifyRes = await VerifyTransactionApi(transactionId, {
                return_payload: response || {},
                metadata_snapshot: {selected_app: selectedApp.packageName},
            });

            if (verifyRes && "data" in verifyRes && verifyRes.data) {
                const finalStatus = verifyRes.data.status;

                if (finalStatus === UserTransactionStatus.SUCCESS) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert(
                        "Payment Successful",
                        `Transaction Reference: ${verifyRes.data.gateway_txn_id || transactionId}`,
                        [{text: "Done", onPress: () => router.replace("/")}]
                    );
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    const rawReason =
                        verifyRes.data.failure_reason_raw || `Transaction status: ${finalStatus}`;
                    await handlePaymentFailure(
                        verifyRes.data.failure_reason_type || FailureReasonType.GATEWAY_DECLINED,
                        rawReason
                    );
                }
            } else {
                await handlePaymentFailure(
                    FailureReasonType.OTHER,
                    "Unable to verify transaction status with backend server."
                );
            }
        } catch (error: any) {
            await handlePaymentFailure(
                FailureReasonType.OTHER,
                error?.message || "Payment execution failed."
            );
        } finally {
            setVerifying(false);
            isProcessingPayment.current = false;
        }
    };

    if (loading || verifying) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.textPrimary}/>
                <Text style={styles.loadingText}>
                    {verifying ? "Verifying payment with bank..." : "Preparing secure checkout..."}
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.bgGradient} style={styles.gradientBg}/>
            <View style={styles.orbTopRight}/>
            <View style={styles.orbBottomLeft}/>

            <View style={{flex: 1}}>
                <HeaderNav colors={colors} onCancel={confirmUserCancellation}/>

                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <RecipientHeader
                        payeeEntity={payeeEntity}
                        amount={amount}
                        transactionId={transactionId}
                        colors={colors}
                    />

                    <VpaSelector
                        accounts={payeeAccounts}
                        selectedAccount={selectedAccount}
                        colors={colors}
                        onSelect={handleSelectAccount}
                    />

                    <InstalledUpiAppsSelector
                        upiApps={upiApps}
                        selectedApp={selectedApp}
                        colors={colors}
                        onSelectApp={handleSelectApp}
                    />
                </ScrollView>

                <PayFooter
                    amount={amount}
                    isProcessing={verifying}
                    selectedAppName={selectedApp?.name}
                    colors={colors}
                    animatedButtonStyle={animatedButtonStyle}
                    onPay={handlePayPress}
                />
            </View>
        </SafeAreaView>
    );
}