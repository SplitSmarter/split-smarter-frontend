import "./global.css";
import {ThemeProvider} from "@/src/context/themeContext";
import AlertDisplay from "@/src/components/global/AlertDisplay";
import { Slot } from 'expo-router';
import {View, Text} from "react-native";
import {useEffect, useState} from "react";
import {setupI18n} from "@/src/i18n/index";
// import {AuthProvider} from '@/src/context/authContext';
// import {DeviceProvider} from "@/src/context/deviceContext";
import {I18nProvider} from "@/src/context/i18nContext";
import {AlertProvider} from "@/src/context/alertContext";
import {setupInterceptor} from "@/src/api/tokenInterceptor";
import axiosUserServiceInstance from "@/src/api/axiosUserServiceInstance";
import axiosInternalInstance from "@/src/api/axiosInternalInstance";

export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            await setupI18n();
            // setupInterceptor(axiosInternalInstance);
            // setupInterceptor(axiosUserServiceInstance);
            setReady(true);
        })();
    }, []);

    if (!ready) {
        return (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>Loading..</Text>
            </View>
        );
    }

    return (
        // <DeviceProvider>
            <ThemeProvider>
                <I18nProvider>
                    <AlertProvider>
                        {/*<AuthProvider>*/}
                            <Slot />
                            <AlertDisplay />
                        {/*</AuthProvider>*/}
                    </AlertProvider>
                </I18nProvider>
            </ThemeProvider>
        // </DeviceProvider>
    );
}
