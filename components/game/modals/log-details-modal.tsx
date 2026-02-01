
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TransactionDetails } from "@/lib/game-store"
import { format } from "date-fns" // Not needed?
import { cn } from "@/lib/utils"

function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

interface LogDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    log: {
        date: string
        type: 'success' | 'danger' | 'info'
        message: string
        details?: TransactionDetails
    } | null
}

export function LogDetailsModal({ isOpen, onClose, log }: LogDetailsModalProps) {
    if (!log || !log.details) return null

    const { details } = log
    const isPremium = details.negotiationPercent > 0
    const isDiscount = details.negotiationPercent < 0
    const negotiationPercentAbs = Math.abs(details.negotiationPercent * 100).toFixed(1)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Szczegóły Transakcji
                        <span className="text-xs font-normal text-muted-foreground">({log.date})</span>
                    </DialogTitle>
                    <DialogDescription>
                        Szczegółowe dane finansowe kontraktu.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Price Negotiation Badge */}
                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                        <span className="text-sm font-medium">Negocjacje Ceny:</span>
                        {isPremium ? (
                            <Badge variant="default" className="bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/20">
                                +{negotiationPercentAbs}% Premia
                            </Badge>
                        ) : isDiscount ? (
                            <Badge variant="default" className="bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-yellow-500/20">
                                -{negotiationPercentAbs}% Rabat
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">Standardowa</Badge>
                        )}
                    </div>

                    {/* Details Table */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{details.modelName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">Ilość:</span>
                            <span className="font-medium">{details.quantity} szt.</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">Cena Katalogowa (szt.):</span>
                            <span className="font-medium">{formatMoney(details.basePrice)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">Cena Finalna (szt.):</span>
                            <div className="text-right">
                                <span className={isPremium ? "text-green-400 font-bold" : isDiscount ? "text-yellow-400" : ""}>
                                    {formatMoney(details.finalPrice)}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/30">
                            <span className="text-muted-foreground">Przychód Całkowity:</span>
                            <span className="font-bold text-green-400">{formatMoney(details.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Zysk (Marża):</span>
                            <span className="font-bold text-green-500">{formatMoney(details.totalProfit)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
