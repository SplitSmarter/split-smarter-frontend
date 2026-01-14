// src/components/CustomText.tsx
import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { useI18n } from "@/src/context/i18nContext";

interface Props extends TextProps {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
    ellipsize?: boolean;
    lines?: number;
}

const CustomText: React.FC<Props> = ({
     children,
     style,
     variant = "primary",
     ellipsize = false,
     lines,
     ...rest
}) => {
    const { font } = useI18n();

    const textStyle: TextStyle = {
        fontFamily: variant === "primary" ? font.primary : font.secondary,
    };

    return (
        <Text style={[textStyle, style]}
              numberOfLines={ellipsize ? lines || 1 : undefined}
              ellipsizeMode={ellipsize ? "tail" : undefined}
              {...rest}
        >
            {children}
        </Text>
    );
};

export default CustomText;
