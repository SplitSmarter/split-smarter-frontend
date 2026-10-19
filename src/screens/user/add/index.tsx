import React, {useEffect} from 'react';
import {BackHandler, KeyboardAvoidingView, Platform, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {themeStore} from '@/src/store/themeStore';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {systemStore} from '@/src/store/systemStore';
import {logStore} from '@/src/store/logStore';
import {RelationshipForm} from '@/src/screens/user/add/components/RelationshipForm';
import {AddRelationHeader} from '@/src/screens/user/add/components/AddRelationHeader';

export default function AddUserScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {defaults} = systemStore();
    const router = useRouter();

    const defaultAvatarAssetId = defaults?.defaultGroupIconImage?.id;

    const safeNavigateBack = () => {
        try {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(authenticated)/(tabs)/' as any);
            }
        } catch (navError: any) {
            logStore.getState().addLog({
                level: 'WARN',
                message: `Safe fallback navigation processed: ${navError.message}`,
                context: {location: 'AddUserScreen:safeNavigateBack'},
            });
            router.replace('/(authenticated)/(tabs)/' as any);
        }
    };

    useEffect(() => {
        const onBackPress = () => {
            safeNavigateBack();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, []);

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                <AddRelationHeader onBack={safeNavigateBack} />

                <KeyboardAvoidingView
                    className="flex-1"
                    style={{backgroundColor: heroStatusBar}}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                >
                    <View
                        className="flex-1 overflow-hidden"
                        style={{
                            marginTop: -20,
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            backgroundColor: canvasBg,
                        }}
                    >
                        <RelationshipForm
                            isDark={isDark}
                            defaultAvatarAssetId={defaultAvatarAssetId}
                            onSuccess={safeNavigateBack}
                        />
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ScreenWrapper>
    );
}
