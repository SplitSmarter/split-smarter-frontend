export const ROUTES = {
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
    serviceDetails: (id: string | number): {
        pathname: "/(authenticated)/expense/services/[serviceId]",
        params: { serviceId: string };
    } => ({
        pathname: "/(authenticated)/expense/services/[serviceId]",
        params: { serviceId: String(id) },
    }),
    newGroup: () => "/(authenticated)/groups/new",
};
