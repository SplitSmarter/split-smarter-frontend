import { PaymentRailProviderBasicDetails } from "@/src/api/dto/user_payments/base_dto";
import { UserAccountType } from "@/src/api/dto/user_payments/constant";
import { AddUPIAccountApi, VerifyVPAHandleApi } from "@/src/api/user_payment/upi";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

interface UPIDetailsFormProps {
    userId: number;
    userType: UserAccountType;
    selectedProvider: PaymentRailProviderBasicDetails;
    onAccountAdded: () => void;
}

// Simple VPA structure check before making API call
const VPA_REGEX = /^[\w.-]+@[\w.-]+$/;

export const UPIDetailsForm: React.FC<UPIDetailsFormProps> = ({
                                                                  userId,
                                                                  userType,
                                                                  selectedProvider,
                                                                  onAccountAdded,
                                                              }) => {
    // State management
    const [vpa, setVpa] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Background auto-verification effect with debouncing
    useEffect(() => {
        const trimmedVpa = vpa.trim();

        // Reset verification states if empty
        if (!trimmedVpa) {
            setIsVerified(false);
            setAccountName(null);
            setErrorMsg(null);
            setIsVerifying(false);
            return;
        }

        // Basic syntax check before hitting the network
        if (!VPA_REGEX.test(trimmedVpa)) {
            setIsVerified(false);
            setAccountName(null);
            setErrorMsg(null); // Clear errors while user is still typing standard text
            setIsVerifying(false);
            return;
        }

        setIsVerifying(true);
        setErrorMsg(null);

        const timer = setTimeout(async () => {
            try {
                const response = await VerifyVPAHandleApi({ vpa: trimmedVpa });

                if (!isMounted.current) return;

                if ('data' in response && response.data?.is_valid) {
                    setAccountName(response.data.account_name || "Verified Account Holder");
                    setIsVerified(true);
                    setErrorMsg(null);
                } else {
                    setIsVerified(false);
                    setAccountName(null);
                    setErrorMsg(
                        ('message' in response && response.message)
                            ? response.message
                            : "Invalid or unreachable UPI ID."
                    );
                }
            } catch (err: any) {
                if (!isMounted.current) return;
                setIsVerified(false);
                setAccountName(null);
                setErrorMsg(err?.message || "Verification network error.");
            } finally {
                if (isMounted.current) {
                    setIsVerifying(false);
                }
            }
        }, 600); // 600ms debounce delay

        return () => clearTimeout(timer);
    }, [vpa]);

    const handleVpaChange = (text: string) => {
        setVpa(text);
        if (isVerified) {
            setIsVerified(false);
            setAccountName(null);
        }
    };

    // Explicit logic for button disabled state
    const getIsDisabled = (): boolean => {
        const trimmedVpa = vpa.trim();
        if (!trimmedVpa) return true;
        if (!VPA_REGEX.test(trimmedVpa)) return true;
        if (isVerifying) return true;
        if (!isVerified) return true;
        if (isSubmitting) return true;
        return false;
    };

    const isDisabled = getIsDisabled();

    const handleAddAccount = async () => {
        if (isDisabled) return;

        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            console.log({
                user_id: userId,
                user_type: userType,
                vpa: vpa.trim(),
                provider_id: selectedProvider.id,
            })
            const response = await AddUPIAccountApi({
                user_id: userId,
                user_type: userType,
                vpa: vpa.trim(),
                provider_id: selectedProvider.id,
            });

            if (!isMounted.current) return;

            if ('data' in response && response.data) {
                onAccountAdded();
            } else {
                setErrorMsg(
                    ('message' in response && response.message)
                        ? response.message
                        : "Failed to link UPI account."
                );
            }
        } catch (err: any) {
            if (!isMounted.current) return;
            setErrorMsg(err?.message || "Linking request failed.");
        } finally {
            if (isMounted.current) {
                setIsSubmitting(false);
            }
        }
    };

    const providerTitle = selectedProvider.display_name || selectedProvider.name || 'UPI Account';

    return (
        <View className="bg-bg-canvas rounded-2xl p-4 border border-bg-primary-darker shadow-sm mt-3 gap-y-4">
            <View>
                <AppInput
                    label="UPI ID / VPA"
                    required
                    placeholder="e.g., mobile-number@upi"
                    value={vpa}
                    onChangeText={handleVpaChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    renderRightIcon={() =>
                        isVerifying ? <ActivityIndicator size="small" /> : null
                    }
                />
            </View>

            {/* Verified Account Holder Display Card */}
            {isVerified && (
                <View className="bg-bg-primary p-3 rounded-xl border border-bg-primary-darker flex-row items-center gap-3">
                    <View className="w-6 h-6 rounded-full bg-text-success items-center justify-center">
                        <AppText className="text-white text-xs font-bold">✓</AppText>
                    </View>
                    <View className="flex-1">
                        <AppText variant="caption-xs" className="text-text-primary-lighter">
                            Verified Name
                        </AppText>
                        <AppText variant="body-small" className="font-semibold text-text-primary">
                            {accountName}
                        </AppText>
                    </View>
                </View>
            )}

            {errorMsg ? (
                <AppText variant="caption-xs" className="text-text-error font-medium">
                    {errorMsg}
                </AppText>
            ) : null}

            {/* Direct Pressable Action Button */}
            <Pressable
                onPress={handleAddAccount}
                disabled={isDisabled}
                className={`
                    mt-2 py-4 px-8 rounded-2xl border border-transparent
                    bg-bg-secondary flex-row items-center justify-center gap-x-2
                    ${isDisabled ? 'opacity-50' : 'active:scale-98'}
                `}
            >
                {isSubmitting ? (
                    <>
                        <ActivityIndicator size="small" className="text-text-secondary" />
                        <AppText variant="body-large" className="font-bold text-text-secondary">
                            Linking UPI...
                        </AppText>
                    </>
                ) : (
                    <AppText variant="body-large" className="font-bold text-text-secondary">
                        {`Link ${providerTitle}`}
                    </AppText>
                )}
            </Pressable>
        </View>
    );
};

UPIDetailsForm.displayName = "UPIDetailsForm";