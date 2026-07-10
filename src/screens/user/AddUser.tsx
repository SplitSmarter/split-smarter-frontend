import React, {useEffect} from 'react';
import {BackHandler, Pressable, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppText} from "@/src/components/common/AppText";
import {themeStore} from "@/src/store/themeStore";
import {systemStore} from "@/src/store/systemStore";
import {logStore} from "@/src/store/logStore";

// API Endpoints & Types
import {RelationshipForm} from "@/src/screens/user/add_user/RelationshipForm";

export default function AddUserScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const {defaults} = systemStore();
    const router = useRouter();

    const defaultAvatarAssetId = defaults?.defaultGroupIconImage?.id || "00000000-0000-0000-0000-000000000000";

    const safeNavigateBack = () => {
        try {
            console.log("Back pressed")
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace("/(authenticated)/(tabs)/" as any);
            }
        } catch (navError: any) {
            logStore.getState().addLog({
                level: 'WARN',
                message: `Safe fallback navigation processed: ${navError.message}`,
                context: {location: 'AddUserScreen:safeNavigateBack'}
            });
            router.replace("/(authenticated)/(tabs)/" as any);
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            safeNavigateBack();
            return true; // Prevents the default behavior (exiting the app)
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
            {/* Structural Nav Header Context */}
            <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
                <Pressable onPress={safeNavigateBack}
                           className="p-2 rounded-full active:bg-gray-100 dark:active:bg-zinc-800">
                    <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"}/>
                </Pressable>
                <AppText variant="h4" className="font-bold text-text-primary">Add Relation</AppText>
                <View className="w-10"/>
            </View>

            {/* Isolated Form Subtree Rendering Boundary Context */}
            <RelationshipForm
                isDark={isDark}
                defaultAvatarAssetId={defaultAvatarAssetId}
                onSuccess={safeNavigateBack}
            />
        </SafeAreaView>
    );
}