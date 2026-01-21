import React, { useEffect, useState } from "react";
import { View, Image, ActivityIndicator, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { useThemeStore } from "@/src/store/useThemeStore";
import { getIcon } from "@/src/utils/icons";
import { useLocalSearchParams } from "expo-router";
import { getExpenseServiceByIdApi } from "@/src/api/expense/services";
import { GetExpenseServiceByIdResponse } from "@/src/interfaces/expense";
import CustomIcon from "@/src/components/common/CustomIcon";

const ExpenseServiceDetailsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useThemeStore();
    const isDark = theme === "dark";
    const { serviceId } = useLocalSearchParams();

    const [service, setService] = useState<GetExpenseServiceByIdResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await getExpenseServiceByIdApi(Number(serviceId));
                setService(res.data);
            } catch (err: any) {
                setError(err.message || "Failed to load services");
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !service) {
        return (
            <View className="flex-1 items-center justify-center px-4">
                <CustomText className="text-red-500 text-center">
                    {error || "Service not found"}
                </CustomText>
            </View>
        );
    }

    const iconSource = getIcon(service.icon_identifier, service.icon_name || "");

    return (
        <ScrollView className={`flex-1 p-6 ${isDark ? "bg-black" : "bg-white"}`}>
            <View className="items-center mb-6">
                <CustomIcon identifier={service.icon_identifier} name={service.icon_name} />

                <CustomText className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {service.title}
                </CustomText>
                {service.description ? (
                    <CustomText className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {service.description}
                    </CustomText>
                ) : null}
            </View>

            <View className="border-t border-b py-4 border-gray-300">
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Service Type")}: {service.service_type}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Owner")}: {service.owner.name ?? t("Default")}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Cost")}: ₹{service.cost.toFixed(2)}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Created On")}: {new Date(service.created_on).toLocaleString()}
                </CustomText>
            </View>
        </ScrollView>
    );
};

export default ExpenseServiceDetailsScreen;
