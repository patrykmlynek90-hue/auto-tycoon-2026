"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Store,
  Plus,
  MapPin,
  TrendingUp,
  ShoppingCart,
  Target,
} from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"

export function DealershipsPanel() {
  const { dealerships, money, buyDealership, upgradeDealership, toggleDealershipStatus, globalShowroomLimit, showroomExpansionLevel } = useGameStore()

  const formatMoney = useCurrencyFormatter()

  const newDealershipCost = 75000
  const currentLimit = globalShowroomLimit + (showroomExpansionLevel * 7)
  const isLimitReached = dealerships.length >= currentLimit
  const canBuy = money >= newDealershipCost && !isLimitReached
  // Only count active capacity
  const totalSalesCapacity = dealerships.reduce((sum, d) => sum + (d.status === 'idle' ? 0 : d.salesCapacity), 0)
  const totalSalesThisMonth = dealerships.reduce((sum, d) => sum + d.salesThisMonth, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sieć Salonów</h2>
          <p className="text-muted-foreground">
            Rozbudowuj sieć sprzedaży i zwiększaj zasięg
          </p>
        </div>
        <Button onClick={buyDealership} disabled={!canBuy} className="gap-2">
          <Plus className="w-4 h-4" />
          Kup Nowy Salon ({formatMoney(newDealershipCost)})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Store className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salony</p>
                <p className="text-xl font-bold text-foreground">{dealerships.length} / {currentLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zdolność sprzedaży</p>
                <p className="text-xl font-bold text-foreground">{totalSalesCapacity}/mies.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <ShoppingCart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sprzedaż (mies.)</p>
                <p className="text-xl font-bold text-foreground">{totalSalesThisMonth} szt.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-research/10">
                <TrendingUp className="w-5 h-5 text-research" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wykorzystanie</p>
                <p className="text-xl font-bold text-foreground">
                  {((totalSalesThisMonth / totalSalesCapacity) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dealerships Grid */}
      <div className="grid grid-cols-2 gap-4">
        {dealerships.map((dealership) => {
          const utilizationPercent = (dealership.salesThisMonth / dealership.salesCapacity) * 100

          return (
            <Card key={dealership.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${dealership.status === 'idle' ? 'bg-secondary' : 'bg-info/10'}`}>
                      <Store className={`w-6 h-6 ${dealership.status === 'idle' ? 'text-muted-foreground' : 'text-info'}`} />
                      <div className="absolute -top-2 -right-2 bg-background border border-border px-1.5 py-0.5 rounded-md text-xs font-bold">Lvl {dealership.level || 1}</div>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {dealership.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {dealership.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sales Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Sprzedaż miesięczna</span>
                    <span className="text-sm font-medium text-foreground">
                      {dealership.salesThisMonth} / {dealership.salesCapacity}
                    </span>
                  </div>
                  <Progress value={utilizationPercent} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${dealership.status === 'idle' ? 'bg-secondary' : 'bg-secondary/50'}`}>
                    <p className="text-xs text-muted-foreground">Zdolność</p>
                    <p className="text-lg font-bold text-foreground">
                      {dealership.salesCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">aut/mies.</p>
                  </div>
                  <div className={`p-3 rounded-xl ${dealership.status === 'idle' ? 'bg-secondary' : 'bg-secondary/50'}`}>
                    <p className="text-xs text-muted-foreground">Sprzedano</p>
                    <p className="text-lg font-bold text-primary">
                      {dealership.salesThisMonth}
                    </p>
                    <p className="text-xs text-muted-foreground">ten miesiąc</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent text-xs"
                    disabled={dealership.level >= 5 || money < dealership.upgradeCost}
                    onClick={() => upgradeDealership(dealership.id)}
                  >
                    {dealership.level >= 5 ? "Max Lvl" : `Lvl ${dealership.level}→${dealership.level + 1} (${formatMoney(dealership.upgradeCost)})`}
                  </Button>

                  <Button
                    variant={dealership.status === 'idle' ? "default" : "secondary"}
                    className={`gap-2 ${dealership.status === 'idle' ? "bg-green-600 hover:bg-green-700" : "hover:bg-destructive/10 hover:text-destructive"}`}
                    onClick={() => toggleDealershipStatus(dealership.id)}
                  >
                    {dealership.status === 'idle' ? "Otwórz" : "Zamknij"}
                  </Button>
                </div>

                {dealership.status === 'idle' && (
                  <div className="text-center p-1 bg-yellow-500/10 text-yellow-600 rounded-md text-xs font-medium">
                    ⚠ Zamknięty. Koszty: 15%.
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Add New Dealership Card */}
        <Card
          className={`bg-card border-border border-dashed cursor-pointer transition-all hover:border-primary/50 ${!canBuy && "opacity-50"}`}
          onClick={() => canBuy && buyDealership()}
        >
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Nowy Salon</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Rozszerz sieć sprzedaży o nową lokalizację
            </p>
            <p className="text-lg font-bold text-primary">
              {isLimitReached ? "Limit Salonów!" : formatMoney(newDealershipCost)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
