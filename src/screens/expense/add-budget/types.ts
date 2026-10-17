import {
    BudgetAudienceType,
    BudgetCapMode,
    BudgetPeriod,
} from '@/src/api/dto/expense/constant';
import {SelectedUserEntity} from '@/src/components/user/SelectMultiPeopleBottomSheet';

export type BudgetScopeEntity = {
    id: number;
    name: string;
    iconUrl?: string | null;
    iconId?: string | null;
};

export type BudgetWindowPreset = 'forever' | 'this_month' | 'next_90' | 'custom';

export type BudgetWindowResult = {
    preset: BudgetWindowPreset;
    startDate: string | null;
    endDate: string | null;
};

export type AddBudgetFormState = {
    name: string;
    amountText: string;
    period: BudgetPeriod;
    capMode: BudgetCapMode;
    audienceType: BudgetAudienceType;
    groupId: number | null;
    groupName: string | null;
    members: SelectedUserEntity[];
    categories: BudgetScopeEntity[];
    places: BudgetScopeEntity[];
    merchants: BudgetScopeEntity[];
    memories: BudgetScopeEntity[];
    startDate: string | null;
    endDate: string | null;
    windowPreset: BudgetWindowPreset;
    /** True when navigated from map with a place pre-filled */
    mapPrefilled: boolean;
};

export type AddBudgetRouteParams = {
    placeId?: string | string[];
    placeName?: string | string[];
};

export const PERIOD_OPTIONS: {value: BudgetPeriod; label: string}[] = [
    {value: BudgetPeriod.DAILY, label: 'Daily'},
    {value: BudgetPeriod.MONTHLY, label: 'Monthly'},
    {value: BudgetPeriod.QUARTERLY, label: 'Quarterly'},
    {value: BudgetPeriod.YEARLY, label: 'Yearly'},
];

export const AUDIENCE_OPTIONS: {
    value: BudgetAudienceType;
    label: string;
    description: string;
}[] = [
    {
        value: BudgetAudienceType.USER,
        label: 'Just me',
        description: 'Personal ledger only',
    },
    {
        value: BudgetAudienceType.USER_SHARED,
        label: 'Shared',
        description: 'Invite peers to the cap',
    },
    {
        value: BudgetAudienceType.GROUP,
        label: 'Group',
        description: 'Tie to a group ledger',
    },
];

export const WINDOW_PRESET_OPTIONS: {
    value: BudgetWindowPreset;
    label: string;
}[] = [
    {value: 'forever', label: 'Forever'},
    {value: 'this_month', label: 'This month'},
    {value: 'next_90', label: '90 days'},
    {value: 'custom', label: 'Custom'},
];
