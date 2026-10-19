import React, {useState} from 'react';
import {
    View,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {PlatinumFormHeader} from '@/src/components/common/PlatinumFormHeader';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {themeStore} from '@/src/store/themeStore';
import {CreateMerchantApi} from '@/src/api/expense/merchant';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {
    MccPickerBottomSheet,
    SelectedMcc,
} from '@/src/screens/expense/add-merchant/components/MccPickerBottomSheet';

export default function AddMerchantScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {showAlert} = useAlert();
    const router = useRouter();
    const {handleSingleCamera, handleSingleGallery} = useAssetPicker({
        autoUpload: false,
    });

    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [taxId, setTaxId] = useState('');
    const [mcc, setMcc] = useState<SelectedMcc | null>(null);
    const [mccSheetOpen, setMccSheetOpen] = useState(false);
    const [localLogoUri, setLocalLogoUri] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
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

    const handleMediaSelection = (fromCamera: boolean) => {
        setPickerVisible(false);
        setTimeout(async () => {
            const action = fromCamera ? handleSingleCamera : handleSingleGallery;
            const results = await action();
            const uri = results?.[0]?.uri;
            if (uri) setLocalLogoUri(uri);
        }, 100);
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
            let logoAssetId: string | null = null;
            if (localLogoUri) {
                const uploaded = await processLocalAttachments([localLogoUri]);
                if (!uploaded[0]) {
                    showAlert('Failed to upload merchant logo. Try again.', 'error');
                    return;
                }
                logoAssetId = uploaded[0];
            }

            const response = await CreateMerchantApi({
                name: trimmedName,
                mcc_code: mcc?.code ?? null,
                website: website.trim() || null,
                tax_id: taxId.trim() || null,
                logo_asset_id: logoAssetId,
            });

            if (response.data) {
                showAlert(response.message || 'Merchant created successfully', 'success');
                router.back();
            } else {
                showAlert(response.message || 'Failed to create merchant', 'error');
            }
        } catch (err: any) {
            showAlert(
                err?.message || 'An unexpected error occurred. Please try again.',
                'error',
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper
                backgroundColor={heroStatusBar}
                statusBarStyle="light-content"
                withPadding={false}
                className="relative flex-1"
            >
                <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                    <PlatinumFormHeader
                        title="Add Merchant"
                        subtitle="Name · MCC · Logo"
                        onBack={handleBack}
                        disabled={isSaving}
                    />

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
                            <ScrollView
                                className="flex-1"
                                style={{backgroundColor: canvasBg}}
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingTop: 24,
                                    paddingBottom: 120,
                                }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="mb-6 items-center">
                                    <View className="relative">
                                        <View
                                            className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border"
                                            style={{
                                                borderColor: colors.status.border,
                                                backgroundColor: colors.bg.lighter,
                                            }}
                                        >
                                            {localLogoUri ? (
                                                <Image
                                                    source={{uri: localLogoUri}}
                                                    style={{width: '100%', height: '100%'}}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Iconify
                                                    icon="heroicons:building-storefront"
                                                    size={28}
                                                    color={colors.icon.primary}
                                                />
                                            )}
                                        </View>
                                        <Pressable
                                            onPress={() => setPickerVisible(true)}
                                            disabled={isSaving}
                                            accessibilityRole="button"
                                            accessibilityLabel="Change merchant logo"
                                            className="rounded-full border-2 border-white p-1.5 active:opacity-80"
                                            style={{
                                                position: 'absolute',
                                                bottom: -4,
                                                right: -4,
                                                backgroundColor: colors.brand.primary,
                                            }}
                                        >
                                            <Iconify
                                                icon="heroicons:pencil-square"
                                                size={12}
                                                color={colors.text.contrast}
                                            />
                                        </Pressable>
                                    </View>
                                    {localLogoUri ? (
                                        <Pressable
                                            onPress={() => setLocalLogoUri(null)}
                                            disabled={isSaving}
                                            className="mt-2 active:opacity-70"
                                        >
                                            <AppText
                                                variant="caption-xs"
                                                className="font-semibold text-accent-sky"
                                            >
                                                Remove logo
                                            </AppText>
                                        </Pressable>
                                    ) : null}
                                </View>

                                <View className="gap-y-6">
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
                                            className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-canvas px-4 py-3.5"
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
                                                    className="mr-1 p-1"
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
                                        className="h-14 w-full rounded-2xl"
                                        onPress={handleSave}
                                        disabled={isSaving}
                                        loading={isSaving}
                                        loadingText={
                                            localLogoUri ? 'Uploading…' : 'Saving…'
                                        }
                                    >
                                        Save merchant
                                    </AppButton>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <MediaPickerBottomSheet
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={handleMediaSelection}
                />

                <MccPickerBottomSheet
                    visible={mccSheetOpen}
                    selectedCode={mcc?.code}
                    onClose={() => setMccSheetOpen(false)}
                    onSelect={setMcc}
                />
            </ScreenWrapper>
        </BottomSheetModalProvider>
    );
}
