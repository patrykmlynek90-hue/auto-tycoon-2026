
import { useState } from "react"
import { useGameStore, StockCompany, StockCategory } from "@/lib/game-store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Shield, Crown, Globe, Zap, Factory, Car, Landmark, Gem } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatMoneyNoCents = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
// ... (Apply to table)
// Since replace_file_content works on chunks, I'll do this in two steps or just update the table area if I can invoke the helper defined elsewhere.
// But I need to define the helper first.
// Wait, I can define the helper inside the component or outside.
// The file has `formatMoney` at the top (lines 22-25).
// And the table usages are at 423 and 425.
// I will split this into two edits to be safe and clean, or I can try to do it in one if the file isn't too big, but it's large.
// Actually, `formatMoney` is defined at line 22. I will verify that first.


function getRelativeDate(baseDate: Date, monthsOffset: number): string {
    const d = new Date(baseDate)
    d.setMonth(d.getMonth() + monthsOffset)
    // Np. "Cyber" + "Labs" = "Cyber Labs"
    if (monthsOffset === 0) return "Dzisiaj"
    const date = new Date(baseDate)
    date.setMonth(date.getMonth() - monthsOffset)
    return date.toLocaleDateString()
}

// Helper to calculate ROI
const calculateROI = (currentPrice: number, history: number[], weeksBack: number | 'all', startingPrice?: number) => {
    // Safety check for empty history (new companies post-bankruptcy)
    if (history.length === 0) return "n/d"

    let oldPrice = 0
    let targetIndex = -1

    if (weeksBack === 'all') {
        if (startingPrice === undefined) return "n/d"
        oldPrice = startingPrice
    } else {
        // FIX: Correct indexing for history array [oldest...newest]
        // Current price is at history[history.length - 1]
        // To go back N weeks, we need: history[history.length - 1 - weeksBack]
        // But we need to ensure this index is valid (>= 0)
        targetIndex = history.length - 1 - weeksBack

        if (targetIndex < 0) {
            // Not enough data, calculate from oldest available
            targetIndex = 0
        }

        oldPrice = history[targetIndex]
    }

    // Safety check for undefined oldPrice
    if (oldPrice === 0 || oldPrice === undefined) return "n/d"

    const roi = ((currentPrice - oldPrice) / oldPrice) * 100

    // [REMOVED] Debug log for 10-year ROI - legacy from rating system
    // if (weeksBack === 520) {
    //     console.log(`ROI 10Y Check: Current($${currentPrice.toFixed(2)}) vs Old($${oldPrice.toFixed(2)}) at index ${targetIndex}/${history.length - 1}. Result: ${roi.toFixed(1)}%`)
    // }

    const colorClass = roi > 0 ? "text-green-500" : roi < 0 ? "text-red-500" : "text-gray-400"
    const sign = roi > 0 ? "+" : ""

    return <span className={colorClass}>{sign}{roi.toFixed(1)}%</span>
}

// Helper to get company age badge
type CompanyBadge = {
    tier: 'established' | 'veteran' | 'titan'
    label: string
    Icon: typeof Shield
    color: string
    tooltip: string
}

const getCompanyBadge = (formationYear: number, currentYear: number): CompanyBadge | null => {
    const age = currentYear - formationYear

    if (age >= 50) {
        return {
            tier: 'titan',
            label: 'Tytan Rynku',
            Icon: Crown,
            color: 'text-yellow-500',
            tooltip: 'Ta firma jest na giełdzie od ponad 50 lat. Symbol stabilności.'
        }
    } else if (age >= 25) {
        return {
            tier: 'veteran',
            label: 'Weteran',
            Icon: Shield,
            color: 'text-gray-400',
            tooltip: 'Doświadczona firma na rynku od 25-49 lat.'
        }
    } else if (age >= 10) {
        return {
            tier: 'established',
            label: 'Ugruntowana',
            Icon: Shield,
            color: 'text-amber-700',
            tooltip: 'Ugruntowana pozycja (10-24 lata na giełdzie).'
        }
    }

    return null  // No badge for < 10 years
}

const getRatingColor = (rating: string) => {
    switch (rating) {
        case 'AAA': return 'bg-green-900/80 text-green-300 border-green-700'
        case 'A': return 'bg-emerald-900/80 text-emerald-300 border-emerald-700'
        case 'B': return 'bg-blue-900/80 text-blue-300 border-blue-700'
        case 'C': return 'bg-amber-900/80 text-amber-300 border-amber-700'
        case 'D': return 'bg-red-900/80 text-red-300 border-red-700'
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
}

const getSectorIcon = (sector: string) => {
    switch (sector) {
        case 'Technology': return Zap
        case 'Heavy Industry': return Factory
        case 'Automotive': return Car
        case 'Finance': return Landmark
        default: return Globe
    }
}

export function StockMarketPanel() {
    const { stockCompanies, portfolio, money, buyShares, sellShares, gameDate } = useGameStore()
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
    const [tradeAmount, setTradeAmount] = useState<string>("100")
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'value'>('name')
    const [sortAsc, setSortAsc] = useState(true)
    const [viewMode, setViewMode] = useState<'companies' | 'etfs'>('companies')

    // Portfolio Sorting
    const [portfolioSortBy, setPortfolioSortBy] = useState<'name' | '1r' | '5l' | '10l' | '25l' | 'all' | 'shares' | 'profit'>('shares')
    const [portfolioSortAsc, setPortfolioSortAsc] = useState(false) // Default descending for shares/money

    // Confirmation State
    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [pendingAction, setPendingAction] = useState<{ type: 'buy' | 'sell', amount: number, cost: number } | null>(null)

    const selectedCompany = stockCompanies.find(c => c.id === selectedCompanyId) || stockCompanies[0]
    const userPortfolioItem = portfolio[selectedCompany.id]
    const userShares = userPortfolioItem?.shares || 0
    const avgBuyPrice = userPortfolioItem?.avgBuyPrice || 0

    const totalPortfolioValue = stockCompanies.reduce((sum, company) => {
        const item = portfolio[company.id]
        if (item) {
            return sum + (item.shares * company.currentPrice)
        }
        return sum
    }, 0)

    const totalInvested = stockCompanies.reduce((sum, company) => {
        const item = portfolio[company.id]
        if (item) {
            return sum + (item.shares * item.avgBuyPrice)
        }
        return sum
    }, 0)

    const totalProfit = totalPortfolioValue - totalInvested

    // Sorting Logic
    const sortedCompanies = [...stockCompanies].sort((a, b) => {
        let valA, valB
        if (sortBy === 'name') {
            valA = a.name
            valB = b.name
            return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        } else if (sortBy === 'price') {
            valA = a.currentPrice
            valB = b.currentPrice
        } else {
            // Value owned
            valA = (portfolio[a.id]?.shares || 0) * a.currentPrice
            valB = (portfolio[b.id]?.shares || 0) * b.currentPrice
        }
        return sortAsc ? valA - valB : valB - valA
    })

    // Correct Logic for Chart Data with Dates
    const chartDataWithDates = (() => {
        const history = selectedCompany.history
        const step = history.length > 200 ? Math.ceil(history.length / 100) : 1

        const data = []

        // Fix: Anchor to the last Monday to ensure stable dates throughout the week
        // The stock update happens on Monday.
        const anchorDate = new Date(gameDate)
        // Adjust to last Monday (if 1 (Mon), leave it. If 2 (Tue), -1. If 0 (Sun), -6)
        const day = anchorDate.getDay()
        const diff = anchorDate.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
        anchorDate.setDate(diff)

        for (let i = 0; i < history.length; i += step) {
            const price = history[i]
            const weeksAgo = history.length - 1 - i

            // Calculate date relative to anchor
            const d = new Date(anchorDate)
            d.setDate(diff - (weeksAgo * 7))

            data.push({
                date: d.toISOString().split('T')[0], // YYYY-MM-DD
                price
            })
        }
        // Ensure last point is included for "Now"
        if (history.length > 0 && (history.length - 1) % step !== 0) {
            data.push({
                date: anchorDate.toISOString().split('T')[0],
                price: history[history.length - 1]
            })
        }

        return data
    })()

    const handleBuy = () => {
        const amount = parseInt(tradeAmount)
        if (amount > 0) {
            buyShares(selectedCompany.id, amount)
        }
    }

    const handleSell = () => {
        const amount = parseInt(tradeAmount)
        if (amount > 0) {
            sellShares(selectedCompany.id, amount)
        }
    }

    const handleBuyMax = () => {
        // Calculate max shares affordable
        const costPerShare = selectedCompany.currentPrice * 1.01
        const maxAffordable = Math.floor(money / costPerShare)

        // Calculate max shares allowed (1B limit)
        const currentOwned = portfolio[selectedCompany.id]?.shares || 0
        const maxAllowed = 1000000000 - currentOwned

        const amount = Math.min(maxAffordable, maxAllowed)

        if (amount <= 0) return

        const totalCost = amount * costPerShare
        setPendingAction({ type: 'buy', amount, cost: totalCost })
        setConfirmationOpen(true)
    }

    const handleSellAll = () => {
        const amount = portfolio[selectedCompany.id]?.shares || 0
        if (amount <= 0) return

        const totalRevenue = amount * selectedCompany.currentPrice * 0.99
        setPendingAction({ type: 'sell', amount, cost: totalRevenue })
        setConfirmationOpen(true)
    }

    const confirmTransaction = () => {
        if (!pendingAction) return
        if (pendingAction.type === 'buy') {
            buyShares(selectedCompany.id, pendingAction.amount)
        } else {
            sellShares(selectedCompany.id, pendingAction.amount)
        }
        setConfirmationOpen(false)
        setPendingAction(null)
    }

    // Generic Sort Handler
    const handleSort = (key: 'name' | '1r' | '5l' | '10l' | '25l' | 'all' | 'shares' | 'profit') => {
        if (portfolioSortBy === key) {
            setPortfolioSortAsc(!portfolioSortAsc)
        } else {
            setPortfolioSortBy(key)
            setPortfolioSortAsc(true) // Default to ASC (lowest first) or customize based on intent
        }
    }

    return (
        <div className="space-y-4 h-full flex flex-col overflow-y-auto p-2 relative">
            <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Potwierdzenie Transakcji</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-muted-foreground text-sm">
                                Czy na pewno chcesz {pendingAction?.type === 'buy' ? 'kupić' : 'sprzedać'} <strong>{pendingAction?.amount.toLocaleString()}</strong> akcji spółki <strong>{selectedCompany.name}</strong>?
                                <br /><br />
                                Cena jednostkowa: {formatMoney(selectedCompany.currentPrice)}
                                <br />
                                Łączna wartość: <strong>{formatMoney(pendingAction?.cost || 0)}</strong>
                                {pendingAction?.type === 'buy' && pendingAction.amount >= 1000000 && (
                                    <>
                                        <br />
                                        <span className="text-yellow-500 text-xs">Uwaga: Duża transakcja.</span>
                                    </>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmTransaction}>
                            {pendingAction?.type === 'buy' ? 'Potwierdź Zakup' : 'Potwierdź Sprzedaż'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <Card className="">
                    <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Portfel Akcji</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="text-2xl font-bold">{formatMoneyNoCents(totalPortfolioValue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Łączna wartość rynkowa</p>
                    </CardContent>
                </Card>

                <Card className="">
                    <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Zysk / Strata</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {totalProfit >= 0 ? "+" : ""}{formatMoneyNoCents(totalProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : "0.0"}% ROI
                        </p>
                    </CardContent>
                </Card>

                <Card className="col-span-2 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-5 w-5 text-yellow-500" />
                            <span className="text-sm font-medium uppercase tracking-wider">Gotówka</span>
                        </div>
                        <p className="text-4xl font-bold text-foreground">{formatMoneyNoCents(money)}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
                {/* Left Column: Company List */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader className="p-3 border-b border-border/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm">Rynek</CardTitle>
                            <div className="flex gap-1 text-[10px]">
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { setSortBy('name'); setSortAsc(!sortAsc) }}>Nazwa</Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { setSortBy('price'); setSortAsc(!sortAsc) }}>Cena</Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => { setSortBy('value'); setSortAsc(!sortAsc) }}>Wartość</Button>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="px-3 pb-3 flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex-1 h-7 text-xs ${viewMode === 'companies' ? 'bg-green-900/50 text-green-100 hover:bg-green-900/70 hover:text-white' : 'bg-secondary/40 text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setViewMode('companies')}
                            >
                                Spółki
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`flex-1 h-7 text-xs ${viewMode === 'etfs' ? 'bg-blue-900/50 text-blue-100 hover:bg-blue-900/70 hover:text-white' : 'bg-secondary/40 text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setViewMode('etfs')}
                            >
                                Fundusze ETF ({stockCompanies.filter(c => c.isETF).length})
                            </Button>
                        </div>

                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                        <ScrollArea className="h-[450px]">
                            <div className="divide-y divide-border/30">
                                {sortedCompanies.filter(c => {
                                    if (viewMode === 'etfs') return c.isETF
                                    return !c.isETF
                                }).map(company => {
                                    const owned = portfolio[company.id]?.shares || 0
                                    const change = ((company.currentPrice - company.startingPrice) / company.startingPrice) * 100

                                    return (
                                        <div
                                            key={company.id}
                                            className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors flex justify-between items-center ${selectedCompany.id === company.id ? "bg-accent" : ""} ${company.isETF ? "bg-blue-950/20 border-l-2 border-l-blue-500" : ""}`}
                                            onClick={() => setSelectedCompanyId(company.id)}
                                        >
                                            <div>
                                                <div className="font-semibold text-sm flex items-center gap-2">
                                                    {company.name}
                                                    {/* Diamond Companies (Blue Chips) - Protected from bankruptcy */}
                                                    {company.isProtected && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Gem className="w-3.5 h-3.5 text-cyan-400" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs">Spółka Strategiczna (Ochrona przed bankructwem)</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {/* Shield Badge - Company Age */}
                                                    {(() => {
                                                        const badge = getCompanyBadge(company.formationYear, gameDate.getFullYear())
                                                        if (badge) {
                                                            const BadgeIcon = badge.Icon
                                                            return (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <BadgeIcon className={`w-3.5 h-3.5 ${badge.color}`} />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="text-xs">{badge.tooltip}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )
                                                        }
                                                        return null
                                                    })()}
                                                    {/* ETF Badge */}
                                                    {company.isETF && <Badge variant="outline" className="text-[10px] bg-blue-900/30 text-blue-300 border-blue-700 h-5">ETF</Badge>}
                                                    {owned > 0 && (
                                                        <span className="text-emerald-400 text-xs font-mono ml-1">
                                                            [{owned >= 1000 ? (owned / 1000).toFixed(1) + 'k' : owned}]
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    {(() => {
                                                        const Icon = getSectorIcon(company.sector)
                                                        return <Icon className="w-3 h-3 opacity-70" />
                                                    })()}
                                                    {company.sector}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-sm">{formatMoney(company.currentPrice)}</div>
                                                <div className={`text-[10px] ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                    {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right Column: Details */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardContent className="p-4 space-y-4">

                        {/* Details Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold">{selectedCompany.name}</h2>
                                    {/* ETF Badge */}
                                    {selectedCompany.isETF && (
                                        <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">ETF</Badge>
                                    )}
                                    {/* Diamond Companies - Protected Badge */}
                                    {selectedCompany.isProtected && !selectedCompany.isETF && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Gem className="w-5 h-5 text-cyan-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Spółka Strategiczna (Ochrona przed bankructwem)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {/* Shield - Company Age */}
                                    {(() => {
                                        const badge = getCompanyBadge(selectedCompany.formationYear, gameDate.getFullYear())
                                        if (badge && !selectedCompany.isETF) {
                                            const BadgeIcon = badge.Icon
                                            return (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{badge.tooltip}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )
                                        }
                                        return null
                                    })()}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                                    {(() => {
                                        const Icon = getSectorIcon(selectedCompany.sector)
                                        return <Icon className="w-3.5 h-3.5" />
                                    })()}
                                    <span>{selectedCompany.sector}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-xs">{selectedCompany.category}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold">{formatMoney(selectedCompany.currentPrice)}</div>
                                {(() => {
                                    // Calculate Changes
                                    const history = selectedCompany.history
                                    const current = selectedCompany.currentPrice

                                    const renderChange = (weeks: number, label: string) => {
                                        // history includes current price at last index
                                        const idx = history.length - 1 - weeks

                                        if (idx < 0) {
                                            return (
                                                <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                                                    <span className="mr-1 hidden sm:inline">{label}:</span>
                                                    <span className="mr-1 sm:hidden">{label}:</span>
                                                    <span>-</span>
                                                </div>
                                            )
                                        }

                                        const basePrice = history[idx]
                                        const change = current - basePrice
                                        const changePercent = basePrice > 0 ? (change / basePrice) * 100 : 0

                                        return (
                                            <div className={`flex items-center justify-end gap-1 text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                <span className="text-muted-foreground mr-1 hidden sm:inline">{label}:</span>
                                                <span className="text-muted-foreground mr-1 sm:hidden">{label}:</span>
                                                <span>{change >= 0 ? "+" : ""}{changePercent.toFixed(2)}%</span>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div className="flex gap-4 justify-end">
                                            {renderChange(1300, "25l")}
                                            {renderChange(520, "10l")}
                                            {renderChange(260, "5l")}
                                            {renderChange(48, "1r")}
                                            {renderChange(4, "1m")}
                                            {renderChange(1, "7d")}
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[200px] w-full bg-background/20 rounded-lg p-2 border border-border/30">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartDataWithDates}>
                                    <XAxis
                                        dataKey="date"
                                        hide={false}
                                        tick={{ fontSize: 10 }}
                                        interval={12} // Show approx 1 per year
                                        tickFormatter={(val) => val.split('-')[0]} // Show only Year
                                        height={30}
                                        padding={{ left: 20, right: 20 }} // Fix cutoff
                                    />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                                        labelStyle={{ color: "#9ca3af" }}
                                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Cena"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Trading Area */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/30">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Twoja Pozycja</div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/20 p-2 rounded">
                                    <div>Akcje:</div> <div className="text-foreground text-right">{userShares.toLocaleString()}</div>
                                    <div>Śr. Cena:</div> <div className="text-foreground text-right">{formatMoney(avgBuyPrice)}</div>
                                    <div>Wartość:</div> <div className="text-foreground text-right">{formatMoneyNoCents(userShares * selectedCompany.currentPrice)}</div>
                                    <div>Zysk:</div> <div className={`text-right ${((selectedCompany.currentPrice - avgBuyPrice) * userShares) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {userShares > 0 ? formatMoneyNoCents((selectedCompany.currentPrice - avgBuyPrice) * userShares) : "$0"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm font-medium">Handel</div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={tradeAmount}
                                        onChange={(e) => setTradeAmount(e.target.value)}
                                        className="font-mono"
                                    />
                                    <Button variant="outline" onClick={() => setTradeAmount("10000")}>10k</Button>
                                    <Button variant="outline" onClick={() => setTradeAmount("100000")}>100k</Button>
                                    <Button variant="outline" onClick={() => setTradeAmount("1000000")}>1mln</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Button onClick={handleBuy} className="bg-green-600 hover:bg-green-700 w-full" disabled={parseInt(tradeAmount) <= 0}>
                                            KUP
                                            <span className="ml-1 text-[8px] opacity-70 hidden sm:inline">(1%)</span>
                                        </Button>
                                        <Button onClick={handleBuyMax} variant="outline" className="w-full text-xs h-6 border-green-600 text-green-600 hover:bg-green-600/10" disabled={money < selectedCompany.currentPrice}>
                                            KUP MAX
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Button onClick={handleSell} variant="destructive" className="w-full" disabled={parseInt(tradeAmount) <= 0 || parseInt(tradeAmount) > userShares}>
                                            SPRZEDAJ
                                            <span className="ml-1 text-[8px] opacity-70 hidden sm:inline">(1%)</span>
                                        </Button>
                                        <Button onClick={handleSellAll} variant="outline" className="w-full text-xs h-6 border-red-600 text-red-600 hover:bg-red-600/10" disabled={userShares <= 0}>
                                            SPRZEDAJ ALL
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-[10px] text-center text-muted-foreground">
                                    Szacowany koszt: {formatMoneyNoCents(selectedCompany.currentPrice * (parseInt(tradeAmount) || 0) * 1.01)}
                                </div>
                            </div>
                        </div>
                    </CardContent >
                </Card >
            </div >

            {/* Portfolio Table */}
            < Card className="min-h-[400px] mt-8 shrink-0 flex flex-col" >
                <CardHeader className="p-3 border-b border-border/50">
                    <CardTitle className="text-sm">Twoje Akcje</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-[600px]">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted text-muted-foreground sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-2 w-[15%] cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>Firma</th>
                                    <th className="px-4 py-2 text-right w-[8%] cursor-pointer hover:text-foreground" onClick={() => handleSort('1r')}>1R</th>
                                    <th className="px-4 py-2 text-right w-[8%] cursor-pointer hover:text-foreground" onClick={() => handleSort('5l')}>5L</th>
                                    <th className="px-4 py-2 text-right w-[8%] cursor-pointer hover:text-foreground" onClick={() => handleSort('10l')}>10L</th>
                                    <th className="px-4 py-2 text-right w-[8%] cursor-pointer hover:text-foreground" onClick={() => handleSort('25l')}>25L</th>
                                    <th className="px-4 py-2 text-right w-[8%] cursor-pointer hover:text-foreground" onClick={() => handleSort('all')}>All</th>
                                    <th className="px-4 py-2 text-right w-[10%] cursor-pointer hover:text-foreground" onClick={() => handleSort('shares')}>Posiadane</th>
                                    <th className="px-4 py-2 text-right w-[10%] cursor-pointer hover:text-foreground" onClick={() => handleSort('profit')}>Spadek/Zysk</th>
                                    <th className="px-4 py-2 text-center w-[5%] bg-muted">Akcja</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {Object.entries(portfolio)
                                    .map(([id, item]) => {
                                        const company = stockCompanies.find(c => c.id === id)
                                        return { id, item, company }
                                    })
                                    .filter(x => x.company !== undefined) // safety check
                                    .sort((a, b) => {
                                        // Sorting Logic
                                        const cA = a.company!
                                        const cB = b.company!
                                        let valA: number = 0, valB: number = 0

                                        // Helper for ROI sorting - MATCHES DISPLAY LOGIC
                                        // If not enough history, fallback to index 0 (oldest available)
                                        const getSortROI = (c: any, weeks: number) => {
                                            let idx = c.history.length - 1 - weeks

                                            // Fallback logic
                                            if (idx < 0) idx = 0

                                            const old = c.history[idx]
                                            if (!old || old === 0) return 0

                                            return ((c.currentPrice - old) / old)
                                        }

                                        switch (portfolioSortBy) {
                                            case 'name':
                                                return portfolioSortAsc ? cA.name.localeCompare(cB.name) : cB.name.localeCompare(cA.name)
                                            case 'shares':
                                                valA = a.item.shares
                                                valB = b.item.shares
                                                break
                                            case 'profit':
                                                const valueA = a.item.shares * cA.currentPrice
                                                const profitA = valueA - (a.item.shares * a.item.avgBuyPrice)
                                                const valueB = b.item.shares * cB.currentPrice
                                                const profitB = valueB - (b.item.shares * b.item.avgBuyPrice)
                                                valA = profitA
                                                valB = profitB
                                                break
                                            case '1r':
                                                valA = getSortROI(cA, 48)
                                                valB = getSortROI(cB, 48)
                                                break
                                            case '5l':
                                                valA = getSortROI(cA, 260)
                                                valB = getSortROI(cB, 260)
                                                break
                                            case '10l':
                                                valA = getSortROI(cA, 520)
                                                valB = getSortROI(cB, 520)
                                                break
                                            case '25l':
                                                valA = getSortROI(cA, 1300)
                                                valB = getSortROI(cB, 1300)
                                                break
                                            case 'all':
                                                valA = ((cA.currentPrice - (cA.startingPrice || 0)) / (cA.startingPrice || 1))
                                                valB = ((cB.currentPrice - (cB.startingPrice || 0)) / (cB.startingPrice || 1))
                                                break
                                        }

                                        // Numeric sort
                                        return portfolioSortAsc ? valA - valB : valB - valA
                                    })
                                    .map(({ id, item, company }) => {
                                        // The original map content
                                        // Use 'company!' since we filtered undefined
                                        const c = company!
                                        const value = item.shares * c.currentPrice
                                        const profit = value - (item.shares * item.avgBuyPrice)
                                        const profitPercent = item.avgBuyPrice > 0 ? (profit / (item.shares * item.avgBuyPrice)) * 100 : 0
                                        const ownedPercent = (item.shares / 1000000000) * 100

                                        return (
                                            <tr key={id} className="hover:bg-muted/30 bg-background/95 backdrop-blur-sm border-b border-border/30">
                                                <td className="px-4 py-2 font-medium">{c.name}</td>
                                                <td className="px-4 py-2 text-right text-xs">
                                                    {calculateROI(c.currentPrice, c.history, 52)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-xs">
                                                    {calculateROI(c.currentPrice, c.history, 260)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-xs">
                                                    {calculateROI(c.currentPrice, c.history, 520)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-xs">
                                                    {calculateROI(c.currentPrice, c.history, 1300)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-xs">
                                                    {calculateROI(c.currentPrice, c.history, 'all', c.startingPrice)}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {item.shares > 0 ? (
                                                        <div className="flex flex-col items-end">
                                                            <span>{item.shares.toLocaleString()}</span>
                                                            <span className="text-[10px] text-muted-foreground">{ownedPercent.toFixed(2)}%</span>
                                                        </div>
                                                    ) : "-"}
                                                </td>
                                                <td className={`px-4 py-2 text-right ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                    <div className="flex flex-col items-end">
                                                        <span>{formatMoneyNoCents(profit)}</span>
                                                        <span className="text-[10px]">{profit >= 0 ? "+" : ""}{profitPercent.toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setSelectedCompanyId(id)}>
                                                        Handluj
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {Object.keys(portfolio).length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            Twój portfel jest pusty. Kup akcje z listy po lewej stronie.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </ScrollArea>
                </CardContent>
            </Card >

            {/* Disclaimer / Date Range Info */}
            < div className="text-[10px] text-center text-muted-foreground pb-1" >
                Dane rynkowe odświeżane co tydzień(Poniedziałki).Wykres prezentuje historię z ostatnich 2 - 3 lat.
            </div >
        </div >
    )
}
