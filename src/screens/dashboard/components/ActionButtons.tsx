import { AppText } from "@/src/components/common/AppText";
import { COLORS } from "@/src/constants/colors";
import { themeStore } from "@/src/store/themeStore";
import React from "react";
import { Pressable, View } from "react-native";
import { Iconify } from "react-native-iconify";

interface ActionButtonsProps {
  /** Left — open expense list. */
  onExpensePress?: () => void;
  /**
   * Middle — Settlements hub.
   * TODO(settlements): wire when settlements screen ships.
   */
  onSettlementsPress?: () => void;
  /** Right — open add-transfer flow. */
  onTransferPress?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExpensePress,
  onSettlementsPress,
  onTransferPress,
}) => {
  const isDark = themeStore((state) => state.theme === "dark");
  const colors = isDark ? COLORS.dark : COLORS.light;

  const ctaStyle = {
    backgroundColor: colors.brand.primary,
    borderColor: isDark
      ? "rgba(15, 23, 42, 0.12)"
      : "rgba(255, 255, 255, 0.25)",
  };
  const labelColor = colors.text.contrast;

  return (
    <View className="z-10 mb-6 -mt-5 flex-row items-center justify-between px-5">
      <Pressable
        onPress={onExpensePress}
        accessibilityRole="button"
        accessibilityLabel="Expense"
        style={ctaStyle}
        className="mr-2 flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3.5 shadow-xl active:opacity-90"
      >
        <Iconify icon="heroicons:banknotes" size={18} color={labelColor} />
        <AppText
          variant="body-small"
          className="ml-2 font-bold"
          style={{ color: labelColor }}
        >
          Expense
        </AppText>
      </Pressable>

      <Pressable
        onPress={onSettlementsPress}
        accessibilityRole="button"
        accessibilityLabel="Settlements"
        style={ctaStyle}
        className="mr-2 h-12 w-12 items-center justify-center rounded-2xl border shadow-xl active:opacity-90"
      >
        <Iconify icon="octicon:arrow-switch-16" size={18} color={labelColor} />
      </Pressable>

      <Pressable
        onPress={onTransferPress}
        accessibilityRole="button"
        accessibilityLabel="Transfer"
        style={ctaStyle}
        className="flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3.5 shadow-xl active:opacity-90"
      >
        <Iconify
          icon="heroicons:arrow-down-left"
          size={18}
          color={labelColor}
        />
        <AppText
          variant="body-small"
          className="ml-2 font-bold"
          style={{ color: labelColor }}
        >
          Transfer
        </AppText>
      </Pressable>
    </View>
  );
};
