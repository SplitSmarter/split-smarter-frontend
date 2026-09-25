import {NativeModules, Platform, Linking} from 'react-native';

export interface UPIInstalledApp {
    name: string;
    packageName: string;
    icon?: string;
}

export interface UPIPaymentResponse {
    Status?: 'SUCCESS' | 'FAILURE' | 'SUBMITTED' | 'SUCCESSFUL' | string;
    txnId?: string;
    responseCode?: string;
    ApprovalRefNo?: string;
    txnRef?: string;
    rawResponse?: string;

    [key: string]: string | undefined;
}

const {UPIInstalledAppsModule} = NativeModules;

export const getInstalledUPIApps = async (): Promise<UPIInstalledApp[]> => {
    if (Platform.OS === 'android') {
        if (!UPIInstalledAppsModule) {
            console.warn('UPIInstalledAppsModule is not linked. Rebuild the app.');
            return [];
        }
        return await UPIInstalledAppsModule.getInstalledUPIApps();
    } else {
        const iosSchemes = [
            {name: 'Google Pay', packageName: 'gpay://'},
            {name: 'PhonePe', packageName: 'phonepe://'},
            {name: 'Paytm', packageName: 'paytmmp://'},
            {name: 'BHIM', packageName: 'upi://'},
        ];
        const availableApps: UPIInstalledApp[] = [];
        for (const app of iosSchemes) {
            const supported = await Linking.canOpenURL(app.packageName);
            if (supported) {
                availableApps.push(app);
            }
        }
        return availableApps;
    }
};

export const openUPIPayment = async (
    packageName: string,
    upiParams: {
        pa: string;
        pn: string;
        am: string;
        tn?: string;
        tr?: string;
        mode?: string; // Add mode here
    }
): Promise<UPIPaymentResponse> => {
    const query = new URLSearchParams({
        pa: upiParams.pa,
        pn: upiParams.pn,
        am: upiParams.am,
        cu: 'INR',
        ...(upiParams.tn ? {tn: upiParams.tn} : {}),
        ...(upiParams.tr ? {tr: upiParams.tr} : {}),
        ...(upiParams.mode ? {mode: upiParams.mode} : {}), // Append mode
    }).toString();

    const upiUrl = `upi://pay?${query}`;
    // console.log("Upi URL: ", upiUrl);
    // const upiUrl = 'upi://pay?pa=merchantupi@bank&pn=MerchantName&am=3.00&cu=INR&mode=02';

    if (Platform.OS === 'android') {
        if (UPIInstalledAppsModule && UPIInstalledAppsModule.openTargetUPIApp) {
            return await UPIInstalledAppsModule.openTargetUPIApp(packageName, upiUrl);
        } else {
            await Linking.openURL(upiUrl);
            return {Status: 'SUBMITTED'};
        }
    } else {
        await Linking.openURL(upiUrl);
        return {Status: 'SUBMITTED'};
    }
};