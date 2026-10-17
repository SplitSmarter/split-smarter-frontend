import { themeStore } from "@/src/store/themeStore";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { PLATINUM_HERO_GRADIENT } from "../constants/dashboard.constants";
import { ExpenseSpendPoint, UserProfile } from "../types/dashboard";
import { AnalyticsChart } from "./AnalyticsChart";
import { HeaderBar } from "./HeaderBar";
import { SpendSummary } from "./SpendSummary";

interface HeaderCardSectionProps {
  profile: UserProfile;
  totalSpend: number;
  categoryTag: string;
  spendChartData: ExpenseSpendPoint[];
  onSelectPoint: (point: ExpenseSpendPoint) => void;
  onNotificationPress?: () => void;
  onFilterPress?: () => void;
}

export const HeaderCardSection: React.FC<HeaderCardSectionProps> = ({
  profile,
  totalSpend,
  categoryTag,
  spendChartData,
  onSelectPoint,
  onNotificationPress,
  onFilterPress,
}) => {
  const isDark = themeStore((state) => state.theme === "dark");
  const gradient = isDark
    ? PLATINUM_HERO_GRADIENT.dark
    : PLATINUM_HERO_GRADIENT.light;

  return (
    <LinearGradient
      colors={[...gradient]}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.9, y: 0.9 }}
      className="px-5 pb-10 pt-1"
      style={{
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        overflow: "hidden",
      }}
    >
      <HeaderBar
        profile={profile}
        onNotificationPress={onNotificationPress}
        onFilterPress={onFilterPress}
      />
      <SpendSummary totalSpend={totalSpend} categoryTag={categoryTag} />
      <AnalyticsChart data={spendChartData} onSelectPoint={onSelectPoint} />
    </LinearGradient>
  );
};
