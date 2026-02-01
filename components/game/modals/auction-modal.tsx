"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/game-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import { Gavel, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AuctionModal() {
    const { auction, placeBid, closeAuctionModal, isAuctionModalOpen, money, auctionAttempts } = useGameStore()
    const [bidAmount, setBidAmount] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    const formatMoney = useCurrencyFormatter()

    useEffect(() => {
        if (auction) {
            setBidAmount(auction.estimatedValue.toString())
        }
    }, [auction])

    // Safety check: Needs active auction.
    if (!auction || !auction.isOpen) return null

    const handleBid = () => {
        const bid = parseInt(bidAmount)
        if (isNaN(bid)) return

        const result = placeBid(bid)
        if (!result.success) {
            setError(result.message)
        } else {
            setError(null)
            // Optional: Close modal on success? Or keep open? User might want to confirm.
            // Let's keep open as "Dashboard" style.
        }
    }

    const currentAuctionNum = Math.min(5, (auctionAttempts || 0) + 1)

    return (
        <Dialog open={isAuctionModalOpen} onOpenChange={(open) => !open && closeAuctionModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-accent" />
                        Przetarg na Ziemię (Rok {auction.year}) - {currentAuctionNum}/5
                    </DialogTitle>
                    <DialogDescription>
                        Przetarg trwa przez cały rok. Możesz zmieniać swoją ofertę do 31 grudnia. <br />
                        Wyniki zostaną ogłoszone 1 stycznia przyszłego roku.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Szacowana Wartość:</span>
                            <span className="font-bold text-foreground">{formatMoney(auction.estimatedValue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Twoja Aktualna Oferta:</span>
                            <span className="font-bold text-accent">{formatMoney(auction.userBid)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dostępne Środki:</span>
                            <span className="font-bold text-primary">{formatMoney(money)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Zmień Ofertę</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder="Wpisz nową kwotę"
                            />
                            <Button onClick={handleBid} className="gap-2">
                                <Gavel className="w-4 h-4" />
                                Zaktualizuj
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Środki zostaną zablokowane na poczet oferty. W przypadku przegranej, całość zostanie zwrócona.
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-start">
                    <Button variant="outline" onClick={closeAuctionModal}>
                        Zamknij podgląd
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
