import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useI18nStore } from '@/src/store/useI18nStore';
import CustomText from '@/src/components/common/CustomText';

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AccordionItemProps = {
    title: string;
    children: React.ReactNode;
    initiallyOpen?: boolean;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, initiallyOpen = false }) => {
    const [open, setOpen] = useState(initiallyOpen);
    const { theme } = useThemeStore();
    const { font } = useI18nStore();

    const isDark = theme === 'dark';

    const toggleAccordion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(!open);
    };

    return (
        <View className={`mb-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            <TouchableOpacity
                onPress={toggleAccordion}
                className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
                <CustomText
                    className={`text-base font-semibold ${isDark ? 'text-white' : 'text-black'}`}
                    style={{ fontFamily: font.primary }}
                >
                    {title}
                </CustomText>
            </TouchableOpacity>

            {open && (
                <View className={`p-4 ${isDark ? 'bg-black' : 'bg-white'}`}>
                    {children}
                </View>
            )}
        </View>
    );
};

export default AccordionItem;
