import {Currency, PlaceSource} from "@/src/api/dto/constants";
import {
    ExpenseComponentType,
    ExpenseStatus,
} from "@/src/api/dto/expense/constant";
import {ExpenseCategoryBasicResponse, ExpenseDetailsBasicResponse} from "@/src/api/dto/expense/expense";
import {MemoryBasicDetails, MemoryScope, MemorySource, MemoryStatus} from "@/src/api/dto/user/memory";
import {LocationDetails} from "@/src/api/dto/user/place";

export const HOME_GEO = {latitude: 12.9352, longitude: 77.6245};
export const HABIT_RADIUS_M = 2200;

export const BANGALORE_REGION = {
    latitude: 12.96,
    longitude: 77.63,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
};

// --- Mock Memories (formerly TRIPS) ---
export const MEMORIES: Record<string, MemoryBasicDetails> = {
    tokyo: {
        id: 101,
        title: "Tokyo Trip",
        description: "Top spot: Shibuya Food Alley",
        scope: "PERSONAL" as MemoryScope,
        status: "ACTIVE" as MemoryStatus,
        source: "USER" as MemorySource,
        icon: {
            id: "icon-tokyo",
            name: "airplane",
            url: "https://assets.app/icons/airplane.png",
            extension: "png",
        },
        is_active: true,
        created_by_user_id: 1,
        start_at: "2026-07-12T00:00:00.000Z",
        end_at: "2026-07-16T23:59:59.000Z",
    },
    goa: {
        id: 102,
        title: "Goa Weekend",
        description: "Top spot: Anjuna Beach Cafe",
        scope: "PERSONAL" as MemoryScope,
        status: "ACTIVE" as MemoryStatus,
        source: "USER" as MemorySource,
        icon: {
            id: "icon-goa",
            name: "beach",
            url: "https://assets.app/icons/beach.png",
            extension: "png",
        },
        is_active: true,
        created_by_user_id: 1,
        start_at: "2026-04-18T00:00:00.000Z",
        end_at: "2026-04-20T23:59:59.000Z",
    },
};

// --- Helper for Mock LocationDetails ---
const createLocation = (
    id: number,
    name: string,
    latitude: number,
    longitude: number,
    address: string,
    city: string,
    state: string,
    country: string,
    country_code: string,
    rating: number | null = 4.5
): LocationDetails => ({
    id,
    provider: "GOOGLE" as PlaceSource,
    provider_id: id + 1000,
    name,
    address,
    city,
    state,
    country,
    country_code,
    geo: {
        latitude,
        longitude,
    },
    rating,
});

// --- Mock Places (Updated LocationDetails schema) ---
const PLACES: Record<string, LocationDetails> = {
    thirdWave: createLocation(
        1,
        "Third Wave Coffee",
        12.9348,
        77.6258,
        "Koramangala, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    natures: createLocation(
        2,
        "Nature's Basket",
        12.9364,
        77.6221,
        "Koramangala, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    toit: createLocation(
        3,
        "Toit Brewpub",
        12.9332,
        77.6228,
        "Koramangala, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    metroKorma: createLocation(
        4,
        "Koramangala Metro",
        12.9359,
        77.6281,
        "Koramangala, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    bluPetal: createLocation(
        5,
        "BluPetal Hotel",
        12.936,
        77.626,
        "Koramangala, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    brewery: createLocation(
        6,
        "The Biere Club",
        12.9784,
        77.6408,
        "Indiranagar, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    hundredFt: createLocation(
        7,
        "100 Feet Road Cafe",
        12.978,
        77.6418,
        "Indiranagar, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    pvr: createLocation(
        8,
        "PVR Indiranagar",
        12.9788,
        77.6389,
        "Indiranagar, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    ubCity: createLocation(
        9,
        "UB City Mall",
        12.9719,
        77.5963,
        "MG Road, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    ccd: createLocation(
        10,
        "Cafe Coffee Day MG",
        12.975,
        77.6063,
        "MG Road, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    cubbon: createLocation(
        11,
        "Cubbon Park Metro",
        12.977,
        77.5955,
        "MG Road, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    mtr: createLocation(
        12,
        "MTR Restaurant",
        12.955,
        77.585,
        "Jayanagar, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    jayaMart: createLocation(
        13,
        "Jayanagar Market",
        12.9308,
        77.5838,
        "Jayanagar, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    forum: createLocation(
        14,
        "Forum Neighbourhood Mall",
        12.9698,
        77.7499,
        "Whitefield, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    itpl: createLocation(
        15,
        "ITPL Food Court",
        12.985,
        77.736,
        "Whitefield, Bengaluru, Karnataka, India",
        "Bengaluru",
        "Karnataka",
        "India",
        "IN"
    ),
    shibuya: createLocation(
        16,
        "Shibuya Food Alley",
        35.6595,
        139.7004,
        "Shibuya, Tokyo, Japan",
        "Tokyo",
        "Tokyo",
        "Japan",
        "JP"
    ),
    tsukiji: createLocation(
        17,
        "Tsukiji Outer Market",
        35.6654,
        139.7707,
        "Chuo, Tokyo, Japan",
        "Tokyo",
        "Tokyo",
        "Japan",
        "JP"
    ),
    shinjukuStay: createLocation(
        18,
        "Shinjuku Granbell",
        35.6938,
        139.7034,
        "Shinjuku, Tokyo, Japan",
        "Tokyo",
        "Tokyo",
        "Japan",
        "JP"
    ),
    harajuku: createLocation(
        19,
        "Takeshita Street",
        35.6702,
        139.7027,
        "Shibuya, Tokyo, Japan",
        "Tokyo",
        "Tokyo",
        "Japan",
        "JP"
    ),
    tokyoMetro: createLocation(
        20,
        "Tokyo Metro Day Pass",
        35.6812,
        139.7671,
        "Chiyoda, Tokyo, Japan",
        "Tokyo",
        "Tokyo",
        "Japan",
        "JP"
    ),
    anjuna: createLocation(
        21,
        "Anjuna Beach Cafe",
        15.5732,
        73.7405,
        "North Goa, Goa, India",
        "Anjuna",
        "Goa",
        "India",
        "IN"
    ),
    baga: createLocation(
        22,
        "Baga Seafood Shack",
        15.5553,
        73.7517,
        "North Goa, Goa, India",
        "Baga",
        "Goa",
        "India",
        "IN"
    ),
    goaStay: createLocation(
        23,
        "Assagao Cottage",
        15.593,
        73.763,
        "North Goa, Goa, India",
        "Assagao",
        "Goa",
        "India",
        "IN"
    ),
};

const CATEGORIES: Record<string, ExpenseCategoryBasicResponse> = {
    dining: {
        id: 1,
        title: "Dining",
        icon: {
            id: "cat-1",
            name: "coffee",
            url: "https://assets.app/categories/dining.png",
            extension: "png",
        },
    },
    groceries: {
        id: 2,
        title: "Groceries",
        icon: {
            id: "cat-2",
            name: "cart",
            url: "https://assets.app/categories/groceries.png",
            extension: "png",
        },
    },
    transit: {
        id: 3,
        title: "Transit",
        icon: {
            id: "cat-3",
            name: "subway",
            url: "https://assets.app/categories/transit.png",
            extension: "png",
        },
    },
    shopping: {
        id: 4,
        title: "Shopping",
        icon: {
            id: "cat-4",
            name: "bag",
            url: "https://assets.app/categories/shopping.png",
            extension: "png",
        },
    },
    leisure: {
        id: 5,
        title: "Leisure",
        icon: {
            id: "cat-5",
            name: "clapperboard",
            url: "https://assets.app/categories/leisure.png",
            extension: "png",
        },
    },
    stay: {
        id: 6,
        title: "Stay",
        icon: {
            id: "cat-6",
            name: "hotel",
            url: "https://assets.app/categories/stay.png",
            extension: "png",
        },
    },
    travel: {
        id: 7,
        title: "Travel",
        icon: {
            id: "cat-7",
            name: "airplane",
            url: "https://assets.app/categories/travel.png",
            extension: "png",
        },
    },
};

let autoIncId = 0;

const buildExpense = (
    place: LocationDetails,
    totalAmount: number,
    categoryKey: keyof typeof CATEGORIES,
    expenseDate: string,
    options: {
        hasAttachment?: boolean;
        isSplit?: boolean;
        memory?: MemoryBasicDetails;
        currency?: Currency;
    } = {}
): ExpenseDetailsBasicResponse => {
    const isSplit = options.isSplit ?? false;
    const currency = options.currency ?? ("INR" as Currency);
    const userContrib = isSplit ? totalAmount / 2 : totalAmount;

    return {
        id: ++autoIncId,
        name: place.name,
        status: ExpenseStatus.ACTIVE,
        expense_type: ExpenseComponentType.ITEM,
        expense_date: expenseDate,
        total_amount: totalAmount,
        currency,
        category: CATEGORIES[categoryKey],
        exchange_rate: {
            INR: 1.0,
            USD: 0.012,
            EUR: 0.011,
            CAD: 0.016,
            GBP: 0.0095,
        },
        memory: options.memory ?? null,
        paid_by_users: [
            {
                id: 1,
                name: "Self",
                user_type: "CUSTOM" as any,
                avatar: {
                    id: "avatar-1",
                    name: "profile",
                    url: "https://assets.app/avatars/user.png",
                    extension: "png",
                },
                amount: totalAmount,
            },
        ],
        sharers: isSplit
            ? [
                {
                    id: 1,
                    name: "Self",
                    user_type: "CUSTOM" as any,
                    avatar: {
                        id: "avatar-1",
                        name: "profile",
                        url: "https://assets.app/avatars/user.png",
                        extension: "png",
                    },
                    amount: userContrib,
                },
                {
                    id: 2,
                    name: "Friend",
                    user_type: "CUSTOM" as any,
                    avatar: {
                        id: "avatar-2",
                        name: "friend",
                        url: "https://assets.app/avatars/friend.png",
                        extension: "png",
                    },
                    amount: userContrib,
                },
            ]
            : [
                {
                    id: 1,
                    name: "Self",
                    user_type: "CUSTOM" as any,
                    avatar: {
                        id: "avatar-1",
                        name: "profile",
                        url: "https://assets.app/avatars/user.png",
                        extension: "png",
                    },
                    amount: totalAmount,
                },
            ],
        user_contribution: userContrib,
        group: null,
        place,
        is_scheduled_blueprint: false,
        has_attachment: options.hasAttachment ?? false,
        is_user_settled: true,
    };
};

export const DUMMY_EXPENSES: ExpenseDetailsBasicResponse[] = [
    // --- March: Koramangala habit ---
    buildExpense(PLACES.thirdWave, 280, "dining", "2026-03-04T08:30:00.000Z", {
        hasAttachment: true,
    }),
    buildExpense(PLACES.natures, 1240, "groceries", "2026-03-04T17:45:00.000Z", {
        hasAttachment: true,
    }),
    buildExpense(PLACES.thirdWave, 260, "dining", "2026-03-07T09:15:00.000Z"),
    buildExpense(PLACES.metroKorma, 50, "transit", "2026-03-07T10:30:00.000Z"),
    buildExpense(PLACES.itpl, 420, "dining", "2026-03-07T13:00:00.000Z"),
    buildExpense(PLACES.natures, 890, "groceries", "2026-03-11T18:20:00.000Z"),
    buildExpense(PLACES.toit, 2100, "dining", "2026-03-14T20:00:00.000Z", {isSplit: true}),
    buildExpense(PLACES.thirdWave, 310, "dining", "2026-03-18T08:45:00.000Z"),
    buildExpense(PLACES.ubCity, 3450, "shopping", "2026-03-22T15:30:00.000Z", {
        hasAttachment: true,
    }),
    buildExpense(PLACES.ccd, 190, "dining", "2026-03-22T17:10:00.000Z"),

    // --- April: Goa weekend + local ---
    buildExpense(PLACES.thirdWave, 270, "dining", "2026-04-08T09:00:00.000Z"),
    buildExpense(PLACES.natures, 1560, "groceries", "2026-04-12T16:50:00.000Z"),
    buildExpense(PLACES.goaStay, 6400, "stay", "2026-04-18T10:00:00.000Z", {
        memory: MEMORIES.goa,
        hasAttachment: true,
    }),
    buildExpense(PLACES.anjuna, 890, "dining", "2026-04-18T14:30:00.000Z", {
        memory: MEMORIES.goa,
    }),
    buildExpense(PLACES.baga, 1680, "dining", "2026-04-19T19:45:00.000Z", {
        memory: MEMORIES.goa,
        isSplit: true,
    }),
    buildExpense(PLACES.anjuna, 420, "leisure", "2026-04-20T11:20:00.000Z", {
        memory: MEMORIES.goa,
    }),
    buildExpense(PLACES.thirdWave, 290, "dining", "2026-04-24T08:15:00.000Z"),
    buildExpense(PLACES.pvr, 680, "leisure", "2026-04-25T18:00:00.000Z", {isSplit: true}),

    // --- May ---
    buildExpense(PLACES.thirdWave, 300, "dining", "2026-05-02T08:30:00.000Z"),
    buildExpense(PLACES.metroKorma, 50, "transit", "2026-05-02T10:15:00.000Z"),
    buildExpense(PLACES.forum, 2890, "shopping", "2026-05-02T16:00:00.000Z"),
    buildExpense(PLACES.itpl, 380, "dining", "2026-05-06T13:15:00.000Z"),
    buildExpense(PLACES.natures, 1100, "groceries", "2026-05-09T17:30:00.000Z"),
    buildExpense(PLACES.mtr, 740, "dining", "2026-05-17T12:45:00.000Z"),
    buildExpense(PLACES.jayaMart, 430, "groceries", "2026-05-17T14:30:00.000Z"),
    buildExpense(PLACES.brewery, 2400, "dining", "2026-05-23T20:15:00.000Z", {isSplit: true}),
    buildExpense(PLACES.hundredFt, 540, "dining", "2026-05-23T22:30:00.000Z"),

    // --- June ---
    buildExpense(PLACES.thirdWave, 275, "dining", "2026-06-03T08:45:00.000Z"),
    buildExpense(PLACES.natures, 980, "groceries", "2026-06-07T18:10:00.000Z"),
    buildExpense(PLACES.cubbon, 50, "transit", "2026-06-14T09:30:00.000Z"),
    buildExpense(PLACES.ubCity, 1720, "shopping", "2026-06-14T14:00:00.000Z"),
    buildExpense(PLACES.ccd, 220, "dining", "2026-06-14T16:45:00.000Z"),
    buildExpense(PLACES.toit, 1860, "dining", "2026-06-20T21:00:00.000Z", {isSplit: true}),
    buildExpense(PLACES.thirdWave, 305, "dining", "2026-06-27T09:00:00.000Z"),

    // --- July: Tokyo trip ---
    buildExpense(PLACES.thirdWave, 285, "dining", "2026-07-08T08:30:00.000Z"),
    buildExpense(PLACES.shinjukuStay, 18500, "stay", "2026-07-12T06:00:00.000Z", {
        memory: MEMORIES.tokyo,
        hasAttachment: true,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.shibuya, 2400, "dining", "2026-07-12T13:30:00.000Z", {
        memory: MEMORIES.tokyo,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.tokyoMetro, 890, "transit", "2026-07-13T01:00:00.000Z", {
        memory: MEMORIES.tokyo,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.tsukiji, 3200, "dining", "2026-07-13T04:30:00.000Z", {
        memory: MEMORIES.tokyo,
        hasAttachment: true,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.harajuku, 4100, "shopping", "2026-07-14T05:00:00.000Z", {
        memory: MEMORIES.tokyo,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.shibuya, 1860, "dining", "2026-07-14T11:30:00.000Z", {
        memory: MEMORIES.tokyo,
        isSplit: true,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.shibuya, 980, "leisure", "2026-07-15T12:00:00.000Z", {
        memory: MEMORIES.tokyo,
        currency: "JPY" as Currency,
    }),
    buildExpense(PLACES.natures, 1320, "groceries", "2026-07-22T17:40:00.000Z"),

    // --- August ---
    buildExpense(PLACES.thirdWave, 295, "dining", "2026-08-05T08:30:00.000Z"),
    buildExpense(PLACES.metroKorma, 50, "transit", "2026-08-05T09:45:00.000Z"),
    buildExpense(PLACES.itpl, 460, "dining", "2026-08-05T13:00:00.000Z"),
    buildExpense(PLACES.natures, 1470, "groceries", "2026-08-12T18:15:00.000Z"),
    buildExpense(PLACES.brewery, 2650, "dining", "2026-08-15T20:30:00.000Z", {isSplit: true}),
    buildExpense(PLACES.pvr, 720, "leisure", "2026-08-15T23:00:00.000Z"),
    buildExpense(PLACES.forum, 3180, "shopping", "2026-08-22T15:20:00.000Z"),
    buildExpense(PLACES.bluPetal, 4200, "stay", "2026-08-29T11:00:00.000Z"),

    // --- September ---
    buildExpense(PLACES.thirdWave, 310, "dining", "2026-09-04T08:45:00.000Z"),
    buildExpense(PLACES.natures, 1180, "groceries", "2026-09-06T17:30:00.000Z"),
    buildExpense(PLACES.brewery, 2780, "dining", "2026-09-12T20:00:00.000Z", {isSplit: true}),
    buildExpense(PLACES.hundredFt, 610, "dining", "2026-09-12T22:15:00.000Z"),
    buildExpense(PLACES.thirdWave, 290, "dining", "2026-09-18T08:30:00.000Z", {
        hasAttachment: true,
    }),
    buildExpense(PLACES.metroKorma, 50, "transit", "2026-09-18T09:45:00.000Z"),
    buildExpense(PLACES.itpl, 510, "dining", "2026-09-18T13:15:00.000Z"),
    buildExpense(PLACES.natures, 1340, "groceries", "2026-09-18T18:00:00.000Z", {
        hasAttachment: true,
    }),
    buildExpense(PLACES.brewery, 1920, "dining", "2026-09-18T21:30:00.000Z", {isSplit: true}),
    buildExpense(PLACES.thirdWave, 305, "dining", "2026-09-22T08:50:00.000Z"),
];

export const MONTH_FILTERS = [
    {id: "all", label: "All time"},
    {id: "2026-03", label: "Mar"},
    {id: "2026-04", label: "Apr"},
    {id: "2026-05", label: "May"},
    {id: "2026-06", label: "Jun"},
    {id: "2026-07", label: "Jul"},
    {id: "2026-08", label: "Aug"},
    {id: "2026-09", label: "Sep"},
] as const;