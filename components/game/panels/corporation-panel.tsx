"use client"

import { useGameStore } from "@/lib/game-store"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Building, Package, Coins, Trophy, BarChart3, Milestone, Briefcase, Lock } from "lucide-react"
import { carClasses } from "@/data/carClasses"
import { useState } from "react"

export function CorporationPanel() {
    const {
        getCompanyValuation,
        getPrestigeTier,
        getMarketDominance,
        totalRevenueAllTime,
        totalExpensesAllTime,
        totalCarsProducedAllTime,
        totalCarsSoldAllTime,
        totalExportSalesAllTime,
        totalContractSalesAllTime,
        totalContractRevenueAllTime,
        totalExportRevenueAllTime,
        totalCrisisCostsAllTime,
        totalRealizedStockProfit,
        totalBrokerageFees,
        gameDate,
        money,
        factoryExpansionLevel,
        showroomExpansionLevel,
        purchaseFactoryExpansion,
        purchaseShowroomExpansion
    } = useGameStore()

    const formatMoney = useCurrencyFormatter()
    const valuation = getCompanyValuation()
    const prestige = getPrestigeTier()
    const marketDominance = getMarketDominance()

    const netProfitAllTime = totalRevenueAllTime - totalExpensesAllTime
    const progressPercentage = prestige.nextTierThreshold
        ? Math.min(100, (prestige.salesProgress / prestige.nextTierThreshold) * 100)
        : 100

    const [sortConfig, setSortConfig] = useState<{ key: 'class' | 'sales' | 'revenue' | 'profit', direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' })

    const handleSort = (key: 'class' | 'sales' | 'revenue' | 'profit') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    const sortedDominance = Object.entries(marketDominance)
        .map(([classId, stats]) => ({
            classId,
            ...stats,
            netProfit: stats.totalRevenue - stats.totalCOGS,
            className: (carClasses as any)[classId]?.name || classId,
        }))
        .sort((a, b) => {
            const { key, direction } = sortConfig
            const multiplier = direction === 'asc' ? 1 : -1

            switch (key) {
                case 'sales':
                    return (a.totalSales - b.totalSales) * multiplier
                case 'revenue':
                    return (a.totalRevenue - b.totalRevenue) * multiplier
                case 'profit':
                    return (a.netProfit - b.netProfit) * multiplier
                case 'class':
                default:
                    return a.classId.localeCompare(b.classId) * multiplier
            }
        })

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-foreground">Korporacja</h2>
                <p className="text-muted-foreground">Zarządzanie wartością i prestiżem Twojej firmy</p>
            </div>

            {/* Card 1: Assets & Valuation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-success" />
                        Majątek i Wycena
                    </CardTitle>
                    <CardDescription>Aktualna wartość całkowita korporacji</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Total Valuation */}
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-sm text-muted-foreground mb-1">Wartość Całkowita</p>
                        <p className="text-3xl font-bold text-success">{formatMoney(valuation.total)}</p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-muted-foreground">Płynność</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{formatMoney(valuation.liquidAssets)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Gotówka + Lokaty</p>
                        </div>

                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Building className="w-4 h-4 text-amber-400" />
                                <p className="text-xs text-muted-foreground">Nieruchomości</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{formatMoney(valuation.realEstate)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Fabryki + Salony</p>
                        </div>

                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <p className="text-xs text-muted-foreground">Portfel Akcji</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{formatMoney(valuation.portfolioValue || 0)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Wartość Rynkowa Akcji</p>
                        </div>

                        <div className="p-3 rounded-lg bg-card border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Package className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-muted-foreground">Magazyn</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{formatMoney(valuation.inventoryValue)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Wartość Parkingu</p>
                        </div>


                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Legacy & Prestige */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Dziedzictwo i Prestiż
                    </CardTitle>
                    <CardDescription>Uznanie marki i statystyki od początku istnienia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Prestige Badge */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Prestiż Marki</p>
                                <p className="text-2xl font-bold text-amber-500">{prestige.name}</p>
                                <p className="text-sm text-muted-foreground">Ranga {prestige.rank} / 20</p>
                            </div>
                            <Trophy className="w-12 h-12 text-amber-500/50" />
                        </div>

                        {prestige.nextTierThreshold && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Postęp do następnej rangi</span>
                                    <span>{prestige.salesProgress.toLocaleString()} / {prestige.nextTierThreshold.toLocaleString()}</span>
                                </div>
                                <Progress value={progressPercentage} className="h-2" />
                            </div>
                        )}
                    </div>

                    {/* All-Time Stats */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Statystyki Od Początku Istnienia</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Całkowity Przychód</p>
                                <p className="text-lg font-semibold text-orange-500">{formatMoney(totalRevenueAllTime)}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Całkowite Wydatki</p>
                                <p className="text-lg font-semibold text-red-500">{formatMoney(totalExpensesAllTime)}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Zysk Netto (Całość)</p>
                                <p className={`text-lg font-semibold ${netProfitAllTime >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {formatMoney(netProfitAllTime)}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Łączna Produkcja</p>
                                <p className="text-lg font-semibold text-amber-500">{totalCarsProducedAllTime.toLocaleString()} szt</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Łączna Sprzedaż</p>
                                <p className="text-lg font-semibold text-blue-500">{totalCarsSoldAllTime.toLocaleString()} szt</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Sprzedaż Eksportowa</p>
                                <p className="text-lg font-semibold text-purple-500">{totalExportSalesAllTime.toLocaleString()} szt</p>
                                <p className="text-xs text-success mt-1">{formatMoney(totalExportRevenueAllTime)} przychodu</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Kontrakty Krajowe</p>
                                <p className="text-lg font-semibold text-amber-500">{totalContractSalesAllTime.toLocaleString()} szt</p>
                                <p className="text-xs text-success mt-1">{formatMoney(totalContractRevenueAllTime)} przychodu</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Koszty Kryzysowe</p>
                                <p className="text-lg font-semibold text-destructive">{formatMoney(totalCrisisCostsAllTime)}</p>
                            </div>

                            <div className="p-3 rounded-lg bg-card border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Wynik Giełdowy</p>
                                <p className={`text-lg font-semibold ${totalRealizedStockProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                                    {formatMoney(totalRealizedStockProfit)}
                                </p>
                                <p className="text-xs text-destructive mt-1">
                                    -{formatMoney(totalBrokerageFees)} prowizji
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Market Dominance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Dominacja Rynkowa
                    </CardTitle>
                    <CardDescription>Sprzedaż, przychody i zyski według klas samochodów</CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedDominance.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Brak danych o sprzedaży. Rozpocznij produkcję, aby zobaczyć statystyki.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th
                                            className="text-left text-xs font-semibold text-muted-foreground py-2 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                                            onClick={() => handleSort('class')}
                                        >
                                            Klasa {sortConfig.key === 'class' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="text-right text-xs font-semibold text-muted-foreground py-2 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                                            onClick={() => handleSort('sales')}
                                        >
                                            Łączna Sprzedaż {sortConfig.key === 'sales' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="text-right text-xs font-semibold text-muted-foreground py-2 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                                            onClick={() => handleSort('revenue')}
                                        >
                                            Przychód z Klasy {sortConfig.key === 'revenue' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="text-right text-xs font-semibold text-muted-foreground py-2 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
                                            onClick={() => handleSort('profit')}
                                        >
                                            Zysk Netto {sortConfig.key === 'profit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedDominance.map((item, idx) => (
                                        <tr key={item.classId} className={idx % 2 === 0 ? "bg-card/50" : ""}>
                                            <td className="py-2 px-3 text-sm font-medium text-foreground">
                                                {item.className} ({item.classId})
                                            </td>
                                            <td className="py-2 px-3 text-sm text-right text-blue-400">
                                                {item.totalSales.toLocaleString()} szt
                                            </td>
                                            <td className="py-2 px-3 text-sm text-right text-orange-500 font-semibold">
                                                {formatMoney(item.totalRevenue)}
                                            </td>
                                            <td className={`py-2 px-3 text-sm text-right font-semibold ${item.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {formatMoney(item.netProfit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Strategic Expansions (Hardcore Economy) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Milestone className="w-5 h-5 text-indigo-500" />
                        Ekspansja Strategiczna (2025+)
                    </CardTitle>
                    <CardDescription>Odblokuj nowe limity infrastruktury poprzez lobbing i inwestycje</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Factory Expansion */}
                    <div className="p-4 rounded-lg bg-card border border-border flex flex-col justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building className="w-5 h-5 text-accent" />
                                <h4 className="font-bold text-foreground">Ekspansja Przemysłowa</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Poziom: <span className="text-foreground font-bold">{factoryExpansionLevel}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Zwiększa limit fabryk o +4.
                            </p>
                        </div>
                        {(() => {
                            const isYearUnlocked = gameDate.getFullYear() >= 2025
                            // Cost Formula: 500M * 1.2^level
                            const cost = Math.round((500000000 * Math.pow(1.2, factoryExpansionLevel)) / 1000000) * 1000000
                            const canAfford = money >= cost

                            return (
                                <button
                                    className={`w-full py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${!isYearUnlocked ? "bg-muted text-muted-foreground cursor-not-allowed" : canAfford ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-destructive/10 text-destructive cursor-not-allowed"}`}
                                    disabled={!isYearUnlocked || !canAfford}
                                    onClick={purchaseFactoryExpansion}
                                >
                                    {!isYearUnlocked ? <Lock className="w-4 h-4" /> : null}
                                    {isYearUnlocked ? `Odblokuj (${formatMoney(cost)})` : "Wymagany rok 2025"}
                                </button>
                            )
                        })()}
                    </div>

                    {/* Showroom Expansion */}
                    <div className="p-4 rounded-lg bg-card border border-border flex flex-col justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-5 h-5 text-emerald-500" />
                                <h4 className="font-bold text-foreground">Sieć Dystrybucji</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Poziom: <span className="text-foreground font-bold">{showroomExpansionLevel}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Zwiększa limit salonów o +7.
                            </p>
                        </div>
                        {(() => {
                            const isYearUnlocked = gameDate.getFullYear() >= 2025
                            // Cost Formula: 250M * 1.2^level
                            const cost = Math.round((250000000 * Math.pow(1.2, showroomExpansionLevel)) / 1000000) * 1000000
                            const canAfford = money >= cost

                            return (
                                <button
                                    className={`w-full py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${!isYearUnlocked ? "bg-muted text-muted-foreground cursor-not-allowed" : canAfford ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-destructive/10 text-destructive cursor-not-allowed"}`}
                                    disabled={!isYearUnlocked || !canAfford}
                                    onClick={purchaseShowroomExpansion}
                                >
                                    {!isYearUnlocked ? <Lock className="w-4 h-4" /> : null}
                                    {isYearUnlocked ? `Odblokuj (${formatMoney(cost)})` : "Wymagany rok 2025"}
                                </button>
                            )
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
