import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    BackHandler,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {
    CancelTransactionApi,
    RecordTransactionStepApi,
    VerifyTransactionApi,
} from '@/src/api/user_payment/transaction';
import {
    GetMerchantPaymentAccountsApi,
    GetUserPaymentAccountsApi,
} from '@/src/api/user_payment/accounts';
import {
    UserPaymentAccountItemDTO,
    UPIRegistrySummaryDTO,
} from '@/src/api/dto/user_payments/account';

// Native Module Utilities
import {getInstalledUPIApps, openUPIPayment, UPIInstalledApp} from '@/src/utils/upiNativeModule';
import {FailureReasonType, UserTransactionStatus} from "@/src/api/dto/user_payments/constant";

export default function PaymentScreen() {
    const router = useRouter();

    // 1. Accept parameters passed via route params
    const params = useLocalSearchParams<{
        transactionId: string;
        amount?: string;
        userId?: string;
        userType?: string;
        merchantId?: string;
    }>();

    const transactionId = params.transactionId;
    const amount = params.amount || '0.00';

    // Screen States
    const [loading, setLoading] = useState<boolean>(true);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [upiApps, setUpiApps] = useState<UPIInstalledApp[]>([]);
    const [payeeAccounts, setPayeeAccounts] = useState<UserPaymentAccountItemDTO[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<UserPaymentAccountItemDTO | null>(null);

    const isProcessingPayment = useRef<boolean>(false);

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
                console.error('Failed to update cancellation/failure status on backend:', err);
            } finally {
                Alert.alert('Payment Failed', errorMessage, [
                    {
                        text: 'OK',
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
            Alert.alert('Error', 'Invalid transaction identifier provided.', [
                {text: 'OK', onPress: () => router.back()},
            ]);
            return;
        }

        setLoading(true);
        try {
            // Step A: Fetch installed local UPI apps
            const apps = await getInstalledUPIApps();
            setUpiApps(apps);

            // Step B: Fetch Payee / Receiver Payment Accounts
            let accountsData: UserPaymentAccountItemDTO[] = [];
            if (params.merchantId) {
                const res = await GetMerchantPaymentAccountsApi(Number(params.merchantId));
                if (res && 'data' in res && res.data) {
                    accountsData = (res.data.accounts as any) || [];
                }
            } else if (params.userId && params.userType) {
                const res = await GetUserPaymentAccountsApi({
                    user_id: params.userId ? Number(params.userId) : undefined,
                    user_type: params.userType?.toLowerCase(),
                });
                if (res && 'data' in res && res.data) {
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
                    // Audit step: ACCOUNT_SELECTED
                    await RecordTransactionStepApi(transactionId, {
                        step_name: 'ACCOUNT_SELECTED',
                        to_user_payment_account_mapping_id: defaultAcc.mapping_id,
                    });
                }
            }
        } catch (err: any) {
            console.error('Initialization error:', err);
            Alert.alert('Error', 'Unable to load payment options.', [
                {text: 'OK', onPress: () => router.back()},
            ]);
        } finally {
            setLoading(false);
        }
    }, [transactionId, params.userId, params.userType, params.merchantId, router]);

    useEffect(() => {
        initializeScreen();
    }, [initializeScreen]);

    // ----------------------------------------------------
    // HARDWARE BACK BUTTON & CANCELLATION HANDLER
    // ----------------------------------------------------
    const handleUserCancellation = useCallback(async () => {
        if (isProcessingPayment.current) return;
        await handlePaymentFailure(
            FailureReasonType.USER_ABORTED,
            'User exited payment screen before completion.'
        );
    }, [handlePaymentFailure]);

    useEffect(() => {
        const onBackPress = () => {
            Alert.alert(
                'Cancel Payment?',
                'Are you sure you want to cancel this payment process?',
                [
                    {text: 'No', style: 'cancel'},
                    {text: 'Yes, Cancel', style: 'destructive', onPress: handleUserCancellation},
                ]
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
    }, [handleUserCancellation]);

    const handleSelectAccount = async (account: UserPaymentAccountItemDTO) => {
        setSelectedAccount(account);
        if (transactionId) {
            await RecordTransactionStepApi(transactionId, {
                step_name: 'ACCOUNT_UPDATED',
                to_user_payment_account_mapping_id: account.mapping_id,
            });
        }
    };

    // ----------------------------------------------------
    // EXECUTE PAYMENT VIA UPI APP
    // ----------------------------------------------------
    const handlePayPress = async (app: UPIInstalledApp) => {
        if (!selectedAccount) {
            Alert.alert('Account Required', 'Please select a payee receiving account.');
            return;
        }

        const upiDetails = selectedAccount.registry_details as UPIRegistrySummaryDTO;
        if (!upiDetails?.vpa) {
            Alert.alert('Invalid Account', 'Selected receiver account does not have a valid VPA.');
            return;
        }

        try {
            isProcessingPayment.current = true;
            setVerifying(true);

            // 1. Audit Log: DEEPLINK_TRIGGERED
            await RecordTransactionStepApi(transactionId, {
                step_name: 'DEEPLINK_TRIGGERED',
                to_user_payment_account_mapping_id: selectedAccount.mapping_id,
                metadata_snapshot: {target_app: app.packageName},
            });

            // 2. Launch Gateway Native App
            const response = await openUPIPayment(app.packageName, {
                pa: upiDetails.vpa,
                pn: selectedAccount.provider?.display_name || 'SplitSmarter Merchant',
                am: amount,
                tn: `TxnRef: ${transactionId}`,
                tr: transactionId,
            });

            // 3. Send raw gateway return payload to backend for verification
            const verifyRes = await VerifyTransactionApi(transactionId, {
                return_payload: response || {},
                metadata_snapshot: {selected_app: app.packageName},
            });

            if (verifyRes && 'data' in verifyRes && verifyRes.data) {
                const finalStatus = verifyRes.data.status;

                if (finalStatus === UserTransactionStatus.SUCCESS) {
                    Alert.alert(
                        'Payment Successful',
                        `Transaction Reference: ${verifyRes.data.gateway_txn_id || transactionId}`,
                        [{text: 'Done', onPress: () => router.replace('/')}]
                    );
                } else {
                    // Payment failed on verification -> Update backend and navigate back
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
                    'Unable to verify transaction status with backend server.'
                );
            }
        } catch (error: any) {
            await handlePaymentFailure(
                FailureReasonType.OTHER,
                error?.message || 'Payment execution failed.'
            );
        } finally {
            setVerifying(false);
            isProcessingPayment.current = false;
        }
    };

    // Render Loader
    if (loading || verifying) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0066CC"/>
                <Text style={styles.loadingText}>
                    {verifying ? 'Verifying payment with bank...' : 'Preparing secure checkout...'}
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content"/>

            {/* Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={handleUserCancellation} style={styles.backButton}>
                    <Text style={styles.backText}>✕ Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{width: 60}}/>
            </View>

            {/* Amount Display */}
            <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Total Payable Amount</Text>
                <Text style={styles.amountValue}>₹{parseFloat(amount).toFixed(2)}</Text>
                <Text style={styles.txnIdText}>Ref ID: {transactionId}</Text>
            </View>

            {/* Receiver Account Selection */}
            {payeeAccounts.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Receiving Account</Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={payeeAccounts}
                        keyExtractor={(item) => item.mapping_id}
                        renderItem={({item}) => {
                            const isSelected = selectedAccount?.mapping_id === item.mapping_id;
                            const upiData = item.registry_details as UPIRegistrySummaryDTO;
                            return (
                                <TouchableOpacity
                                    style={[styles.accountChip, isSelected && styles.accountChipSelected]}
                                    onPress={() => handleSelectAccount(item)}
                                >
                                    <Text style={[styles.accountProvider, isSelected && styles.selectedText]}>
                                        {item.provider?.display_name || 'UPI Bank'}
                                    </Text>
                                    <Text style={[styles.accountVpa, isSelected && styles.selectedSubtext]}>
                                        {upiData?.vpa || 'N/A'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            {/* Installed UPI Apps Selection */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Pay via Installed UPI App</Text>

                {upiApps.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No supported UPI payment apps found on this device.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={upiApps}
                        keyExtractor={(item) => item.packageName}
                        contentContainerStyle={{paddingBottom: 20}}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.appCard}
                                activeOpacity={0.7}
                                onPress={() => handlePayPress(item)}
                            >
                                <View style={styles.appRow}>
                                    {item.icon ? (
                                        <Image source={{uri: item.icon}} style={styles.appIcon}/>
                                    ) : (
                                        <View style={[styles.appIcon, styles.iconPlaceholder]}/>
                                    )}
                                    <View>
                                        <Text style={styles.appName}>{item.name}</Text>
                                        <Text style={styles.appSubtext}>Tap to pay ₹{amount}</Text>
                                    </View>
                                </View>
                                <View style={styles.payBtn}>
                                    <Text style={styles.payBtnText}>Pay</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 14,
        fontSize: 15,
        color: '#495057',
        fontWeight: '500',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    backText: {
        color: '#FA5252',
        fontSize: 15,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
    },
    amountCard: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    amountLabel: {
        fontSize: 13,
        color: '#868E96',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontWeight: '600',
    },
    amountValue: {
        fontSize: 34,
        fontWeight: '800',
        color: '#111827',
        marginVertical: 6,
    },
    txnIdText: {
        fontSize: 12,
        color: '#ADB5BD',
        fontWeight: '500',
    },
    sectionContainer: {
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#343A40',
        marginBottom: 10,
    },
    accountChip: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
        minWidth: 140,
    },
    accountChipSelected: {
        borderColor: '#0066CC',
        backgroundColor: '#E7F5FF',
    },
    accountProvider: {
        fontSize: 14,
        fontWeight: '700',
        color: '#212529',
    },
    accountVpa: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 2,
    },
    selectedText: {
        color: '#0066CC',
    },
    selectedSubtext: {
        color: '#1C7ED6',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    appCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    appRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        marginRight: 14,
    },
    iconPlaceholder: {
        backgroundColor: '#E9ECEF',
    },
    appName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    appSubtext: {
        fontSize: 12,
        color: '#868E96',
        marginTop: 2,
    },
    payBtn: {
        backgroundColor: '#0066CC',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
    },
    payBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#868E96',
        fontSize: 14,
        textAlign: 'center',
    },
});