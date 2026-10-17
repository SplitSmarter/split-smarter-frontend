import { AppText } from "@/src/components/common/AppText";
import { COLORS } from "@/src/constants/colors";
import { ROUTES } from "@/src/constants/routes";
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, LayoutChangeEvent, Pressable, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { PLATINUM_CHART } from "../constants/dashboard.constants";
import { ExpenseSpendPoint } from "../types/dashboard";
import { formatCurrency } from "../utils/dashboard.utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AnalyticsChartProps {
  data: ExpenseSpendPoint[];
  onSelectPoint: (point: ExpenseSpendPoint) => void;
}

function defaultIndex(length: number): number {
  if (length <= 0) return -1;
  return Math.min(2, length - 1);
}

/**
 * gifted-charts LineChart totalWidth = initialSpacing + spacing*n + endSpacing
 * (spacing is summed once per point, including the first). Points sit at
 *   x(i) = initialSpacing + i * spacing
 * so after the last point the library already reserves one full `spacing`.
 *
 * Using endSpacing > 0 on top of that pushes empty space to the right.
 * We set endSpacing=0 and place first/last points symmetrically in `width`.
 *
 * Edge also keeps x-labels visible: label left ≈ x - spacing/2, so edge >= spacing/2
 *  ⇒  edge >= width / (2*n).
 */
function chartLayout(chartWidth: number, pointCount: number) {
  const n = Math.max(pointCount, 1);
  const edge = Math.max(36, Math.ceil(chartWidth / (2 * n)));
  const spacing =
    pointCount > 1 ? (chartWidth - edge * 2) / (pointCount - 1) : 0;
  return {
    edge,
    spacing,
    /** Library already adds one trailing spacing — don't add more. */
    endSpacing: 0 as const,
    width: chartWidth,
  };
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  onSelectPoint,
}) => {
  const router = useRouter();
  const userCurrency = userStore((s) => s.user?.currency);
  const isDark = themeStore((s) => s.theme === "dark");
  const chartColors = isDark ? PLATINUM_CHART.dark : PLATINUM_CHART.light;
  const hasPointer = data.length >= 2;
  const activeIdRef = useRef<string | null>(null);
  const [chartWidth, setChartWidth] = useState(SCREEN_WIDTH - 40);

  const [activePoint, setActivePoint] = useState<ExpenseSpendPoint | null>(
    () => data[defaultIndex(data.length)] ?? null,
  );

  useEffect(() => {
    const next = data[defaultIndex(data.length)] ?? null;
    setActivePoint(next);
    activeIdRef.current = next?.id ?? null;
    if (next) onSelectPoint(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when series changes
  }, [data]);

  const selectPoint = (point: ExpenseSpendPoint | null) => {
    if (!point) return;
    if (activeIdRef.current === point.id) return;
    activeIdRef.current = point.id;
    setActivePoint(point);
    onSelectPoint(point);
  };

  const initialPointerIndex = Math.max(0, defaultIndex(data.length));
  const { edge, spacing, endSpacing, width } = useMemo(
    () => chartLayout(chartWidth, data.length),
    [chartWidth, data.length],
  );

  const onChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - chartWidth) > 1) {
      setChartWidth(w);
    }
  };

  const pointerConfig = useMemo(() => {
    if (!hasPointer) return undefined;

    return {
      pointerStripUptoDataPoint: true,
      pointerStripColor: "rgba(255, 255, 255, 0.4)",
      pointerStripWidth: 1.5,
      strokeDashArray: [4, 4],
      pointerColor: COLORS.light.bg.lighter,
      radius: 5,
      pointerVanishDelay: 0,
      persistPointer: true,
      initialPointerIndex,
      pointerLabelWidth: 0,
      pointerLabelHeight: 0,
      pointerLabelComponent: () => null,
      pointerComponent: () => (
        <View
          className="h-4 w-4 rounded-full border-2 bg-bg-primary-lighter shadow-md"
          style={{ borderColor: chartColors.pointerBorder }}
        />
      ),
    };
  }, [hasPointer, initialPointerIndex, chartColors.pointerBorder]);

  if (data.length === 0) {
    return (
      <View className="h-[120px] w-full items-center justify-center px-4">
        <AppText
          variant="body-small"
          className="text-center font-semibold text-white/70"
        >
          No expenses in this range
        </AppText>
      </View>
    );
  }

  return (
    <View className="w-full" onLayout={onChartLayout}>
      {activePoint && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open expense details"
          onPress={() => {
            if (!activePoint.id) return;
            router.push(ROUTES.expenseDetails(activePoint.id));
          }}
          className="z-10 min-w-[130px] self-center rounded-2xl border border-white/40 bg-bg-primary-lighter/95 px-3 py-1.5 shadow-2xl"
          style={{ marginBottom: -2 }}
        >
          <View className="flex-row items-center justify-between gap-2">
            <AppText
              variant="caption-xs"
              className="font-extrabold text-text-primary"
            >
              {formatCurrency(
                activePoint.amount ?? activePoint.value,
                userCurrency,
              )}
            </AppText>
            <View className="rounded-full bg-bg-secondary px-1.5 py-0.5">
              <AppText
                variant="caption-xs"
                className="text-[8px] font-bold text-text-secondary"
              >
                {activePoint.category ?? "Expense"}
              </AppText>
            </View>
          </View>
          <AppText
            variant="caption-xs"
            className="mt-0.5 text-center text-[9px] font-medium text-text-primary-lighter"
          >
            for {activePoint.date}
          </AppText>
        </Pressable>
      )}

      <View style={{ marginTop: -6, width: chartWidth }}>
        <LineChart
          key={`spend-chart-${isDark ? "dark" : "light"}-${chartWidth}-${data.map((d) => d.id).join("-")}`}
          data={data}
          areaChart
          curved={data.length >= 3}
          height={112}
          width={width}
          parentWidth={chartWidth}
          disableScroll
          initialSpacing={edge}
          endSpacing={endSpacing}
          spacing={spacing}
          yAxisLabelWidth={0}
          yAxisThickness={0}
          xAxisThickness={0}
          color={chartColors.line}
          thickness={3}
          startFillColor={chartColors.fillStart}
          endFillColor={chartColors.fillEnd}
          startOpacity={0.4}
          endOpacity={0.0}
          hideYAxisText
          hideRules
          hideAxesAndRules
          overflowTop={0}
          xAxisLabelTextStyle={{
            color: "rgba(255, 255, 255, 0.65)",
            fontSize: 10,
            fontWeight: "600",
            textAlign: "center",
          }}
          pointerConfig={pointerConfig}
          getPointerProps={(props: any) => {
            const idx = props?.pointerIndex;
            if (typeof idx !== "number" || idx < 0 || idx >= data.length)
              return;
            const point = data[idx];
            if (!point || activeIdRef.current === point.id) return;
            queueMicrotask(() => selectPoint(point));
          }}
          onPress={(item: any) => {
            if (!item) return;
            const dataObj = Array.isArray(item) ? item[0] : item;
            if (!dataObj) return;

            if (
              typeof dataObj.dataIndex === "number" &&
              data[dataObj.dataIndex]
            ) {
              selectPoint(data[dataObj.dataIndex]);
              return;
            }
            const byId =
              dataObj.id != null
                ? data.find((d) => d.id === String(dataObj.id))
                : undefined;
            if (byId) {
              selectPoint(byId);
              return;
            }
            const byLabel = data.find(
              (d) =>
                d.label === dataObj.label &&
                d.value === (dataObj.value ?? dataObj.amount),
            );
            if (byLabel) selectPoint(byLabel);
          }}
        />
      </View>
    </View>
  );
};
