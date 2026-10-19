import {create} from 'zustand';
import {
    BudgetAudienceType,
    BudgetCapMode,
    BudgetPeriod,
} from '@/src/api/dto/expense/constant';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {BaseGroupDetails, GroupDetails} from '@/src/api/dto/user/group';
import {SelectedUserEntity} from '@/src/components/user/SelectMultiPeopleBottomSheet';
import {userStore} from '@/src/store/userStore';
import {
    AddBudgetFormState,
    AddBudgetRouteParams,
    BudgetScopeEntity,
    BudgetWindowPreset,
    BudgetWindowResult,
} from '@/src/screens/expense/add-budget/types';
import {datesForWindowPreset} from '@/src/screens/expense/add-budget/utils/windowPresets';

function firstParam(value?: string | string[]): string {
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
}

function isSelfMember(
    member: SelectedUserEntity,
    currentUserId?: number | null,
): boolean {
    if (currentUserId == null) return false;
    return (
        String(member.id) === String(currentUserId) &&
        String(member.user_type).toUpperCase() === RelationWithUserType.USER
    );
}

function buildSelfMember(user: {
    id: number;
    name?: string;
    avatar?: {id?: string; url?: string} | null;
}): SelectedUserEntity {
    return {
        id: user.id,
        name: 'You',
        user_type: RelationWithUserType.USER,
        avatar: user.avatar ?? null,
    };
}

function ensureSelfInMembers(
    members: SelectedUserEntity[],
    user: {id: number; name?: string; avatar?: {id?: string; url?: string} | null} | null,
): SelectedUserEntity[] {
    if (!user) return members;
    const peers = members.filter((m) => !isSelfMember(m, user.id));
    return [buildSelfMember(user), ...peers];
}

function getCurrentUserRef() {
    const user = userStore.getState().user;
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
    };
}

export function getDefaultBudgetDraft(): AddBudgetFormState {
    return {
        name: '',
        amountText: '',
        period: BudgetPeriod.MONTHLY,
        capMode: BudgetCapMode.SOFT,
        audienceType: BudgetAudienceType.USER,
        groupId: null,
        groupName: null,
        members: [],
        categories: [],
        places: [],
        merchants: [],
        memories: [],
        startDate: null,
        endDate: null,
        windowPreset: 'forever',
        mapPrefilled: false,
    };
}

export function budgetDraftFromRouteParams(
    params?: AddBudgetRouteParams,
): AddBudgetFormState {
    const placeId = Number(firstParam(params?.placeId));
    const placeName = firstParam(params?.placeName).trim();
    const hasPlace = Number.isFinite(placeId) && placeId > 0;

    const groupId = Number(firstParam(params?.groupId));
    const groupName = firstParam(params?.groupName).trim();
    const hasGroup = Number.isFinite(groupId) && groupId > 0;

    const base = getDefaultBudgetDraft();

    if (hasGroup) {
        return {
            ...base,
            audienceType: BudgetAudienceType.GROUP,
            groupId,
            groupName: groupName || null,
            members: [],
            // Map place prefill can combine with group when both are passed
            ...(hasPlace
                ? {
                      name: placeName ? `${placeName} budget` : '',
                      places: [{id: placeId, name: placeName || `Place #${placeId}`}],
                      mapPrefilled: true,
                  }
                : {}),
        };
    }

    if (!hasPlace) return base;

    return {
        ...base,
        name: placeName ? `${placeName} budget` : '',
        places: [{id: placeId, name: placeName || `Place #${placeId}`}],
        mapPrefilled: true,
    };
}

export interface BudgetDraftState extends AddBudgetFormState {
    setName: (name: string) => void;
    setAmountText: (amountText: string) => void;
    setPeriod: (period: BudgetPeriod) => void;
    setCapMode: (capMode: BudgetCapMode) => void;
    setAudienceType: (audienceType: BudgetAudienceType) => void;
    setGroup: (group: BaseGroupDetails | GroupDetails | null) => void;
    setMembers: (members: SelectedUserEntity[]) => void;
    setCategories: (categories: BudgetScopeEntity[]) => void;
    setPlaces: (places: BudgetScopeEntity[]) => void;
    setMerchants: (merchants: BudgetScopeEntity[]) => void;
    setMemories: (memories: BudgetScopeEntity[]) => void;
    removeCategory: (id: number) => void;
    removePlace: (id: number) => void;
    removeMerchant: (id: number) => void;
    removeMemory: (id: number) => void;
    removeMember: (id: number) => void;
    setWindowPreset: (preset: BudgetWindowPreset) => void;
    applyWindow: (result: BudgetWindowResult) => void;
    setStartDate: (startDate: string | null) => void;
    setEndDate: (endDate: string | null) => void;
    clearMapPrefilled: () => void;
    hydrateFromRouteParams: (params?: AddBudgetRouteParams) => void;
    resetDraft: () => void;
}

export const useBudgetDraftStore = create<BudgetDraftState>((set, get) => ({
    ...getDefaultBudgetDraft(),

    setName: (name) => set({name}),
    setAmountText: (amountText) => set({amountText}),
    setPeriod: (period) => set({period}),
    setCapMode: (capMode) => set({capMode}),

    setAudienceType: (audienceType) => {
        const prev = get();
        let members: SelectedUserEntity[] = [];
        if (audienceType === BudgetAudienceType.USER_SHARED) {
            members = ensureSelfInMembers(prev.members, getCurrentUserRef());
        }
        set({
            audienceType,
            groupId: audienceType === BudgetAudienceType.GROUP ? prev.groupId : null,
            groupName: audienceType === BudgetAudienceType.GROUP ? prev.groupName : null,
            members,
        });
    },

    setGroup: (group) =>
        set({
            groupId: group?.id ?? null,
            groupName: group?.title ?? null,
        }),

    setMembers: (members) =>
        set({
            members: ensureSelfInMembers(members, getCurrentUserRef()),
        }),

    setCategories: (categories) => set({categories}),
    setPlaces: (places) => {
        const {mapPrefilled, places: prevPlaces} = get();
        const stillHasMapPlace =
            mapPrefilled && prevPlaces.some((p) => places.some((n) => n.id === p.id));
        set({places, mapPrefilled: stillHasMapPlace});
    },
    setMerchants: (merchants) => set({merchants}),
    setMemories: (memories) => set({memories}),

    removeCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
        })),
    removePlace: (id) =>
        set((state) => ({
            places: state.places.filter((p) => p.id !== id),
            mapPrefilled:
                state.mapPrefilled && state.places.some((p) => p.id === id)
                    ? false
                    : state.mapPrefilled,
        })),
    removeMerchant: (id) =>
        set((state) => ({
            merchants: state.merchants.filter((m) => m.id !== id),
        })),
    removeMemory: (id) =>
        set((state) => ({
            memories: state.memories.filter((m) => m.id !== id),
        })),
    removeMember: (id) => {
        const user = getCurrentUserRef();
        if (user && String(id) === String(user.id)) return;
        set((state) => ({
            members: state.members.filter((m) => m.id !== id),
        }));
    },

    setWindowPreset: (windowPreset) => {
        const dates = datesForWindowPreset(windowPreset);
        set({
            windowPreset,
            startDate: windowPreset === 'custom' ? null : dates.startDate,
            endDate: windowPreset === 'custom' ? null : dates.endDate,
        });
    },

    applyWindow: (result) =>
        set({
            windowPreset: result.preset,
            startDate: result.startDate,
            endDate: result.endDate,
        }),

    setStartDate: (startDate) => set({startDate, windowPreset: 'custom'}),
    setEndDate: (endDate) => set({endDate, windowPreset: 'custom'}),
    clearMapPrefilled: () => set({mapPrefilled: false}),

    hydrateFromRouteParams: (params) => set(budgetDraftFromRouteParams(params)),
    resetDraft: () => set(getDefaultBudgetDraft()),
}));
