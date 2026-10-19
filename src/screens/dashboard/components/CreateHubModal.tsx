import React from 'react';
import {Dimensions, Modal, Pressable, ScrollView, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {ROUTES} from '@/src/constants/routes';

interface CreateHubModalProps {
    visible: boolean;
    onClose: () => void;
}

type HubHref = string | {pathname: string; params?: Record<string, string>};

/**
 * Cap card height so the list scrolls instead of filling the screen.
 * Tweak `MODAL_MAX_HEIGHT_RATIO` (0–1 of window height) to grow/shrink the modal.
 */
const MODAL_MAX_HEIGHT_RATIO = 0.66;
const MODAL_MAX_HEIGHT = Math.round(
    Dimensions.get('window').height * MODAL_MAX_HEIGHT_RATIO
);

function SecondaryRow({
    title,
    subtitle,
    onPress,
    isLast,
    icon,
}: {
    title: string;
    subtitle: string;
    onPress: () => void;
    isLast?: boolean;
    icon: React.ReactNode;
}) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={title}
            className={`flex-row items-center justify-between py-3 active:opacity-80 ${
                !isLast ? 'border-b border-border-input' : ''
            }`}
        >
            <View className="flex-row items-center flex-1 pr-3">
                <View
                    className="mr-3 h-10 w-10 items-center justify-center rounded-2xl border"
                    style={{
                        backgroundColor: colors.bg.primary,
                        borderColor: colors.status.border,
                    }}
                >
                    {icon}
                </View>
                <View className="flex-1 justify-center">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {title}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="mt-0.5 text-text-primary-lighter"
                    >
                        {subtitle}
                    </AppText>
                </View>
            </View>
            <Iconify
                icon="heroicons:chevron-right"
                size={18}
                color={colors.icon.lighter}
            />
        </Pressable>
    );
}

export const CreateHubModal: React.FC<CreateHubModalProps> = ({visible, onClose}) => {
    const router = useRouter();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const ctaStyle = {
        backgroundColor: colors.brand.primary,
        borderColor: isDark
            ? 'rgba(15, 23, 42, 0.12)'
            : 'rgba(255, 255, 255, 0.25)',
    };
    const labelColor = colors.text.contrast;

    const go = (href: HubHref) => {
        onClose();
        router.push(href as any);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View className="flex-1 items-center justify-center bg-black/55 px-5">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss create menu"
                    onPress={onClose}
                    className="absolute inset-0"
                />
                <View
                    className="w-full overflow-hidden rounded-[28px] border"
                    style={{
                        maxHeight: MODAL_MAX_HEIGHT,
                        backgroundColor: colors.bg.lighter,
                        borderColor: colors.status.border,
                    }}
                >
                    <View className="flex-row items-center justify-between border-b border-border-input px-5 py-4">
                        <View>
                            <AppText variant="h4" className="font-bold text-text-primary">
                                Create
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 text-text-primary-lighter"
                            >
                                Quick add from your dashboard
                            </AppText>
                        </View>
                        <Pressable
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Close create menu"
                            className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
                            style={{backgroundColor: colors.bg.primary}}
                        >
                            <Iconify
                                icon="heroicons:x-mark"
                                size={18}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    </View>

                    <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        bounces
                        style={{maxHeight: MODAL_MAX_HEIGHT - 72}}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: 16,
                            paddingBottom: 20,
                        }}
                    >
                        <View className="mb-5 flex-row items-stretch">
                            <Pressable
                                onPress={() => go(ROUTES.expenseAdd())}
                                accessibilityRole="button"
                                accessibilityLabel="Add expense"
                                style={ctaStyle}
                                className="mr-2 flex-1 items-center justify-center rounded-2xl border px-2 py-3.5 shadow-xl active:opacity-90"
                            >
                                <Iconify
                                    icon="heroicons:banknotes"
                                    size={18}
                                    color={labelColor}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="mt-1.5 font-bold"
                                    style={{color: labelColor}}
                                >
                                    Expense
                                </AppText>
                            </Pressable>

                            <Pressable
                                onPress={() => go(ROUTES.expenseAdd({tab: 'transfer'}))}
                                accessibilityRole="button"
                                accessibilityLabel="Add transfer"
                                style={ctaStyle}
                                className="mr-2 flex-1 items-center justify-center rounded-2xl border px-2 py-3.5 shadow-xl active:opacity-90"
                            >
                                <Iconify
                                    icon="heroicons:arrow-down-left"
                                    size={18}
                                    color={labelColor}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="mt-1.5 font-bold"
                                    style={{color: labelColor}}
                                >
                                    Transfer
                                </AppText>
                            </Pressable>

                            <Pressable
                                onPress={() =>
                                    go('/(authenticated)/expense/budget/add')
                                }
                                accessibilityRole="button"
                                accessibilityLabel="Add budget"
                                style={ctaStyle}
                                className="flex-1 items-center justify-center rounded-2xl border px-2 py-3.5 shadow-xl active:opacity-90"
                            >
                                <Iconify
                                    icon="heroicons:chart-pie"
                                    size={18}
                                    color={labelColor}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="mt-1.5 font-bold"
                                    style={{color: labelColor}}
                                >
                                    Budget
                                </AppText>
                            </Pressable>
                        </View>

                        <AppText
                            variant="caption-xs"
                            className="mb-1 font-semibold uppercase tracking-wide text-text-primary-lighter"
                        >
                            More
                        </AppText>

                        <View
                            className="rounded-2xl border px-3"
                            style={{
                                backgroundColor: colors.bg.canvas,
                                borderColor: colors.status.border,
                            }}
                        >
                            <SecondaryRow
                                title="Scan receipt"
                                subtitle="Capture or upload a bill"
                                onPress={() => go(ROUTES.expenseAdd({scan: true}))}
                                icon={
                                    <Iconify
                                        icon="heroicons:viewfinder-circle"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Group"
                                subtitle="Shared ledger with people"
                                onPress={() => go('/(authenticated)/user/group/add')}
                                icon={
                                    <Iconify
                                        icon="heroicons:user-group"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Person"
                                subtitle="Add someone to split with"
                                onPress={() => go('/(authenticated)/user/add')}
                                icon={
                                    <Iconify
                                        icon="heroicons:user-plus"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Relationship"
                                subtitle="Link how you know someone"
                                onPress={() =>
                                    go('/(authenticated)/user/relationship/add')
                                }
                                icon={
                                    <Iconify
                                        icon="heroicons:heart"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Memory"
                                subtitle="Save a moment with people"
                                onPress={() =>
                                    go('/(authenticated)/user/memory/add')
                                }
                                icon={
                                    <Iconify
                                        icon="heroicons:photo"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Expense category"
                                subtitle="Label for spend tracking"
                                onPress={() =>
                                    go('/(authenticated)/expense/categories/add')
                                }
                                icon={
                                    <Iconify
                                        icon="heroicons:tag"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Group category"
                                subtitle="Organize groups by type"
                                onPress={() =>
                                    go('/(authenticated)/group/category/add')
                                }
                                icon={
                                    <Iconify
                                        icon="heroicons:folder"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Item"
                                subtitle="Reusable line for receipts"
                                onPress={() => go('/(authenticated)/expense/items/add')}
                                icon={
                                    <Iconify
                                        icon="heroicons:cube"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Merchant"
                                subtitle="Shop or place you pay at"
                                onPress={() =>
                                    go('/(authenticated)/expense/merchant/add')
                                }
                                icon={
                                    <Iconify
                                        icon="heroicons:building-storefront"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                            <SecondaryRow
                                title="Merchant location"
                                subtitle="Pin a place for a merchant"
                                onPress={() => go('/(authenticated)/map/select')}
                                isLast
                                icon={
                                    <Iconify
                                        icon="heroicons:map-pin"
                                        size={18}
                                        color={colors.icon.primary}
                                    />
                                }
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
