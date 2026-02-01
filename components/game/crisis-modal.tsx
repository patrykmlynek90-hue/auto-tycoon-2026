'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useGameStore } from '@/lib/game-store'

function useCurrencyFormatter() {
    return (value: number) => `$${value.toLocaleString()}`
}

export function CrisisModal() {
    const { isCrisisModalOpen, currentCrisis, payCrisisCost } = useGameStore()
    const formatMoney = useCurrencyFormatter()

    if (!currentCrisis) return null

    return (
        <Dialog open={isCrisisModalOpen} onOpenChange={() => {/* Block closing */ }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <DialogTitle className="text-xl">{currentCrisis.title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-4">
                        {currentCrisis.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-muted-foreground mb-1">Koszty naprawy:</p>
                    <p className="text-2xl font-bold text-destructive">
                        {formatMoney(currentCrisis.cost)}
                    </p>
                </div>

                <Button
                    onClick={payCrisisCost}
                    variant="destructive"
                    size="lg"
                    className="w-full mt-4"
                >
                    Zapłać {formatMoney(currentCrisis.cost)}
                </Button>
            </DialogContent>
        </Dialog>
    )
}
