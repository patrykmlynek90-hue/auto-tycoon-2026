
"use client"

import { useGameStore } from "@/lib/game-store"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Anchor, DollarSign, Clock } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"

export function SpecialOrderModal() {
    const {
        isSpecialOrderModalOpen,
        pendingSpecialOrder,
        acceptSpecialOrder,
        rejectSpecialOrder,
        specialBuildings
    } = useGameStore()

    const formatMoney = useCurrencyFormatter()

    if (!pendingSpecialOrder) return null

    // Check if we have the item in stock (Requirement for Immediate Sale logic)
    let totalStock = 0
    // Iterate all items to find total stock
    for (const b of specialBuildings) {
        if (b.type === pendingSpecialOrder.type) {
            totalStock += (b.inventory[pendingSpecialOrder.tier] || 0)
        }
    }
    const hasStock = totalStock >= (pendingSpecialOrder.quantity || 1)

    return (
        <Dialog open={isSpecialOrderModalOpen} onOpenChange={(open) => !open && rejectSpecialOrder()}>
            <DialogContent className="sm:max-w-[500px] border-amber-500/50 bg-card/95 backdrop-blur">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 text-xl ${pendingSpecialOrder.isFleet ? 'text-blue-500' : 'text-amber-500'}`}>
                        {pendingSpecialOrder.type === 'Marine' ? <Anchor className="w-6 h-6" /> : <Plane className="w-6 h-6" />}
                        {pendingSpecialOrder.isFleet ? 'Zamówienie Flotowe' : 'Oferta VIP'}
                    </DialogTitle>
                    <DialogDescription>
                        {pendingSpecialOrder.isFleet
                            ? "Operator logistyczny poszukuje floty pojazdów."
                            : "Otrzymano specjalne zamówienie od klienta VIP."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Kupujący</span>
                            <Badge variant="outline" className={`border-${pendingSpecialOrder.isFleet ? 'blue' : 'amber'}-500 text-${pendingSpecialOrder.isFleet ? 'blue' : 'amber'}-500`}>
                                {pendingSpecialOrder.isFleet ? 'KONTRAKT' : 'VIP'}
                            </Badge>
                        </div>
                        <div className="font-bold text-lg">{pendingSpecialOrder.buyerName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Zamówienie</span>
                            <div className="font-medium flex flex-col">
                                <span>{pendingSpecialOrder.quantity || 1}x {pendingSpecialOrder.type === 'Marine' ? 'Jacht' : 'Samolot'} Klasy {pendingSpecialOrder.tier}</span>
                                {pendingSpecialOrder.isFleet && <span className="text-xs text-muted-foreground">(Hurt)</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">Całkowita Wartość</span>
                            <div className="font-bold text-xl text-green-500 flex items-center gap-1">
                                {formatMoney(pendingSpecialOrder.price * (pendingSpecialOrder.quantity || 1))}
                            </div>
                            {pendingSpecialOrder.quantity > 1 && (
                                <div className="text-xs text-muted-foreground">
                                    ({formatMoney(pendingSpecialOrder.price)} / szt)
                                </div>
                            )}
                        </div>
                    </div>

                    {!hasStock && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Brak towaru! Posiadasz: {totalStock} / {pendingSpecialOrder.quantity || 1} szt.
                        </div>
                    )}
                    {hasStock && (
                        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Towar dostępny od ręki.
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={rejectSpecialOrder} className="flex-1">
                        Odrzuć Ofertę
                    </Button>
                    <Button
                        onClick={acceptSpecialOrder}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={!hasStock}
                    >
                        {hasStock ? "Akceptuj i Sprzedaj" : "Brak Towaru"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
