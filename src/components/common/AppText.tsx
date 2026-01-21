// /src/components/common/AppText.tsx
import { Text, TextProps } from "react-native";
import { useI18nStore } from "@/src/store/useI18nStore";

interface AppTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body-large' | 'body-base' | 'body-small' | 'caption-xs' | 'body-xs';
    fontType?: 'primary' | 'secondary';
    className?: string;
}
// /src/components/common/AppText.tsx
export const AppText = ({
                            variant = 'body-base',
                            fontType = 'primary',
                            className = "",
                            style,
                            ...props
                        }: AppTextProps) => {
    const { font, isLoaded } = useI18nStore();

    const variantClasses: Record<NonNullable<AppTextProps['variant']>, string> = {
        'h1': "text-heading-h1",
        'h2': "text-heading-h2",
        'h3': "text-heading-h3",
        'h4': "text-heading-h4",
        'body-large': "text-body-large",
        'body-base': "text-body-base",
        'body-small': "text-body-small",
        'caption-xs': "text-caption-xs",
        'body-xs': "text-body-xs",
    };

    const activeFontFamily = fontType === 'primary' ? font.primary : font.secondary;

    // Check if the className passed in already contains a 'text-' color class
    const hasCustomColor = className.includes('text-');

    return (
        <Text
            // Only apply text-foreground if no custom text color is provided
            className={`${variantClasses[variant]} ${!hasCustomColor ? 'text-foreground' : ''} ${className}`}
            style={[{ fontFamily: isLoaded ? activeFontFamily : 'System' }, style]}
            {...props}
        />
    );
};