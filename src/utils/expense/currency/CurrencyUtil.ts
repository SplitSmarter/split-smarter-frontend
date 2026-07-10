import { ExchangeRateDetails } from "@/src/api/dto/expense/expense";

export class CurrencyUtil {
    /**
     * Converts an amount from a source currency to a target currency
     * using absolute values reference conversions mapped against a common baseline.
     */
    public static convertCurrency(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        exchangeRates: ExchangeRateDetails
    ): number {
        const rateFrom = exchangeRates[fromCurrency as keyof ExchangeRateDetails];
        const rateTo = exchangeRates[toCurrency as keyof ExchangeRateDetails];

        if (rateFrom === undefined || rateTo === undefined) {
            console.warn(`[CurrencyUtil] Missing rate profile mapping parameters for: ${fromCurrency} or ${toCurrency}`);
            throw new Error(`Missing exchange rate configurations parameter for ${fromCurrency} or ${toCurrency}`);
        }

        // Convert the amount to base standard baseline first, then scale up to target baseline
        const amountInBase = amount / rateFrom;
        return amountInBase * rateTo;
    }
}