import {ViewStyle} from 'react-native';
import {COLORS} from '@/src/constants/colors';

/** Dashboard-matching white elevated card (BudgetsFinancialHealth pattern). */
export function getElevatedCardStyle(isDark: boolean): ViewStyle {
    const colors = isDark ? COLORS.dark : COLORS.light;
    return {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
        shadowColor: COLORS.light.brand.primary,
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 4},
        elevation: 3,
    };
}
