// src/components/common/AppText/AppText.v2.tsx
import React from 'react';
import {Text as RNText, TextProps as RNTextProps} from 'react-native';
import {i18nStore} from '@/src/store/i18nStore';
import {
    appTextVariants,
    AppTextVariantProps,
    cn,
} from './AppText.styles';

export interface AppTextV2Props
    extends Omit<RNTextProps, 'children'>,
        AppTextVariantProps {
    fontType?: 'primary' | 'secondary';
    className?: string;
    children?: React.ReactNode;
}

export const AppText: React.FC<AppTextV2Props> = ({
                                                      variant,
                                                      colorScheme,
                                                      fontType = 'primary',
                                                      className = '',
                                                      style,
                                                      children,
                                                      ...props
                                                  }) => {
    const {font, isLoaded} = i18nStore();

    const activeFontFamily = fontType === 'primary' ? font.primary : font.secondary;

    return (
        <RNText
            className={cn(appTextVariants({variant, colorScheme}), className)}
            style={[{fontFamily: isLoaded ? activeFontFamily : 'System'}, style]}
            {...props}
        >
            {children}
        </RNText>
    );
};

export default AppText;