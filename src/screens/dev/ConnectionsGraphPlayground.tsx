import React from 'react';
import { ScrollView, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { COLORS } from '@/src/constants/colors';
import { themeStore } from '@/src/store/themeStore';
import { ExpenseSplitGraph } from '@/src/components/expense/connections-graph/ExpenseSplitGraph';
import { MOCK_EXPENSE_SPLIT_GRAPH } from '@/src/screens/dev/connections-graph-mock';

/**
 * Dev-only playground with mock data.
 * Live draft graph lives on Add Expense via buildGraphFromDraft.
 */
export default function ConnectionsGraphPlayground() {
    const isDark = themeStore((s) => s.theme === 'dark');

    return (
        <ScreenWrapper
            backgroundColor={isDark ? COLORS.dark.bg.primary : COLORS.light.bg.primary}
            statusBarStyle={isDark ? 'light-content' : 'dark-content'}
            withPadding
            className="flex-1"
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4">
                    <AppText variant="h3" className="text-text-primary">
                        Connections (mock)
                    </AppText>
                    <AppText variant="body-small" className="text-text-primary-lighter">
                        Dev playground — Add Expense uses live draft data
                    </AppText>
                </View>

                <ExpenseSplitGraph data={MOCK_EXPENSE_SPLIT_GRAPH} />
            </ScrollView>
        </ScreenWrapper>
    );
}
