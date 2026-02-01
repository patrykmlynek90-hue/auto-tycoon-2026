import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, MapPin } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"

export function ContractHistoryBox() {
    const { contractHistory } = useGameStore()
    const formatMoney = useCurrencyFormatter()

    // Show last 10 contracts
    const recentContracts = contractHistory.slice(0, 10)

    if (recentContracts.length === 0) {
        return (
            <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Historia Kontraktów
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Brak zawartych kontraktów
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Historia Kontraktów
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recentContracts.map((contract) => {
                    const isDomestic = contract.type === 'domestic'
                    const isPartialFulfillment = contract.fulfilledQty < contract.requestedQty
                    const inventoryChange = contract.inventoryBefore - contract.inventoryAfter

                    return (
                        <div
                            key={contract.id}
                            className={`p-3 rounded-lg border ${isDomestic
                                ? 'bg-amber-500/5 border-amber-500/20'
                                : 'bg-blue-500/5 border-blue-500/20'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {isDomestic ? (
                                        <MapPin className="w-4 h-4 text-amber-500" />
                                    ) : (
                                        <Globe className="w-4 h-4 text-blue-500" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {contract.contractor} • {contract.carClass}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(contract.date).toLocaleDateString('pl-PL', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-medium ${isDomestic ? 'bg-amber-500/20 text-amber-600' : 'bg-blue-500/20 text-blue-600'
                                    }`}>
                                    {isDomestic ? 'Krajowy' : 'Eksport'}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-muted-foreground">Zamówienie</p>
                                    <p className="font-semibold">
                                        {contract.requestedQty} szt → {contract.fulfilledQty} szt
                                        {isPartialFulfillment && (
                                            <span className="text-orange-500 ml-1">(częściowe)</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Przychód</p>
                                    <p className="font-semibold text-success">
                                        {formatMoney(contract.totalRevenue)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Cena/szt</p>
                                    <p className="font-medium">{formatMoney(contract.pricePerUnit)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Magazyn</p>
                                    <p className="font-medium">
                                        {contract.inventoryBefore} → {contract.inventoryAfter} szt
                                        <span className="text-destructive ml-1">
                                            (-{inventoryChange})
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
