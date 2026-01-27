import "./global.css";
import { useEffect, useMemo } from "react";
import { View, Dimensions } from "react-native";
import { Slot, SplashScreen } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import AlertDisplay from "@/src/components/global/AlertDisplay";
import { setupI18n } from "@/src/i18n/index";
import { AlertProvider } from "@/src/context/alertContext";
import { useConfigStore } from "@/src/store/useConfigStore";
import { useThemeStore } from "@/src/store/useThemeStore";
import { useI18nStore } from "@/src/store/useI18nStore";
import { useDeviceStore } from "@/src/store/deviceStore";
import { useLogStore } from "@/src/store/useLogStore";
import { CustomErrorBoundary } from "@/src/components/global/CustomErrorBoundary";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { GlobalLayerController } from "@/src/components/GlobalLayerController";
import {ImageCacheManager} from "@/src/utils/system/ImageCacheManager";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID} from "@/src/config/config";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const initNetwork = useNetworkStore((state) => state.initNetworkListener);
    const theme = useThemeStore((state) => state.theme);
    const initTheme = useThemeStore((state) => state.initTheme);
    const initI18n = useI18nStore((state) => state.initI18n);
    const hasHydrated = useThemeStore((state) => state._hasHydrated);
    const fetchPublicInfo = useConfigStore((state) => state.fetchPublicInfo);
    const updateScreen = useDeviceStore((state) => state.updateScreen);

    // 1. Setup Global Error Handling once
    useEffect(() => {
        const globalObj = global as any;
        if (globalObj.ErrorUtils) {
            const originalHandler = globalObj.ErrorUtils.getGlobalHandler();
            globalObj.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
                useLogStore.getState().addLog({
                    level: 'ERROR',
                    message: error.message,
                    context: { stack: error.stack, isFatal }
                });
                if (originalHandler) originalHandler(error, isFatal);
            });
        }
    }, []);

    // 2. Initialize App Data
    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({ window }) => {
            updateScreen(window);
        });

        let networkUnsubscribe: (() => void) | undefined;

        async function initializeApp() {
            if (hasHydrated) {
                try {
                    GoogleSignin.configure({
                        webClientId: GOOGLE_WEB_CLIENT_ID,
                        iosClientId: GOOGLE_IOS_CLIENT_ID,
                        offlineAccess: true,
                        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
                        forceCodeForRefreshToken: true,
                    });

                    await setupI18n();
                    // NetInfo might fail if native module isn't linked, wrap in try/catch
                    try {
                        networkUnsubscribe = initNetwork();
                    } catch (netError) {
                        console.error("NetInfo native module link missing:", netError);
                    }

                    await Promise.all([initTheme(), initI18n(), fetchPublicInfo(), ImageCacheManager.ensureCacheDir()]);
                } catch (e) {
                    console.warn("App preparation failed:", e);
                } finally {
                    await SplashScreen.hideAsync();
                }
            }
        }

        initializeApp();

        return () => {
            subscription.remove();
            if (networkUnsubscribe) networkUnsubscribe();
        };
    }, [hasHydrated]);

    // Use useMemo for the theme to prevent unnecessary provider re-renders
    const navigationTheme = useMemo(() => (theme === "dark" ? DarkTheme : DefaultTheme), [theme]);

    return (
        <View key={theme} style={{ flex: 1 }} className={theme}>
            <ThemeProvider value={navigationTheme}>
                <View className="flex-1 bg-background">
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <BottomSheetModalProvider>
                            <AlertProvider>
                                <CustomErrorBoundary>
                                    <Slot />
                                </CustomErrorBoundary>
                                <GlobalLayerController />
                                <AlertDisplay />
                            </AlertProvider>
                        </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                </View>
            </ThemeProvider>
        </View>
    );
}