'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Globe, Package, DollarSign, Building2 } from 'lucide-react'
import { useGameStore } from '@/lib/game-store'

function useCurrencyFormatter() {
    return (value: number) => `$${value.toLocaleString()}`
}

export function ContractOfferModal() {
    const {
        isContractOfferModalOpen,
        pendingContractOffer,
        acceptContractOffer,
        rejectContractOffer
    } = useGameStore()

    const formatMoney = useCurrencyFormatter()

    if (!pendingContractOffer) return null

    const isDomestic = pendingContractOffer.type === 'domestic'
    const Icon = isDomestic ? FileText : Globe
    const title = isDomestic ? 'Kontrakt Krajowy' : 'Kontrakt Eksportowy'
    const typeColor = isDomestic ? 'text-blue-500' : 'text-purple-500'
    const typeBg = isDomestic ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'

    const canFulfill = pendingContractOffer.availableInventory >= pendingContractOffer.requestedQty
    const fulfilledQty = Math.min(pendingContractOffer.availableInventory, pendingContractOffer.requestedQty)
    const actualRevenue = fulfilledQty * pendingContractOffer.pricePerUnit

    return (
        <Dialog open={isContractOfferModalOpen} onOpenChange={() => {/* Prevent closing by clicking outside */ }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-6 h-6 ${typeColor}`} />
                        <DialogTitle className="text-2xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-2">
                        {isDomestic
                            ? `${pendingContractOffer.contractor} złożyło ofertę zakupu pojazdów dla swojej floty.`
                            : `${pendingContractOffer.contractor} jest zainteresowane zakupem pojazdów na rynek zagraniczny.`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Contract Details */}
                    <div className={`p-4 rounded-lg border ${typeBg}`}>
                        <h4 className="text-sm font-semibold mb-3 text-foreground">Szczegóły Kontraktu</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Klasa pojazdu:</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{pendingContractOffer.carClass}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Zamówiona ilość:</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{pendingContractOffer.requestedQty} szt</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Cena za sztukę:</span>
                                </div>
                                <span className="text-sm font-semibold text-foreground">{formatMoney(pendingContractOffer.pricePerUnit)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Status */}
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Dostępny magazyn:</span>
                            <span className={`text-sm font-semibold ${canFulfill ? 'text-success' : 'text-warning'}`}>
                                {pendingContractOffer.availableInventory} szt
                            </span>
                        </div>
                        {!canFulfill && (
                            <p className="text-xs text-warning mt-2">
                                ⚠️ Niewystarczający magazyn! Zostanie dostarczone: {fulfilledQty} szt
                            </p>
                        )}
                    </div>

                    {/* Revenue Calculation */}
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {canFulfill ? 'Łączny zarobek:' : 'Zarobek (częściowy):'}
                            </span>
                            <span className="text-xl font-bold text-success">
                                {formatMoney(actualRevenue)}
                            </span>
                        </div>
                        {!canFulfill && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Pełna wartość kontraktu: {formatMoney(pendingContractOffer.totalRevenue)}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        onClick={rejectContractOffer}
                        variant="outline"
                        className="flex-1"
                    >
                        Odrzuć
                    </Button>
                    <Button
                        onClick={acceptContractOffer}
                        variant="default"
                        className="flex-1 bg-success hover:bg-success/90"
                        disabled={fulfilledQty === 0}
                    >
                        {fulfilledQty === 0 ? 'Brak magazynu' : 'Akceptuj kontrakt'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
