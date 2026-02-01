"use client"

import { useGameStore } from "@/lib/game-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, XCircle } from "lucide-react"

export function AuctionResultModal() {
    const { auctionResult, closeAuctionResult, auctionAttempts } = useGameStore()

    if (!auctionResult) return null

    // Use auctionAttempts to show correct counter (1/5, 2/5, etc.)
    const displayCount = auctionAttempts || 1

    return (
        <Dialog open={!!auctionResult} onOpenChange={(open) => !open && closeAuctionResult()}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {auctionResult.won ? (
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        Wynik Przetargu ({auctionResult.year}) - {displayCount}/5
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <p className="text-base leading-relaxed text-foreground/90">
                        {auctionResult.message}
                    </p>

                    {!auctionResult.won && (
                        <div className="bg-secondary/20 p-3 rounded-md text-sm text-muted-foreground border border-border/50">
                            Środki zablokowane na poczet oferty ({auctionResult.bid}) zostały zwrócone na Twoje konto.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={closeAuctionResult} className="w-full sm:w-auto">
                        Rozumiem
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
