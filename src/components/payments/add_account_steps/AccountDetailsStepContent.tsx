import { PaymentRailProviderBasicDetails } from "@/src/api/dto/user_payments/base_dto";
import { ConsumerPaymentCategorySummaryResponse } from "@/src/api/dto/user_payments/categories";
import { UserAccountType } from "@/src/api/dto/user_payments/constant";
import { AppButtonV2 } from "@/src/components/common/AppButtonV2";
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { UPIDetailsForm } from '@/src/components/payments/add_account_steps/UPIDetailsForm';
import React from 'react';
import { View } from 'react-native';

export interface FormValues {
    identifier: string;
    ifscCode: string;
    nickname: string;
    startingBalance: string;
}

interface AccountDetailsStepContentProps {
    userId: number;
    userType: UserAccountType;
    selectedCategory: ConsumerPaymentCategorySummaryResponse;
    selectedProvider: PaymentRailProviderBasicDetails;
    formValues: FormValues;
    onFormValueChange: (field: keyof FormValues, value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const AccountDetailsStepContent: React.FC<AccountDetailsStepContentProps> = ({
                                                                                        userId,
                                                                                        userType,
                                                                                        selectedCategory,
                                                                                        selectedProvider,
                                                                                        formValues,
                                                                                        onFormValueChange,
                                                                                        onSubmit,
                                                                                        isSubmitting,
                                                                                    }) => {
    // Route to UPI specific form component if category is instant pay/UPI
    if (selectedCategory.id === 'instant_pay' || selectedCategory.id === 'upi') {
        return (
            <UPIDetailsForm
                userId={userId}
                userType={userType}
                selectedProvider={selectedProvider}
                onAccountAdded={onSubmit}
            />
        );
    }

    return (
        <View className="bg-bg-canvas rounded-2xl p-4 border border-bg-primary-darker shadow-sm mt-3 gap-y-4">
            {selectedCategory.id === 'bank' ? (
                <>
                    <AppInput
                        label="Account Number"
                        required
                        placeholder="e.g., 987654321012"
                        keyboardType="number-pad"
                        value={formValues.identifier}
                        onChangeText={(t) => onFormValueChange('identifier', t)}
                    />
                    <AppInput
                        label="IFSC Code"
                        required
                        placeholder="e.g., HDFC0001234"
                        autoCapitalize="characters"
                        value={formValues.ifscCode}
                        onChangeText={(t) => onFormValueChange('ifscCode', t)}
                    />
                </>
            ) : null}

            {selectedCategory.id === 'card' ? (
                <AppInput
                    label="Card Last 4 Digits"
                    required
                    placeholder="e.g., 4321"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={formValues.identifier}
                    onChangeText={(t) => onFormValueChange('identifier', t)}
                />
            ) : null}

            {/* Common Form Controls */}
            <AppInput
                label="Account Nickname"
                placeholder="e.g., Primary Salary Account"
                value={formValues.nickname}
                onChangeText={(t) => onFormValueChange('nickname', t)}
            />

            <AppInput
                label="Starting Balance"
                placeholder="0.00"
                keyboardType="numeric"
                value={formValues.startingBalance}
                onChangeText={(t) => onFormValueChange('startingBalance', t)}
                renderLeftIcon={(iconColor) => (
                    <AppText variant="body-base" style={{color: iconColor}} className="font-semibold">
                        RS.
                    </AppText>
                )}
            />

            {/* Submit Action */}
            <AppButtonV2
                variant="primary"
                size="lg"
                vibrate
                hasShadow
                loading={isSubmitting}
                loadingText="Linking..."
                onPress={onSubmit}
                className="mt-2"
            >
                Link Account
            </AppButtonV2>
        </View>
    );
};