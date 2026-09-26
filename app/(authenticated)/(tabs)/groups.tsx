import {View} from "react-native";
import React, {useState} from "react";
import {useRouter} from "expo-router";
import {authStore} from "@/src/store/authStore";
import {AppButton} from "@/src/components/common/AppButton";
import ThemeToggle from "@/src/components/common/themeToggle";
import {SelectDateBottomSheet} from "@/src/components/common/SelectDateBottomSheet";
import {DurationSelectionBottomSheet} from "@/src/components/common/DurationSelectionBottomSheet";

const GroupsScreen = () => {
    const {user, logout} = authStore();
    const router = useRouter();

    // Sheet visibility state
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);

    return (
        <View className="flex-1 p-4 gap-y-3">
            <AppButton
                onPress={() => router.push("/expense/add")}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
                loading={false}
            >
                Add Expense
            </AppButton>

            <AppButton
                onPress={() => router.push("/payment/account/add")}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
                loading={false}
            >
                Add Account
            </AppButton>

            {/* Schedule Bottom Sheet Trigger */}
            <AppButton
                onPress={() => setIsScheduleOpen(true)}
                variant="secondary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Select Schedule
            </AppButton>

            {/* Duration Bottom Sheet Trigger */}
            <AppButton
                onPress={() => setIsDurationOpen(true)}
                variant="secondary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Select Duration
            </AppButton>

            <ThemeToggle/>

            {/* Schedule Bottom Sheet Modal */}
            <SelectDateBottomSheet
                visible={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onConfirm={(result) => {
                    console.log("Schedule selected:", result);
                    setIsScheduleOpen(false);
                }}
            />

            {/* Duration Bottom Sheet Modal */}
            <DurationSelectionBottomSheet
                visible={isDurationOpen}
                onClose={() => setIsDurationOpen(false)}
                onSave={(data) => {
                    console.log("Duration selected:", data);
                    setIsDurationOpen(false);
                }}
            />
        </View>
    );
};

export default GroupsScreen;