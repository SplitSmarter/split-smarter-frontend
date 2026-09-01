import React, {useEffect, useState} from 'react';
import {LayoutAnimation, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, View,} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {AppText} from "@/src/components/common/AppText";

import {CategoryStepContent} from '@/src/components/payments/add_account_steps/CategoryStepContent';
import {ProviderStepContent} from '@/src/components/payments/add_account_steps/ProviderStepContent';
import {
    AccountDetailsStepContent,
    FormValues
} from '@/src/components/payments/add_account_steps/AccountDetailsStepContent';

import {ConsumerPaymentCategorySummaryResponse} from "@/src/api/dto/user_payments/categories";
import {GetConsumerPaymentCategorySummariesApi} from "@/src/api/user_payment/categories";
import {PaymentAccountAddOptionsDTO} from "@/src/api/dto/user_payments/account";
import {PaymentRailProviderBasicDetails} from "@/src/api/dto/user_payments/base_dto";
import {GetPaymentAccountAddOptionsApi} from "@/src/api/user_payment/accounts";
import {UserAccountType} from "@/src/api/dto/user_payments/constant";
import {userStore} from "@/src/store/userStore";

type Step = 1 | 2 | 3;

export interface AccountLinkingScreenProps {
    userId?: number;
    userType?: UserAccountType;
    onAccountLinked?: () => void;
}

export default function AccountLinkingScreen({
                                                 userId: propUserId,
                                                 userType: propUserType,
                                                 onAccountLinked,
                                             }: AccountLinkingScreenProps) {
    // Fall back to userStore user ID if propUserId is omitted or undefined
    const loggedInUser = userStore((state) => state.user);
    const targetUserId = propUserId ?? loggedInUser?.id;

    // Fall back to 'user' if propUserType is omitted or undefined
    const targetUserType: UserAccountType = propUserType ?? UserAccountType.USER;

    const [currentStep, setCurrentStep] = useState<Step>(1);

    // Dynamic Categories State
    const [categories, setCategories] = useState<ConsumerPaymentCategorySummaryResponse[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // Dynamic Options State (Providers & Details)
    const [addOptions, setAddOptions] = useState<PaymentAccountAddOptionsDTO | null>(null);
    const [isOptionsLoading, setIsOptionsLoading] = useState<boolean>(true);
    const [optionsError, setOptionsError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<ConsumerPaymentCategorySummaryResponse | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<PaymentRailProviderBasicDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formValues, setFormValues] = useState<FormValues>({
        identifier: '',
        ifscCode: '',
        nickname: '',
        startingBalance: '',
    });

    const isMounted = React.useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Fetch initial setup data on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsCategoriesLoading(true);
            setIsOptionsLoading(true);
            setCategoriesError(null);
            setOptionsError(null);

            // Execute parallel requests
            const [categoriesRes, optionsRes] = await Promise.all([
                GetConsumerPaymentCategorySummariesApi(),
                GetPaymentAccountAddOptionsApi(),
            ]);

            // Handle Categories
            if ('data' in categoriesRes && categoriesRes.data) {
                setCategories(categoriesRes.data);
            } else {
                setCategoriesError(categoriesRes.message || "Failed to load payment categories.");
            }
            setIsCategoriesLoading(false);

            // Handle Add Options
            if ('data' in optionsRes && optionsRes.data) {
                setAddOptions(optionsRes.data);
            } else {
                setOptionsError(optionsRes.message || "Failed to load provider options.");
            }
            setIsOptionsLoading(false);
        };

        fetchInitialData();
    }, []);

    const handleFormValueChange = (field: keyof FormValues, value: string) => {
        setFormValues((prev) => ({...prev, [field]: value}));
    };

    const changeStep = (newStep: Step) => {
        // DO NOT use LayoutAnimation here when inside tab navigators
        setCurrentStep(newStep);
    };

    const handleSelectCategory = (category: ConsumerPaymentCategorySummaryResponse) => {
        setSelectedCategory(category);
        setSelectedProvider(null);
        changeStep(2);
    };

    const handleSelectProvider = (provider: PaymentRailProviderBasicDetails) => {
        setSelectedProvider(provider);
        changeStep(3);
    };

    const handleNodePress = (stepNumber: Step) => {
        if (stepNumber < currentStep) {
            changeStep(stepNumber);
        }
    };

    const handleHeaderBack = () => {
        if (currentStep > 1) {
            changeStep((currentStep - 1) as Step);
        }
    };

    const handleLinkAccount = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            if (!isMounted.current) return;
            setIsSubmitting(false);
            if (onAccountLinked) {
                onAccountLinked();
            }
        }, 500);
    };

    return (
        <SafeAreaView style={{flex: 1}} className="bg-bg-primary">
            <StatusBar barStyle="default"/>

            {/* Top Header */}
            <View className="h-14 flex-row items-center justify-between px-4 bg-bg-primary">
                {currentStep > 1 ? (
                    <TouchableOpacity onPress={handleHeaderBack} className="p-2">
                        <Ionicons name="chevron-back" size={24} className="text-icon-primary"/>
                    </TouchableOpacity>
                ) : (
                    <View className="w-10"/>
                )}
                <AppText variant="h4" className="font-bold text-text-primary">
                    Add Account
                </AppText>
                <View className="w-10"/>
            </View>

            <ScrollView contentContainerStyle={{paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40}}
                        showsVerticalScrollIndicator={false}>
                <View className="flex-col">

                    {/* STEP 1 NODE & CONTENT */}
                    <View className="flex-row mb-2">
                        <View className="items-center mr-4 w-8">
                            <TouchableOpacity
                                activeOpacity={currentStep > 1 ? 0.7 : 1}
                                onPress={() => handleNodePress(1)}
                                className="z-10"
                            >
                                {currentStep > 1 ? (
                                    <View className="w-7 h-7 rounded-full bg-bg-secondary justify-center items-center">
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF"/>
                                    </View>
                                ) : (
                                    <View
                                        className="w-7 h-7 rounded-full bg-bg-secondary-lighter border-2 border-bg-secondary justify-center items-center">
                                        <View className="w-3 h-3 rounded-full bg-bg-secondary"/>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View
                                className={`w-[2px] flex-1 my-1 ${currentStep > 1 ? 'bg-bg-secondary' : 'bg-bg-primary-darker'}`}/>
                        </View>

                        <View className="flex-1 pb-6">
                            <AppText variant="caption-xs"
                                     className="font-bold text-text-primary-lighter tracking-wider mb-0.5">
                                STEP 1
                            </AppText>
                            <AppText variant="h4"
                                     className={`font-bold text-text-primary ${currentStep !== 1 ? 'mb-0.5' : 'mb-3'}`}>
                                Account Category
                            </AppText>
                            {currentStep !== 1 && selectedCategory && (
                                <AppText variant="body-small" className="font-semibold text-text-link">
                                    {selectedCategory.name}
                                </AppText>
                            )}

                            {currentStep === 1 && (
                                <CategoryStepContent
                                    categories={categories}
                                    isLoading={isCategoriesLoading}
                                    error={categoriesError}
                                    onSelectCategory={handleSelectCategory}
                                />
                            )}
                        </View>
                    </View>

                    {/* STEP 2 NODE & CONTENT */}
                    <View className="flex-row mb-2">
                        <View className="items-center mr-4 w-8">
                            <TouchableOpacity
                                activeOpacity={currentStep > 2 ? 0.7 : 1}
                                onPress={() => handleNodePress(2)}
                                className="z-10"
                            >
                                {currentStep > 2 ? (
                                    <View className="w-7 h-7 rounded-full bg-bg-secondary justify-center items-center">
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF"/>
                                    </View>
                                ) : currentStep === 2 ? (
                                    <View
                                        className="w-7 h-7 rounded-full bg-bg-secondary-lighter border-2 border-bg-secondary justify-center items-center">
                                        <View className="w-3 h-3 rounded-full bg-bg-secondary"/>
                                    </View>
                                ) : (
                                    <View
                                        className="w-7 h-7 rounded-full border-[1.5px] border-bg-primary-darker bg-bg-canvas justify-center items-center">
                                        <MaterialCommunityIcons name="bank-outline" size={16}
                                                                className="text-icon-primary-lighter"/>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View
                                className={`w-[2px] flex-1 my-1 ${currentStep > 2 ? 'bg-bg-secondary' : 'bg-bg-primary-darker'}`}/>
                        </View>

                        <View className="flex-1 pb-6">
                            <AppText
                                variant="caption-xs"
                                className={`font-bold tracking-wider mb-0.5 ${currentStep < 2 ? 'text-text-primary-placeholder' : 'text-text-primary-lighter'}`}
                            >
                                STEP 2
                            </AppText>
                            <AppText
                                variant="h4"
                                className={`font-bold ${currentStep < 2 ? 'text-text-primary-placeholder' : 'text-text-primary'} ${currentStep !== 2 ? 'mb-0.5' : 'mb-3'}`}
                            >
                                Provider
                            </AppText>
                            {currentStep > 2 && selectedProvider && (
                                <AppText variant="body-small" className="font-semibold text-text-link">
                                    {selectedProvider.display_name || selectedProvider.name}
                                </AppText>
                            )}

                            {currentStep === 2 && selectedCategory && (
                                <ProviderStepContent
                                    selectedCategory={selectedCategory}
                                    addOptions={addOptions}
                                    isLoading={isOptionsLoading}
                                    error={optionsError}
                                    onSelectProvider={handleSelectProvider}
                                />
                            )}
                        </View>
                    </View>

                    {/* STEP 3 NODE & CONTENT */}
                    <View className="flex-row mb-2">
                        <View className="items-center mr-4 w-8">
                            <TouchableOpacity activeOpacity={1} className="z-10">
                                {currentStep === 3 ? (
                                    <View
                                        className="w-7 h-7 rounded-full bg-bg-secondary-lighter border-2 border-bg-secondary justify-center items-center">
                                        <View className="w-3 h-3 rounded-full bg-bg-secondary"/>
                                    </View>
                                ) : (
                                    <View
                                        className="w-7 h-7 rounded-full border-[1.5px] border-bg-primary-darker bg-bg-canvas justify-center items-center">
                                        <Ionicons name="card-outline" size={16} className="text-icon-primary-lighter"/>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 pb-6">
                            <AppText
                                variant="caption-xs"
                                className={`font-bold tracking-wider mb-0.5 ${currentStep < 3 ? 'text-text-primary-placeholder' : 'text-text-primary-lighter'}`}
                            >
                                STEP 3
                            </AppText>
                            <AppText
                                variant="h4"
                                className={`font-bold ${currentStep < 3 ? 'text-text-primary-placeholder' : 'text-text-primary'}`}
                            >
                                Account Details
                            </AppText>

                            {currentStep === 3 && selectedCategory && selectedProvider && targetUserId && (
                                <AccountDetailsStepContent
                                    userId={targetUserId}
                                    userType={targetUserType}
                                    selectedCategory={selectedCategory}
                                    selectedProvider={selectedProvider}
                                    formValues={formValues}
                                    onFormValueChange={handleFormValueChange}
                                    onSubmit={handleLinkAccount}
                                    isSubmitting={isSubmitting}
                                />
                            )}
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}