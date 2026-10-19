import React, {useCallback, useState} from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppButton} from '@/src/components/common/AppButton';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {SelectGroupBottomSheet} from '@/src/components/user/SelectGroupBottomSheet';
import {
    SelectMultiPeopleBottomSheet,
    SelectedUserEntity,
} from '@/src/components/user/SelectMultiPeopleBottomSheet';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {
    BackDismissStackProvider,
    useBackDismissStack,
    useRegisterOverlayDismiss,
} from '@/src/hooks/useBackDismissStack';
import {themeStore} from '@/src/store/themeStore';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {useAddBudgetForm} from './hooks/useAddBudgetForm';
import {
    useBudgetMemoryList,
    useBudgetMerchantList,
    useBudgetPlaceList,
} from './hooks/useBudgetScopeLists';
import {AddBudgetRouteParams, BudgetScopeEntity} from './types';
import {AddBudgetHeader} from './components/AddBudgetHeader';
import {BudgetEssentialsSection} from './components/BudgetEssentialsSection';
import {BudgetCadenceSection} from './components/BudgetCadenceSection';
import {BudgetAudienceSection} from './components/BudgetAudienceSection';
import {BudgetScopeSection} from './components/BudgetScopeSection';
import {BudgetWindowSection} from './components/BudgetWindowSection';
import {BudgetWindowBottomSheet} from './components/BudgetWindowBottomSheet';
import {BudgetMultiSelectSheet} from './components/BudgetMultiSelectSheet';
import {SelectMultiLevelCategoryBottomSheet} from '@/src/components/expense/SelectMultiLevelCategoryBottomSheet';
import {MultiLevelCategorySelection} from '@/src/components/expense/multi-level-category/types';

const SHARED_MEMBER_TYPES = [RelationWithUserType.USER];

function AddBudgetScreenInner() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const params = useLocalSearchParams<AddBudgetRouteParams>();
    const stack = useBackDismissStack();

    const {
        form,
        currencyCode,
        currencySymbol,
        isSaving,
        setName,
        setAmountText,
        setPeriod,
        setCapMode,
        setAudienceType,
        setGroup,
        setMembers,
        setCategories,
        setPlaces,
        setMerchants,
        setMemories,
        removeCategory,
        removePlace,
        removeMerchant,
        removeMemory,
        removeMember,
        applyWindow,
        navigateBack,
        submit,
    } = useAddBudgetForm(params);

    const [sheet, setSheet] = useState<
        | null
        | 'categories'
        | 'places'
        | 'merchants'
        | 'memories'
        | 'group'
        | 'members'
        | 'window'
    >(null);

    const placeList = useBudgetPlaceList(sheet === 'places');
    const merchantList = useBudgetMerchantList(sheet === 'merchants');
    const memoryList = useBudgetMemoryList(sheet === 'memories');

    const handleConfirmCategories = useCallback(
        (selected: MultiLevelCategorySelection[]) => {
            const mapped: BudgetScopeEntity[] = selected.map((c) => ({
                id: c.id,
                name: c.name,
                iconId: c.iconId,
                iconUrl: c.iconUrl,
                categoryRef: c.categoryRef,
                coversDescendants: c.coversDescendants,
            }));
            setCategories(mapped);
        },
        [setCategories],
    );

    useRegisterOverlayDismiss(sheet === 'group', () => setSheet(null));
    useRegisterOverlayDismiss(sheet === 'members', () => setSheet(null));
    useRegisterOverlayDismiss(sheet === 'window', () => setSheet(null));

    const handleBack = useCallback(() => {
        // requestBack() returns void — never use ?? or both back navigations fire.
        if (stack) {
            stack.requestBack();
            return;
        }
        navigateBack();
    }, [navigateBack, stack]);

    const handleMembersConfirmed = useCallback(
        (selected: SelectedUserEntity[]) => {
            setMembers(selected);
            setSheet(null);
        },
        [setMembers],
    );

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                <AddBudgetHeader onBack={handleBack} disabled={isSaving} />

                <KeyboardAvoidingView
                    className="flex-1"
                    style={{backgroundColor: heroStatusBar}}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                >
                    <View
                        className="flex-1 overflow-hidden"
                        style={{
                            marginTop: -20,
                            borderTopLeftRadius: 28,
                            borderTopRightRadius: 28,
                            backgroundColor: canvasBg,
                        }}
                    >
                        <ScrollView
                            className="flex-1"
                            style={{backgroundColor: canvasBg}}
                            contentContainerStyle={{
                                paddingHorizontal: 20,
                                paddingTop: 24,
                                paddingBottom: 120,
                            }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View className="gap-y-6">
                                <BudgetEssentialsSection
                                    name={form.name}
                                    amountText={form.amountText}
                                    currencyCode={currencyCode}
                                    currencySymbol={currencySymbol}
                                    onNameChange={setName}
                                    onAmountChange={setAmountText}
                                />
                                <BudgetCadenceSection
                                    capMode={form.capMode}
                                    onCapModeChange={setCapMode}
                                />
                                <BudgetAudienceSection
                                    audienceType={form.audienceType}
                                    groupName={form.groupName}
                                    members={form.members}
                                    onAudienceChange={setAudienceType}
                                    onOpenGroup={() => setSheet('group')}
                                    onOpenMembers={() => setSheet('members')}
                                    onRemoveMember={removeMember}
                                />
                                <BudgetScopeSection
                                    categories={form.categories}
                                    places={form.places}
                                    merchants={form.merchants}
                                    memories={form.memories}
                                    mapPrefilled={form.mapPrefilled}
                                    onOpenCategories={() => setSheet('categories')}
                                    onOpenPlaces={() => setSheet('places')}
                                    onOpenMerchants={() => setSheet('merchants')}
                                    onOpenMemories={() => setSheet('memories')}
                                    onRemoveCategory={removeCategory}
                                    onRemovePlace={removePlace}
                                    onRemoveMerchant={removeMerchant}
                                    onRemoveMemory={removeMemory}
                                />
                                <BudgetWindowSection
                                    period={form.period}
                                    onPeriodChange={setPeriod}
                                    windowPreset={form.windowPreset}
                                    startDate={form.startDate}
                                    endDate={form.endDate}
                                    onOpenPicker={() => setSheet('window')}
                                />
                            </View>
                        </ScrollView>

                        <View
                            className="absolute bottom-0 left-0 right-0 border-t px-5 pb-7 pt-3"
                            style={{
                                backgroundColor: canvasBg,
                                borderTopColor: colors.status.border,
                            }}
                        >
                            <AppButton
                                variant="primary"
                                onPress={submit}
                                disabled={isSaving}
                                loading={isSaving}
                                renderIcon={(c) => (
                                    <Iconify icon="heroicons:plus-circle" size={18} color={c} />
                                )}
                            >
                                Create budget
                            </AppButton>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>

            <SelectMultiLevelCategoryBottomSheet
                visible={sheet === 'categories'}
                initialSelected={form.categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    iconId: c.iconId,
                    iconUrl: c.iconUrl,
                    categoryRef: c.categoryRef,
                    level: null,
                    coversDescendants: !!c.coversDescendants,
                }))}
                onClose={() => setSheet(null)}
                onConfirm={handleConfirmCategories}
            />

            <BudgetMultiSelectSheet
                visible={sheet === 'places'}
                title="Places"
                kind="place"
                initialSelected={form.places}
                items={placeList.items}
                loading={placeList.loading}
                loadingMore={placeList.loadingMore}
                error={placeList.error}
                searchQuery={placeList.search}
                onSearchChange={placeList.setSearch}
                onLoadMore={placeList.loadMore}
                onRetry={placeList.reload}
                onClose={() => setSheet(null)}
                onConfirm={setPlaces}
            />

            <BudgetMultiSelectSheet
                visible={sheet === 'merchants'}
                title="Merchants"
                kind="merchant"
                initialSelected={form.merchants}
                items={merchantList.items}
                loading={merchantList.loading}
                loadingMore={merchantList.loadingMore}
                error={merchantList.error}
                searchQuery={merchantList.search}
                onSearchChange={merchantList.setSearch}
                onRetry={merchantList.reload}
                onClose={() => setSheet(null)}
                onConfirm={setMerchants}
            />

            <BudgetMultiSelectSheet
                visible={sheet === 'memories'}
                title="Memories"
                kind="memory"
                initialSelected={form.memories}
                items={memoryList.items}
                loading={memoryList.loading}
                loadingMore={memoryList.loadingMore}
                error={memoryList.error}
                searchQuery={memoryList.search}
                onSearchChange={memoryList.setSearch}
                onLoadMore={memoryList.loadMore}
                onRetry={memoryList.reload}
                onClose={() => setSheet(null)}
                onConfirm={setMemories}
            />

            <SelectGroupBottomSheet
                visible={sheet === 'group'}
                selectedId={form.groupId ?? undefined}
                onClose={() => setSheet(null)}
                onSelect={(group) => {
                    setGroup(group);
                    setSheet(null);
                }}
            />

            <SelectMultiPeopleBottomSheet
                visible={sheet === 'members'}
                initialSelectedUsers={form.members}
                allowedUserTypes={SHARED_MEMBER_TYPES}
                minSelectionToClose={1}
                onClose={() => setSheet(null)}
                onConfirmed={handleMembersConfirmed}
            />

            <BudgetWindowBottomSheet
                visible={sheet === 'window'}
                initialPreset={form.windowPreset}
                initialStartDate={form.startDate}
                initialEndDate={form.endDate}
                onClose={() => setSheet(null)}
                onConfirm={(result) => {
                    applyWindow(result);
                    setSheet(null);
                }}
            />
        </ScreenWrapper>
    );
}

export default function AddBudgetScreen() {
    const router = useRouter();

    const onEmptyBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace('/(authenticated)/(tabs)/' as any);
    }, [router]);

    return (
        <BottomSheetModalProvider>
            <BackDismissStackProvider onEmptyBack={onEmptyBack}>
                <AddBudgetScreenInner />
            </BackDismissStackProvider>
        </BottomSheetModalProvider>
    );
}
