import { useGameStore } from "@/lib/game-store"

export function useCurrencyFormatter() {
    const currency = useGameStore(state => state.currency)

    const formatMoney = (amount: number) => {
        // 1 USD = 3.5 PLN
        const value = currency === 'PLN' ? amount * 3.5 : amount

        return new Intl.NumberFormat(currency === 'PLN' ? "pl-PL" : "en-US", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return formatMoney
}
