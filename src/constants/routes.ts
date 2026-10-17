export const ROUTES = {
    /** Regional map tab focused on a GOOGLE (ChIJ…) or CUSTOM (app place id) place. */
    mapPlace: (
        provider: string,
        id: string | number
    ): {
        pathname: "/(authenticated)/(tabs)/analytics";
        params: { provider: string; id: string; ts: string };
    } => ({
        pathname: "/(authenticated)/(tabs)/analytics",
        params: {
            provider: String(provider),
            id: String(id),
            ts: String(Date.now()),
        },
    }),
    expenseDetails: (id: string | number): {
        pathname: "/(authenticated)/expense/details";
        params: { id: string };
    } => ({
        pathname: "/(authenticated)/expense/details",
        params: { id: String(id) },
    }),
    categoryDetails: (id: string | number): {
        pathname: "/(authenticated)/expense/categories/[categoryId]";
        params: { categoryId: string };
    } => ({
        pathname: "/(authenticated)/expense/categories/[categoryId]",
        params: { categoryId: String(id) },
    }),
    itemDetails: (id: string | number): {
        pathname: "/(authenticated)/expense/items/[itemId]",
        params: { itemId: string };
    } => ({
        pathname: "/(authenticated)/expense/items/[itemId]",
        params: { itemId: String(id) },
    }),
    groupDetails: (id: string | number): {
        pathname: "/(authenticated)/groups/[groupId]",
        params: { groupId: string };
    } => ({
        pathname: "/(authenticated)/groups/[groupId]",
        params: { groupId: String(id) },
    }),
    /** Groups / activity tab — optional filter: All | Chat | Groups | Expenses */
    groupsTab: (tab?: 'All' | 'Chat' | 'Groups' | 'Expenses'): {
        pathname: "/(authenticated)/(tabs)/groups";
        params?: { tab: string };
    } =>
        tab
            ? {
                  pathname: "/(authenticated)/(tabs)/groups",
                  params: { tab },
              }
            : { pathname: "/(authenticated)/(tabs)/groups" },
    /** Bottom-tab analytics / analysis screen. */
    analyticsTab: (): {pathname: "/(authenticated)/(tabs)/analytics"} => ({
        pathname: "/(authenticated)/(tabs)/analytics",
    }),
    serviceDetails: (id: string | number): {
        pathname: "/(authenticated)/expense/services/[serviceId]",
        params: { serviceId: string };
    } => ({
        pathname: "/(authenticated)/expense/services/[serviceId]",
        params: { serviceId: String(id) },
    }),
    newGroup: () => "/(authenticated)/groups/new",
};
