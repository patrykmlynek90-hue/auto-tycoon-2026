"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Building2, CalendarDays, DollarSign, AlertTriangle, Sparkles } from "lucide-react"

function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

interface BankruptcyDetails {
    oldCompanyName: string
    oldCategory: string
    bankruptcyDate: string
    ipoPrice: number
    yearsActive: number
    playerHadShares: boolean
    sharesOwned?: number
    moneyLost?: number
    newCompanyName: string
    newCategory: string
    newIpoPrice: number
}

interface BankruptcyModalProps {
    isOpen: boolean
    onClose: () => void
    details: BankruptcyDetails | null
}

export function BankruptcyModal({ isOpen, onClose, details }: BankruptcyModalProps) {
    if (!details) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] bg-zinc-900 border-zinc-800 text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <TrendingDown className="w-6 h-6 text-red-500" />
                        Bankructwo firmy {details.oldCompanyName}!
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Poznaj szczegółowe informacje o bankructwie firmy notowanej na giełdzie.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-3">
                    {/* Old Company Info */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-zinc-400" />
                            Informacje o upadłej firmie
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nazwa:</span>
                                <span className="font-medium">{details.oldCompanyName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Branża:</span>
                                <span className="font-medium">{details.oldCategory}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data bankructwa:</span>
                                <span className="font-medium">{details.bankruptcyDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cena IPO:</span>
                                <span className="font-medium">{formatMoney(details.ipoPrice)}</span>
                            </div>
                            <div className="flex justify-between col-span-2">
                                <span className="text-muted-foreground">Czas obecności na giełdzie:</span>
                                <span className="font-medium">{details.yearsActive} {details.yearsActive === 1 ? 'rok' : 'lat'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Impact */}
                    <div className={`border rounded-lg p-4 space-y-2 ${details.playerHadShares ? 'bg-red-950/30 border-red-800' : 'bg-zinc-800/30 border-zinc-700'}`}>
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Wpływ na Twój Portfel
                        </h3>
                        {details.playerHadShares ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-400">
                                        Posiadałeś: <span className="font-bold">{details.sharesOwned} akcji</span>
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-red-500 text-center py-2">
                                    Strata: {formatMoney(details.moneyLost || 0)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Nie posiadałeś akcji tej firmy. <span className="text-green-400 font-semibold">Nic nie straciłeś na bankructwie.</span>
                            </p>
                        )}
                    </div>

                    {/* New Company Info */}
                    <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border border-blue-800/50 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            Restrukturyzacja Giełdy
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            W miejsce firmy <span className="text-foreground font-medium">{details.oldCompanyName}</span> z branży <span className="text-foreground font-medium">{details.oldCategory}</span>, na giełdę wchodzi nowy podmiot:
                        </p>
                        <div className="bg-zinc-900/60 border border-zinc-700 rounded p-3 space-y-2 mt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Nowa firma:</span>
                                <span className="font-bold text-blue-300">{details.newCompanyName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Branża:</span>
                                <span className="font-medium text-foreground">{details.newCategory}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Cena debiutu (IPO):</span>
                                <span className="font-bold text-green-400">{formatMoney(details.newIpoPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
