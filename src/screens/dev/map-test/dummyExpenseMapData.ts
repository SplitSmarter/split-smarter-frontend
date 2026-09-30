export type ExpenseCategory =
  | "dining"
  | "groceries"
  | "transit"
  | "shopping"
  | "leisure"
  | "stay"
  | "travel";

export type ExpenseTxn = {
  id: string;
  venueId: string;
  venueName: string;
  amount: number;
  latitude: number;
  longitude: number;
  category: ExpenseCategory;
  neighborhood: string;
  at: string;
  note?: string;
  split?: boolean;
  receipt?: boolean;
  tripId?: string;
};

export type TripMemory = {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  start: string;
  end: string;
  headline: string;
  topSpot: string;
};

export const HOME = { latitude: 12.9352, longitude: 77.6245 };
export const HABIT_RADIUS_M = 2200;

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  dining: { label: "Dining", icon: "☕", color: "#E07A3D" },
  groceries: { label: "Groceries", icon: "🛒", color: "#2D8A5B" },
  transit: { label: "Transit", icon: "🚇", color: "#4A7CDB" },
  shopping: { label: "Shopping", icon: "🛍️", color: "#C45C9A" },
  leisure: { label: "Leisure", icon: "🎬", color: "#8B6BC9" },
  stay: { label: "Stay", icon: "🏨", color: "#5B8A9A" },
  travel: { label: "Travel", icon: "✈️", color: "#1A9B8A" },
};

export const TRIPS: TripMemory[] = [
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.6595,
    longitude: 139.7004,
    start: "2026-07-12",
    end: "2026-07-16",
    headline: "Tokyo Trip",
    topSpot: "Shibuya Food Alley",
  },
  {
    id: "goa",
    city: "Goa",
    country: "India",
    latitude: 15.5389,
    longitude: 73.7632,
    start: "2026-04-18",
    end: "2026-04-20",
    headline: "Goa Weekend",
    topSpot: "Anjuna Beach Cafe",
  },
];

const V = {
  thirdWave: {
    id: "third-wave",
    name: "Third Wave Coffee",
    lat: 12.9348,
    lng: 77.6258,
    n: "Koramangala",
  },
  natures: {
    id: "natures",
    name: "Nature's Basket",
    lat: 12.9364,
    lng: 77.6221,
    n: "Koramangala",
  },
  toit: {
    id: "toit",
    name: "Toit Brewpub",
    lat: 12.9332,
    lng: 77.6228,
    n: "Koramangala",
  },
  metroKorma: {
    id: "metro-korma",
    name: "Koramangala Metro",
    lat: 12.9359,
    lng: 77.6281,
    n: "Koramangala",
  },
  bluPetal: {
    id: "blupetal",
    name: "BluPetal Hotel",
    lat: 12.936,
    lng: 77.626,
    n: "Koramangala",
  },
  brewery: {
    id: "brewery",
    name: "The Biere Club",
    lat: 12.9784,
    lng: 77.6408,
    n: "Indiranagar",
  },
  hundredFt: {
    id: "100ft",
    name: "100 Feet Road Cafe",
    lat: 12.978,
    lng: 77.6418,
    n: "Indiranagar",
  },
  pvr: {
    id: "pvr",
    name: "PVR Indiranagar",
    lat: 12.9788,
    lng: 77.6389,
    n: "Indiranagar",
  },
  ubCity: {
    id: "ub",
    name: "UB City Mall",
    lat: 12.9719,
    lng: 77.5963,
    n: "MG Road",
  },
  ccd: {
    id: "ccd",
    name: "Cafe Coffee Day MG",
    lat: 12.975,
    lng: 77.6063,
    n: "MG Road",
  },
  cubbon: {
    id: "cubbon",
    name: "Cubbon Park Metro",
    lat: 12.977,
    lng: 77.5955,
    n: "MG Road",
  },
  mtr: {
    id: "mtr",
    name: "MTR Restaurant",
    lat: 12.955,
    lng: 77.585,
    n: "Jayanagar",
  },
  jayaMart: {
    id: "jaya-mart",
    name: "Jayanagar Market",
    lat: 12.9308,
    lng: 77.5838,
    n: "Jayanagar",
  },
  forum: {
    id: "forum",
    name: "Forum Neighbourhood Mall",
    lat: 12.9698,
    lng: 77.7499,
    n: "Whitefield",
  },
  itpl: {
    id: "itpl",
    name: "ITPL Food Court",
    lat: 12.985,
    lng: 77.736,
    n: "Whitefield",
  },
  shibuya: {
    id: "shibuya",
    name: "Shibuya Food Alley",
    lat: 35.6595,
    lng: 139.7004,
    n: "Shibuya",
  },
  tsukiji: {
    id: "tsukiji",
    name: "Tsukiji Outer Market",
    lat: 35.6654,
    lng: 139.7707,
    n: "Chuo",
  },
  shinjukuStay: {
    id: "shinjuku-stay",
    name: "Shinjuku Granbell",
    lat: 35.6938,
    lng: 139.7034,
    n: "Shinjuku",
  },
  harajuku: {
    id: "harajuku",
    name: "Takeshita Street",
    lat: 35.6702,
    lng: 139.7027,
    n: "Shibuya",
  },
  tokyoMetro: {
    id: "tokyo-metro",
    name: "Tokyo Metro Day Pass",
    lat: 35.6812,
    lng: 139.7671,
    n: "Chiyoda",
  },
  anjuna: {
    id: "anjuna",
    name: "Anjuna Beach Cafe",
    lat: 15.5732,
    lng: 73.7405,
    n: "North Goa",
  },
  baga: {
    id: "baga",
    name: "Baga Seafood Shack",
    lat: 15.5553,
    lng: 73.7517,
    n: "North Goa",
  },
  goaStay: {
    id: "goa-stay",
    name: "Assagao Cottage",
    lat: 15.593,
    lng: 73.763,
    n: "North Goa",
  },
};

let seq = 0;
const t = (
  venue: (typeof V)[keyof typeof V],
  amount: number,
  category: ExpenseCategory,
  at: string,
  extra: Partial<ExpenseTxn> = {},
): ExpenseTxn => ({
  id: `txn-${++seq}`,
  venueId: venue.id,
  venueName: venue.name,
  amount,
  latitude: venue.lat,
  longitude: venue.lng,
  category,
  neighborhood: venue.n,
  at,
  ...extra,
});

/** Dummy spend spanning Bangalore routines plus Tokyo and Goa trips. */
export const DUMMY_TXNS: ExpenseTxn[] = [
  // --- March: establishing Koramangala habit ---
  t(V.thirdWave, 280, "dining", "2026-03-04T08:20:00+05:30", { receipt: true }),
  t(V.natures, 1240, "groceries", "2026-03-04T19:10:00+05:30", {
    receipt: true,
  }),
  t(V.thirdWave, 260, "dining", "2026-03-07T08:15:00+05:30"),
  t(V.metroKorma, 50, "transit", "2026-03-07T08:42:00+05:30"),
  t(V.itpl, 420, "dining", "2026-03-07T13:05:00+05:30"),
  t(V.natures, 890, "groceries", "2026-03-11T19:40:00+05:30"),
  t(V.toit, 2100, "dining", "2026-03-14T21:00:00+05:30", { split: true }),
  t(V.thirdWave, 310, "dining", "2026-03-18T08:18:00+05:30"),
  t(V.ubCity, 3450, "shopping", "2026-03-22T16:20:00+05:30", { receipt: true }),
  t(V.ccd, 190, "dining", "2026-03-22T17:05:00+05:30"),

  // --- April: Goa weekend + local ---
  t(V.thirdWave, 270, "dining", "2026-04-08T08:12:00+05:30"),
  t(V.natures, 1560, "groceries", "2026-04-12T18:50:00+05:30"),
  t(V.goaStay, 6400, "stay", "2026-04-18T14:00:00+05:30", {
    tripId: "goa",
    receipt: true,
  }),
  t(V.anjuna, 890, "dining", "2026-04-18T19:30:00+05:30", { tripId: "goa" }),
  t(V.baga, 1680, "dining", "2026-04-19T20:15:00+05:30", {
    tripId: "goa",
    split: true,
  }),
  t(V.anjuna, 420, "leisure", "2026-04-20T11:00:00+05:30", { tripId: "goa" }),
  t(V.thirdWave, 290, "dining", "2026-04-24T08:22:00+05:30"),
  t(V.pvr, 680, "leisure", "2026-04-25T20:40:00+05:30", { split: true }),

  // --- May ---
  t(V.thirdWave, 300, "dining", "2026-05-02T08:10:00+05:30"),
  t(V.metroKorma, 50, "transit", "2026-05-02T08:40:00+05:30"),
  t(V.forum, 2890, "shopping", "2026-05-02T15:30:00+05:30"),
  t(V.itpl, 380, "dining", "2026-05-06T13:10:00+05:30"),
  t(V.natures, 1100, "groceries", "2026-05-09T19:20:00+05:30"),
  t(V.mtr, 740, "dining", "2026-05-17T12:30:00+05:30"),
  t(V.jayaMart, 430, "groceries", "2026-05-17T13:15:00+05:30"),
  t(V.brewery, 2400, "dining", "2026-05-23T21:10:00+05:30", { split: true }),
  t(V.hundredFt, 540, "dining", "2026-05-23T23:05:00+05:30"),

  // --- June ---
  t(V.thirdWave, 275, "dining", "2026-06-03T08:16:00+05:30"),
  t(V.natures, 980, "groceries", "2026-06-07T19:00:00+05:30"),
  t(V.cubbon, 50, "transit", "2026-06-14T10:20:00+05:30"),
  t(V.ubCity, 1720, "shopping", "2026-06-14T11:45:00+05:30"),
  t(V.ccd, 220, "dining", "2026-06-14T12:30:00+05:30"),
  t(V.toit, 1860, "dining", "2026-06-20T20:50:00+05:30", { split: true }),
  t(V.thirdWave, 305, "dining", "2026-06-27T08:14:00+05:30"),

  // --- July: Tokyo trip ---
  t(V.thirdWave, 285, "dining", "2026-07-08T08:19:00+05:30"),
  t(V.shinjukuStay, 18500, "stay", "2026-07-12T16:00:00+09:00", {
    tripId: "tokyo",
    receipt: true,
  }),
  t(V.shibuya, 2400, "dining", "2026-07-12T20:30:00+09:00", {
    tripId: "tokyo",
  }),
  t(V.tokyoMetro, 890, "transit", "2026-07-13T09:00:00+09:00", {
    tripId: "tokyo",
  }),
  t(V.tsukiji, 3200, "dining", "2026-07-13T11:20:00+09:00", {
    tripId: "tokyo",
    receipt: true,
  }),
  t(V.harajuku, 4100, "shopping", "2026-07-14T15:40:00+09:00", {
    tripId: "tokyo",
  }),
  t(V.shibuya, 1860, "dining", "2026-07-14T19:50:00+09:00", {
    tripId: "tokyo",
    split: true,
  }),
  t(V.shibuya, 980, "leisure", "2026-07-15T21:10:00+09:00", {
    tripId: "tokyo",
  }),
  t(V.natures, 1320, "groceries", "2026-07-22T19:15:00+05:30"),

  // --- August ---
  t(V.thirdWave, 295, "dining", "2026-08-05T08:11:00+05:30"),
  t(V.metroKorma, 50, "transit", "2026-08-05T08:38:00+05:30"),
  t(V.itpl, 460, "dining", "2026-08-05T13:00:00+05:30"),
  t(V.natures, 1470, "groceries", "2026-08-12T19:35:00+05:30"),
  t(V.brewery, 2650, "dining", "2026-08-15T21:20:00+05:30", { split: true }),
  t(V.pvr, 720, "leisure", "2026-08-15T18:40:00+05:30"),
  t(V.forum, 3180, "shopping", "2026-08-22T16:10:00+05:30"),
  t(V.bluPetal, 4200, "stay", "2026-08-29T20:00:00+05:30", {
    note: "Parents visiting",
  }),

  // --- September: current month, Friday-night Indiranagar pattern + a full day trail ---
  t(V.thirdWave, 310, "dining", "2026-09-04T08:17:00+05:30"),
  t(V.natures, 1180, "groceries", "2026-09-06T18:55:00+05:30"),
  t(V.brewery, 2780, "dining", "2026-09-12T21:05:00+05:30", { split: true }),
  t(V.hundredFt, 610, "dining", "2026-09-12T23:20:00+05:30"),
  t(V.thirdWave, 290, "dining", "2026-09-18T08:14:00+05:30", { receipt: true }),
  t(V.metroKorma, 50, "transit", "2026-09-18T08:41:00+05:30"),
  t(V.itpl, 510, "dining", "2026-09-18T13:12:00+05:30"),
  t(V.natures, 1340, "groceries", "2026-09-18T19:28:00+05:30", {
    receipt: true,
  }),
  t(V.brewery, 1920, "dining", "2026-09-18T21:15:00+05:30", { split: true }),
  t(V.thirdWave, 305, "dining", "2026-09-22T08:20:00+05:30"),
];

export const MONTH_FILTERS = [
  { id: "all", label: "All time" },
  { id: "2026-03", label: "Mar" },
  { id: "2026-04", label: "Apr" },
  { id: "2026-05", label: "May" },
  { id: "2026-06", label: "Jun" },
  { id: "2026-07", label: "Jul" },
  { id: "2026-08", label: "Aug" },
  { id: "2026-09", label: "Sep" },
] as const;

export const BANGALORE_REGION = {
  latitude: 12.96,
  longitude: 77.63,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};
