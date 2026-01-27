export const currencies = {
    USD: { code: 'USD', symbol: '$', name: 'common.currencies.USD.name', countryTag: 'US' },
    INR: { code: 'INR', symbol: '₹', name: 'common.currencies.INR.name', countryTag: 'IN' },
    EUR: { code: 'EUR', symbol: '€', name: 'common.currencies.EUR.name', countryTag: 'EU' },
    GBP: { code: 'GBP', symbol: '£', name: 'common.currencies.GBP.name', countryTag: 'GB' },
    JPY: { code: 'JPY', symbol: '¥', name: 'common.currencies.JPY.name', countryTag: 'JP' },
    AED: { code: 'AED', symbol: 'د.إ', name: 'common.currencies.AED.name', countryTag: 'AE' },
};

export type CurrencyCode = keyof typeof currencies;