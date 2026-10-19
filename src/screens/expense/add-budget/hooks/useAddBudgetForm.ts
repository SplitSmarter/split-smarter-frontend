import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter} from 'expo-router';
import {
    BudgetAudienceType,
    BudgetMemberRole,
} from '@/src/api/dto/expense/constant';
import {AddBudgetRuleRequest, BudgetMemberInput} from '@/src/api/dto/expense/budget';
import {addBudgetRuleApi} from '@/src/api/expense/budget';
import {userStore} from '@/src/store/userStore';
import {useBudgetDraftStore} from '@/src/store/draft/budgetDraftStore';
import {useAlert} from '@/src/context/alertContext';
import {Currency, CurrencyCode} from '@/src/constants/expense/currency';
import {AddBudgetRouteParams} from '../types';

function firstParam(value?: string | string[]): string {
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
}

function hasPlaceParams(params?: AddBudgetRouteParams): boolean {
    const placeId = Number(firstParam(params?.placeId));
    return Number.isFinite(placeId) && placeId > 0;
}

function hasGroupParams(params?: AddBudgetRouteParams): boolean {
    const groupId = Number(firstParam(params?.groupId));
    return Number.isFinite(groupId) && groupId > 0;
}

function hydrateKey(params?: AddBudgetRouteParams): string {
    const parts: string[] = [];
    if (hasGroupParams(params)) parts.push(`group:${firstParam(params?.groupId)}`);
    if (hasPlaceParams(params)) parts.push(`place:${firstParam(params?.placeId)}`);
    return parts.length ? parts.join('|') : 'bare';
}

export function useAddBudgetForm(params?: AddBudgetRouteParams) {
    const router = useRouter();
    const {showAlert} = useAlert();
    const currentUser = userStore((s) => s.user);
    const currencyCode = (currentUser?.currency || 'INR') as CurrencyCode;
    const currencySymbol = Currency[currencyCode]?.symbol ?? '₹';

    const draft = useBudgetDraftStore();
    const {
        resetDraft,
        hydrateFromRouteParams,
        name,
        amountText,
        period,
        capMode,
        audienceType,
        groupId,
        groupName,
        members,
        categories,
        places,
        merchants,
        memories,
        startDate,
        endDate,
        windowPreset,
        mapPrefilled,
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
        setWindowPreset,
        applyWindow,
        setStartDate,
        setEndDate,
        clearMapPrefilled,
    } = draft;

    const [isSaving, setIsSaving] = useState(false);
    const hydratedKeyRef = useRef<string | null>(null);

    // Fresh open: reset abandoned draft; hydrate place and/or group prefill from route.
    useEffect(() => {
        const key = hydrateKey(params);
        if (hydratedKeyRef.current === key) return;
        hydratedKeyRef.current = key;

        resetDraft();
        if (hasPlaceParams(params) || hasGroupParams(params)) {
            hydrateFromRouteParams(params);
        }
    }, [params, resetDraft, hydrateFromRouteParams]);

    const form = useMemo(
        () => ({
            name,
            amountText,
            period,
            capMode,
            audienceType,
            groupId,
            groupName,
            members,
            categories,
            places,
            merchants,
            memories,
            startDate,
            endDate,
            windowPreset,
            mapPrefilled,
        }),
        [
            name,
            amountText,
            period,
            capMode,
            audienceType,
            groupId,
            groupName,
            members,
            categories,
            places,
            merchants,
            memories,
            startDate,
            endDate,
            windowPreset,
            mapPrefilled,
        ],
    );

    const amount = useMemo(() => {
        const parsed = parseFloat(amountText.replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    }, [amountText]);

    const navigateBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace('/(authenticated)/(tabs)/' as any);
    }, [router]);

    const validate = useCallback((): string | null => {
        if (!name.trim()) return 'Budget name is required';
        if (!(amount > 0)) return 'Enter an amount greater than zero';
        if (audienceType === BudgetAudienceType.USER_SHARED) {
            const peers = members.filter(
                (m) => !(currentUser && String(m.id) === String(currentUser.id)),
            );
            if (peers.length === 0) return 'Add at least one person to share with';
        }
        if (audienceType === BudgetAudienceType.GROUP && !groupId) {
            return 'Select a group for this budget';
        }
        if (startDate && endDate && endDate < startDate) {
            return 'End date must be on or after start date';
        }
        return null;
    }, [
        amount,
        audienceType,
        currentUser,
        endDate,
        groupId,
        members,
        name,
        startDate,
    ]);

    const buildPayload = useCallback((): AddBudgetRuleRequest => {
        const memberInputs: BudgetMemberInput[] = [];
        if (audienceType === BudgetAudienceType.USER_SHARED && currentUser) {
            for (const peer of members) {
                if (String(peer.id) === String(currentUser.id)) continue;
                if (String(peer.user_type).toUpperCase() !== 'USER') continue;
                memberInputs.push({user_id: peer.id, role: BudgetMemberRole.EDITOR});
            }
        }

        const category_ids = categories.map((c) => c.id);
        const place_ids = places.map((p) => p.id);
        const merchant_ids = merchants.map((m) => m.id);
        const memory_ids = memories.map((m) => m.id);
        const hasScope =
            category_ids.length > 0 ||
            place_ids.length > 0 ||
            merchant_ids.length > 0 ||
            memory_ids.length > 0;
        const applies_to_all = !hasScope;

        const today = new Date();
        const todayYmd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        return {
            name: name.trim(),
            amount,
            audience_type: audienceType,
            group_id: audienceType === BudgetAudienceType.GROUP ? groupId : null,
            cap_mode: capMode,
            applies_to_all,
            period,
            period_value: 1,
            start_date: startDate ?? todayYmd,
            end_date: endDate,
            category_ids: applies_to_all ? [] : category_ids,
            place_ids: applies_to_all ? [] : place_ids,
            merchant_ids: applies_to_all ? [] : merchant_ids,
            memory_ids: applies_to_all ? [] : memory_ids,
            members: memberInputs.length ? memberInputs : undefined,
        };
    }, [
        amount,
        audienceType,
        capMode,
        categories,
        currentUser,
        endDate,
        groupId,
        members,
        memories,
        merchants,
        name,
        period,
        places,
        startDate,
    ]);

    const submit = useCallback(async () => {
        if (isSaving) return;
        const error = validate();
        if (error) {
            showAlert(error, 'error');
            return;
        }

        setIsSaving(true);
        try {
            const response = await addBudgetRuleApi(buildPayload());
            if (response.data) {
                showAlert(response.message || 'Budget created', 'success');
                resetDraft();
                hydratedKeyRef.current = null;
                navigateBack();
            } else {
                showAlert(response.message || 'Failed to create budget', 'error');
            }
        } catch (err: any) {
            showAlert(err?.message || 'Something went wrong. Try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [
        buildPayload,
        isSaving,
        navigateBack,
        resetDraft,
        showAlert,
        validate,
    ]);

    return {
        form,
        amount,
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
        setWindowPreset,
        applyWindow,
        setStartDate,
        setEndDate,
        clearMapPrefilled,
        navigateBack,
        submit,
    };
}
