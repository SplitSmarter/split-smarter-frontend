import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {getInstalledUPIApps, openUPIPayment, UPIInstalledApp} from '@/src/utils/upiNativeModule';

export default function PaymentScreen() {
    const [upiApps, setUpiApps] = useState<UPIInstalledApp[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchInstalledApps();
    }, []);

    const fetchInstalledApps = async () => {
        setLoading(true);
        try {
            const apps = await getInstalledUPIApps();
            setUpiApps(apps);
        } catch (err) {
            console.error('Error fetching apps:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayPress = async (app: UPIInstalledApp) => {
        try {
            setLoading(true);
            const response = await openUPIPayment(app.packageName, {
                pa: 'test@ibl', // Replace with a valid registered UPI VPA
                pn: 'SplitSmarter',
                am: '1.00',
                tn: 'Split Payment Settlement',
                tr: `TXN${Date.now()}`,
            });

            console.log('UPI Payment Response:', response);

            const status = (response.Status || '').toUpperCase();

            if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
                Alert.alert(
                    'Payment Successful',
                    `Transaction Ref: ${response.txnRef || response.ApprovalRefNo || response.txnId || 'N/A'}`
                );
            } else if (status === 'SUBMITTED' || status === 'PENDING') {
                Alert.alert('Payment Pending', 'Transaction is processing.');
            } else {
                Alert.alert('Payment Failed', `Status: ${status || 'FAILED'}`);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Unable to complete payment.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0066CC"/>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select UPI Payment App</Text>
            {upiApps.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No UPI apps detected on this device.</Text>
                </View>
            ) : (
                <FlatList
                    data={upiApps}
                    keyExtractor={(item) => item.packageName}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.card} onPress={() => handlePayPress(item)}>
                            <View style={styles.appRow}>
                                {item.icon ? (
                                    <Image source={{uri: item.icon}} style={styles.icon}/>
                                ) : (
                                    <View style={[styles.icon, styles.iconPlaceholder]}/>
                                )}
                                <Text style={styles.appName}>{item.name}</Text>
                            </View>
                            <Text style={styles.payText}>Pay</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    emptyText: {
        color: '#888',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        marginBottom: 10,
    },
    appRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    iconPlaceholder: {
        backgroundColor: '#DDD',
    },
    appName: {
        fontSize: 16,
        fontWeight: '600',
    },
    payText: {
        color: '#0066CC',
        fontWeight: 'bold',
    },
});