import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Dimensions, Platform, UIManager, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css";

import AlertDisplay from "@/src/components/global/AlertDisplay";
import { CustomErrorBoundary } from "@/src/components/global/CustomErrorBoundary";
import { GlobalLayerController } from "@/src/components/GlobalLayerController";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/src/config/config";
import { AlertProvider } from "@/src/context/alertContext";
import { setupI18n } from "@/src/i18n/index";
import { configStore } from "@/src/store/configStore";
import { deviceStore } from "@/src/store/deviceStore";
import { i18nStore } from "@/src/store/i18nStore";
import { logStore } from "@/src/store/logStore";
import { networkStore } from "@/src/store/networkStore";
import { permissionStore } from "@/src/store/permissionStore";
import { themeStore } from "@/src/store/themeStore";
import { ImageCacheManager } from "@/src/utils/system/ImageCacheManager";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RootLayout() {
    const initNetwork = networkStore((state) => state.initNetworkListener);
    const theme = themeStore((state) => state.theme);
    const initTheme = themeStore((state) => state.initTheme);
    const initI18n = i18nStore((state) => state.initI18n);
    const hasHydrated = themeStore((state) => state._hasHydrated);
    const fetchPublicInfo = configStore((state) => state.fetchPublicInfo);
    const updateScreen = deviceStore((state) => state.updateScreen);
    const syncPermissions = permissionStore((state) => state.syncPermissions);
    const appStateRef = useRef(AppState.currentState);
    const [isAppReady, setIsAppReady] = useState(false);

    // 1. Setup Global Error Handling
    useEffect(() => {
        const globalObj = global as any;
        if (globalObj.ErrorUtils) {
            const originalHandler = globalObj.ErrorUtils.getGlobalHandler();
            globalObj.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
                logStore.getState().addLog({
                    level: 'ERROR',
                    message: error.message,
                    context: {stack: error.stack, isFatal}
                });
                if (originalHandler) originalHandler(error, isFatal);
            });
        }
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                console.log("App returned to active foreground");
            }
            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, []);

    // 2. Initialize App Data
    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({window}) => {
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
                    try {
                        networkUnsubscribe = initNetwork();
                    } catch (netError) {
                        console.error("NetInfo native module link missing:", netError);
                    }

                    await Promise.all([
                        initTheme(),
                        initI18n(),
                        fetchPublicInfo(),
                        syncPermissions(),
                        ImageCacheManager.ensureCacheDir()
                    ]);
                } catch (e) {
                    console.warn("App preparation failed:", e);
                } finally {
                    setIsAppReady(true);
                }
            }
        }

        initializeApp();

        return () => {
            subscription.remove();
            if (networkUnsubscribe) networkUnsubscribe();
        };
    }, [hasHydrated]);

    useEffect(() => {
        if (isAppReady) {
            SplashScreen.hideAsync();
        }
    }, [isAppReady]);

    const navigationTheme = useMemo(() => (theme === "dark" ? DarkTheme : DefaultTheme), [theme]);

    if (!hasHydrated || !isAppReady) return null;

    return (
        <View style={{flex: 1}} className={theme}>
            <ThemeProvider value={navigationTheme}>
                <AlertProvider>
                    <View className="flex-1 bg-background">
                        <GestureHandlerRootView style={{flex: 1}}>
                            <BottomSheetModalProvider>
                                <CustomErrorBoundary>
                                    <Stack screenOptions={{ headerShown: false }} />
                                </CustomErrorBoundary>
                                <GlobalLayerController/>
                                <AlertDisplay/>
                            </BottomSheetModalProvider>
                        </GestureHandlerRootView>
                    </View>
                </AlertProvider>
            </ThemeProvider>
        </View>
    );
}