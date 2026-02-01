"use client"

import { useGameStore } from "@/lib/game-store"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  FastForward,
  ChevronsRight,
  Calendar,
  Users,
  Banknote,
  HardHat,
  Factory as FactoryIcon,
  Store,
  Package,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"

export function GameHeader() {
  const {
    gameDate,
    gameSpeed,
    isPaused,
    money,
    cityPopulation,
    togglePause,
    setGameSpeed,
    toggleCurrency,
    currency,
    warpTime,
    factories,
    dealerships,
    wasAutoPaused,
    isContractOfferModalOpen,
    isCrisisModalOpen,
    marketDemand,
    previousMarketDemandTotal
  } = useGameStore()

  const formatMoney = useCurrencyFormatter()

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${d} - ${m} - ${y}`
  }

  const canUseHighSpeed = !isContractOfferModalOpen && !isCrisisModalOpen

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return pop.toString()
  }

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left - Time Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground w-32">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium text-foreground tabular-nums">
            {formatDate(gameDate)}
          </span>
        </div>
      </div>

      {/* Center - Time Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePause}
          className={`h-8 w-8 ${isPaused ? "text-accent border-accent/50 bg-accent/10" : "text-muted-foreground"}`}
          title={isPaused ? "Wznów" : "Pauza"}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setGameSpeed(1)}
            className={`p-1.5 rounded transition-all ${gameSpeed === 1
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            title="Normalna prędkość"
          >
            <Play className="w-4 h-4" />
          </button>

          <button
            onClick={() => setGameSpeed(2)}
            className={`p-1.5 rounded transition-all ${gameSpeed === 2
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            title="Szybko (2x)"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setGameSpeed(10)}
            className={`p-1.5 rounded transition-all ${gameSpeed === 10
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            title="Bardzo szybko (10x)"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setGameSpeed(25)}
            disabled={!canUseHighSpeed}
            className={`p-1.5 rounded transition-all relative flex items-center gap-1 ${gameSpeed === 25
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              } ${!canUseHighSpeed ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={canUseHighSpeed ? "Ekstremalnie szybko (25x)" : "Niedostępne podczas wydarzeń"}
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold">25×</span>
          </button>
        </div>

        {wasAutoPaused && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-600">Spowolniono do 1×</span>
          </div>
        )}

      </div>

      {/* Right - Stats */}
      <div className="flex items-center gap-2">
        {/* Market Demand */}
        <div className="flex items-center gap-2 w-36">
          <div className={`p-1.5 rounded-md ${(marketDemand.lower + marketDemand.middle + marketDemand.higher) > previousMarketDemandTotal
            ? "bg-green-500/10"
            : (marketDemand.lower + marketDemand.middle + marketDemand.higher) < previousMarketDemandTotal
              ? "bg-destructive/10"
              : "bg-secondary"
            }`}>
            {(marketDemand.lower + marketDemand.middle + marketDemand.higher) > previousMarketDemandTotal ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (marketDemand.lower + marketDemand.middle + marketDemand.higher) < previousMarketDemandTotal ? (
              <TrendingDown className="w-4 h-4 text-destructive" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate">Popyt (Msc)</p>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate flex items-center gap-1">
              {marketDemand.lower + marketDemand.middle + marketDemand.higher}
              {(marketDemand.lower + marketDemand.middle + marketDemand.higher) !== previousMarketDemandTotal && (
                <span className={`text-[10px] ${(marketDemand.lower + marketDemand.middle + marketDemand.higher) > previousMarketDemandTotal
                  ? "text-green-500"
                  : "text-destructive"
                  }`}>
                  {/* {totalDemand > previousMarketDemandTotal ? "+" : ""}{totalDemand - previousMarketDemandTotal} */}
                </span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground truncate opacity-80">
              L:{marketDemand.lower} M:{marketDemand.middle} H:{marketDemand.higher}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />

        <div className="flex items-center gap-2 w-28">
          <Package className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">Parking</p>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate">
              {factories.reduce((s, f) => s + f.inventory, 0)} / {factories.reduce((s, f) => s + (1200 + (f.level - 1) * 200), 0)}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-2 w-24">
          <Users className="w-4 h-4 text-info shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">Populacja</p>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate">
              {formatPopulation(cityPopulation)}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-2 w-24">
          <HardHat className="w-4 h-4 text-orange-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">Pracownicy</p>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate">
              {factories.reduce((s, f) => s + f.workers, 0) + dealerships.reduce((s, d) => s + (d.workers || 20), 0)}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-2 w-24">
          <FactoryIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">Produkcja</p>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate">
              {factories.reduce((s, f) => s + (f.status === 'active' ? (f.productionTarget || 0) : 0), 0)} / {factories.reduce((s, f) => s + (f.status === 'active' ? f.capacity : 0), 0)}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-2 w-24">
          <Store className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">Sprzedaż</p>
            <p className="text-sm font-semibold text-foreground tabular-nums truncate">
              {dealerships.reduce((s, d) => s + d.salesThisMonth, 0)} / {dealerships.reduce((s, d) => s + (d.status === 'active' ? d.salesCapacity : 0), 0)}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex items-center gap-3 w-32">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
            onClick={toggleCurrency}
            title="Kliknij, aby zmienić walutę"
          >
            <Banknote className="w-4 h-4 text-success shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Budżet</p>
              <p className="text-sm font-semibold text-foreground tabular-nums truncate">{formatMoney(money)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

