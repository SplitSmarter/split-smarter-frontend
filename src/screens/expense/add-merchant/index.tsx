import React, {useState} from 'react';
import {View, Pressable, ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {themeStore} from '@/src/store/themeStore';
import {CreateMerchantApi} from '@/src/api/expense/merchant';
import {useAlert} from '@/src/context/alertContext';
import {COLORS} from '@/src/constants/colors';
import {
    MccPickerBottomSheet,
    SelectedMcc,
} from './components/MccPickerBottomSheet';

export default function AddMerchantScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const {showAlert} = useAlert();
    const router = useRouter();

    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [taxId, setTaxId] = useState('');
    const [mcc, setMcc] = useState<SelectedMcc | null>(null);
    const [mccSheetOpen, setMccSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)/(tabs)');
        }
    };

    const handleClearMcc = () => {
        setMcc(null);
    };

    const handleSave = async () => {
        if (isSaving) return;

        const trimmedName = name.trim();
        if (!trimmedName) {
            showAlert('Merchant name is required', 'error');
            return;
        }
        if (trimmedName.length > 255) {
            showAlert('Merchant name must be 255 characters or fewer', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const response = await CreateMerchantApi({
                name: trimmedName,
                mcc_code: mcc?.code ?? null,
                website: website.trim() || null,
                tax_id: taxId.trim() || null,
                logo_asset_id: null,
            });

            if (response.data) {
                showAlert(response.message || 'Merchant created successfully', 'success');
                router.back();
            } else {
                showAlert(response.message || 'Failed to create merchant', 'error');
            }
        } catch (err: any) {
            showAlert(err?.message || 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BottomSheetModalProvider>
            <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
                <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
                    <Pressable onPress={handleBack} className="p-2 rounded-full" disabled={isSaving}>
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        Add merchant
                    </AppText>
                    <View className="w-10" />
                </View>

                <ScrollView
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 60}}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="gap-y-6 mt-4">
                        <AppInput
                            label="Name"
                            placeholder="Enter merchant name"
                            value={name}
                            onChangeText={setName}
                            required
                        />

                        <View>
                            <AppText
                                variant="caption-xs"
                                className="mb-2 font-semibold text-text-primary-lighter"
                            >
                                Category (MCC)
                            </AppText>
                            <Pressable
                                onPress={() => setMccSheetOpen(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Select MCC category"
                                className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-primary-lighter px-4 py-3.5"
                            >
                                <View className="flex-1 pr-3">
                                    {mcc ? (
                                        <>
                                            <AppText className="font-semibold text-text-primary">
                                                {mcc.description}
                                            </AppText>
                                            <AppText
                                                variant="caption-xs"
                                                className="mt-0.5 text-text-primary-lighter"
                                            >
                                                MCC {mcc.code}
                                            </AppText>
                                        </>
                                    ) : (
                                        <>
                                            <AppText className="font-semibold text-text-primary-lighter">
                                                Select category
                                            </AppText>
                                            <AppText
                                                variant="caption-xs"
                                                className="mt-1 text-accent-sky"
                                            >
                                                Optional · tap to choose MCC
                                            </AppText>
                                        </>
                                    )}
                                </View>
                                {mcc ? (
                                    <Pressable
                                        onPress={handleClearMcc}
                                        hitSlop={8}
                                        accessibilityRole="button"
                                        accessibilityLabel="Clear MCC"
                                        className="p-1 mr-1"
                                    >
                                        <Iconify
                                            icon="heroicons:x-mark"
                                            size={18}
                                            color={colors.icon.primary}
                                        />
                                    </Pressable>
                                ) : null}
                                <Iconify
                                    icon="heroicons:chevron-right"
                                    size={18}
                                    color={colors.icon.primary}
                                />
                            </Pressable>
                        </View>

                        <AppInput
                            label="Website"
                            placeholder="https://example.com"
                            value={website}
                            onChangeText={setWebsite}
                            autoCapitalize="none"
                            keyboardType="url"
                        />

                        <AppInput
                            label="Tax ID"
                            placeholder="Optional tax ID"
                            value={taxId}
                            onChangeText={setTaxId}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View className="mt-10">
                        <AppButton
                            variant="primary"
                            className="w-full h-14 rounded-2xl"
                            onPress={handleSave}
                            disabled={isSaving}
                            loading={isSaving}
                            loadingText="Saving..."
                        >
                            Save merchant
                        </AppButton>
                    </View>
                </ScrollView>
            </SafeAreaView>

            <MccPickerBottomSheet
                visible={mccSheetOpen}
                selectedCode={mcc?.code}
                onClose={() => setMccSheetOpen(false)}
                onSelect={setMcc}
            />
        </BottomSheetModalProvider>
    );
}
