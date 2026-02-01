"use client"

import { useGameStore } from "@/lib/game-store"
import { getAssetPath } from "@/lib/asset-path"
import { carClasses } from "@/data/carClasses" // Added for complexity logic
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Factory,
  Users,
  TrendingUp,
  Wrench,
  Gauge,
  Package,
  HardHat,
  Gavel,
  TrendingDown,
} from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import { AuctionModal } from "@/components/game/modals/auction-modal"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export function FactoryPanel() {
  const { factories, money, upgradeFactory, raiseFactoryWages, buyLandFromDev, auction, gameDate, toggleFactoryStatus, updateFactorySettings, carModels, auctionsHeld, auctionAttempts, globalFactoryLimit, factoryExpansionLevel } = useGameStore()

  const formatMoney = useCurrencyFormatter()

  const totalCapacity = factories.reduce((sum, f) => sum + f.capacity, 0)
  const totalTargetProduction = factories.reduce((sum, f) => sum + (f.status === 'active' ? (f.productionTarget || 0) : 0), 0)
  const totalWorkers = factories.reduce((sum, f) => sum + f.workers, 0)
  const avgEfficiency = factories.reduce((sum, f) => sum + f.efficiency, 0) / (factories.length || 1)

  // Calculate Dev Price for display
  const devPrice = Math.floor(500000 * Math.pow(1.03, gameDate.getFullYear() - 1950) * 5)
  // Use auctionAttempts (max 5)
  const isAuctionLimitReached = (auctionAttempts || 0) >= 5

  const currentFactoryLimit = globalFactoryLimit + (factoryExpansionLevel * 4)
  const isFactoryLimitReached = factories.length >= currentFactoryLimit

  return (
    <div className="p-6 space-y-6">
      <AuctionModal />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Zarządzanie Fabryką</h2>
          <p className="text-muted-foreground">
            Optymalizuj produkcję i rozbudowuj moce przerobowe
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-muted-foreground">Cel Produkcji (Planowany)</p>
            <p className="text-lg font-bold text-foreground">
              {totalTargetProduction} / {totalCapacity} szt./mies.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Factory className="w-6 h-6 text-accent" />
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Factory className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fabryki</p>
                <p className="text-xl font-bold text-foreground">{factories.length} / {currentFactoryLimit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pracownicy</p>
                <p className="text-xl font-bold text-foreground">{totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gauge className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Śr. Wydajność</p>
                <p className="text-xl font-bold text-foreground">{avgEfficiency.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-research/10">
                <Package className="w-5 h-5 text-research" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wykorzystanie</p>
                <p className="text-xl font-bold text-foreground">
                  {((totalTargetProduction / totalCapacity) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Twoje Fabryki</h3>
        {factories.map((factory) => {
          const utilizationPercent = factory.capacity > 0 ? (factory.currentProduction / factory.capacity) * 100 : 0

          const isMaxLevel = factory.level >= 8 // Hardcore max level
          const canUpgrade = !isMaxLevel && money >= factory.upgradeCost

          return (
            <Card key={factory.id} className="bg-card border-border relative overflow-hidden group">
              {/* Background Watermark */}
              <div className="absolute left-1/2 top-2 -translate-x-1/2 pointer-events-none z-0">
                {factory.producingModelId && (
                  (() => {
                    const model = carModels.find(m => m.id === factory.producingModelId)
                    if (!model) return null
                    return (
                      <img
                        src={getAssetPath(`/images/cars/class-${model.class}.png`)}
                        alt=""
                        className="w-[300px] h-auto object-contain opacity-10 filter invert rounded-2xl"
                        style={{
                          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                        }}
                      />
                    )
                  })()
                )}
              </div>
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center relative ${factory.status === 'idle' ? 'bg-secondary' : 'bg-accent/10'}`}>
                      <Factory className={`w-7 h-7 ${factory.status === 'idle' ? 'text-muted-foreground' : 'text-accent'}`} />
                      <div className="absolute -top-3 -right-3 bg-background border border-border px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm whitespace-nowrap">Lvl {factory.level}/8</div>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{factory.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {factory.workers} pracowników
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => upgradeFactory(factory.id)}
                    disabled={!canUpgrade || isMaxLevel}
                    variant={isMaxLevel ? "ghost" : "outline"}
                    className="gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    {isMaxLevel ? "Max Poziom" : `Rozbuduj (${formatMoney(factory.upgradeCost)})`}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Specjalizacja</label>
                      <Select
                        value={factory.producingModelId || ""}
                        onValueChange={(val) => useGameStore.getState().updateFactorySettings(factory.id, { producingModelId: val })}
                        disabled={factory.status === 'idle'}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Wybierz model" />
                        </SelectTrigger>
                        <SelectContent>
                          {carModels.length === 0 ? (
                            <SelectItem value="none" disabled>Brak projektów aut</SelectItem>
                          ) : (
                            carModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>{model.name} (Klasa {model.class})</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center justify-end gap-1">
                        <Package className="w-3 h-3" />
                        Parking Fabryczny
                      </div>
                      <div className={`text-sm font-bold ${factory.inventory >= (1200 + (factory.level - 1) * 200) ? "text-destructive" : "text-foreground"}`}>
                        {factory.inventory} / {1200 + (factory.level - 1) * 200}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {(() => {
                      const pModel = factory.producingModelId ? carModels.find(m => m.id === factory.producingModelId) : null
                      const pClass = pModel ? carClasses[pModel.class] : null
                      const complexityMult = pClass?.productionCostMultiplier || 1.0
                      const effectiveMaxProd = Math.floor(Math.floor(factory.capacity / complexityMult) * (factory.efficiency / 100))

                      return (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cel Produkcji:</span>
                            <span className="font-bold">
                              {Math.min(factory.productionTarget || 0, effectiveMaxProd)} / {effectiveMaxProd} (Max)
                            </span>
                          </div>

                          {complexityMult > 1.0 && (
                            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                              <TrendingDown className="w-3 h-3" />
                              <span>Złożoność: Wydajność 1/{complexityMult} (Koszt {complexityMult}x)</span>
                            </div>
                          )}

                          <Slider
                            value={[Math.min(factory.productionTarget ?? 50, effectiveMaxProd)]}
                            max={effectiveMaxProd}
                            step={1}
                            onValueChange={(vals) => useGameStore.getState().updateFactorySettings(factory.id, { productionTarget: vals[0] })}
                            disabled={factory.status === 'idle'}
                            className="py-1"
                          />
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>Min: 0</span>
                            <span>Cel: {factory.productionTarget || 0} szt/mies</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {factory.inventory >= (1200 + (factory.level - 1) * 200) && factory.status !== 'idle' && (
                    <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      <span>Parking pełny! Produkcja wstrzymana.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">{factory.efficiency}% eff.</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Płace: {factory.wageLevel?.toFixed(2) || "1.00"}x</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => raiseFactoryWages(factory.id)}
                      disabled={factory.efficiency >= 100}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Premia (+5%)
                    </Button>
                    <Button
                      variant={factory.status === 'idle' ? "default" : "secondary"}
                      size="sm"
                      onClick={() => toggleFactoryStatus(factory.id)}
                      className={factory.status === 'idle' ? "bg-green-600 hover:bg-green-700" : "hover:bg-destructive/10 hover:text-destructive"}
                    >
                      {factory.status === 'idle' ? "Uruchom" : "Wstrzymaj"}
                    </Button>
                  </div>
                  {factory.status === 'idle' && (
                    <div className="text-center p-2 bg-yellow-500/10 text-yellow-600 rounded-md text-sm font-medium mt-2">
                      ⚠ Fabryka wstrzymana. Koszty wynagrodzeń zredukowane do 15%.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div >

      {/* Ekspansja Terytorialna */}
      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Ekspansja Terytorialna</h3>
        <div className="grid grid-cols-2 gap-4">
          <Card className={`border-dashed ${isAuctionLimitReached ? "opacity-50 grayscale border-border bg-muted/50" : (auction?.isOpen ? "border-accent bg-accent/5" : "border-border bg-card/50")}`}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full gap-4">
              <div className={`p-3 rounded-full ${isAuctionLimitReached ? "bg-muted" : (auction?.isOpen ? "bg-accent/20" : "bg-muted")}`}>
                <Gavel className={`w-8 h-8 ${isAuctionLimitReached ? "text-muted-foreground" : (auction?.isOpen ? "text-accent" : "text-muted-foreground")}`} />
              </div>
              <div>
                <h4 className="font-bold text-lg">
                  {isAuctionLimitReached
                    ? "Limit Osiągnięty (5/5)"
                    : (auction?.isOpen
                      ? `Przetarg Aktywny! (${(auctionAttempts || 0) + 1}/5)`
                      : `Brak Przetargów (${(auctionAttempts || 0)}/5)`
                    )
                  }
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isAuctionLimitReached ? "Wyczerpano pulę miejskich przetargów." : (auction?.isOpen ? "Miasto sprzedaje ziemię. Złóż ofertę!" : "Kolejny przetarg zgodnie z harmonogramem.")}
                </p>
              </div>
              {!isAuctionLimitReached && auction?.isOpen && (
                <Button className="w-full" onClick={() => useGameStore.getState().openAuctionModal()}>
                  <span className="text-xs text-accent font-bold animate-pulse">Sprawdź okno przetargu!</span>
                </Button>
              )}
              {isAuctionLimitReached && (
                <div className="text-xs font-bold text-muted-foreground border border-border px-2 py-1 rounded">
                  Zakończono
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <HardHat className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Kup od Dewelopera</h4>
                <p className="text-sm text-muted-foreground">
                  Natychmiastowy zakup ziemi (5x drożej)
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={buyLandFromDev}
                disabled={money < devPrice || isFactoryLimitReached}
              >
                {isFactoryLimitReached ? "Limit Fabryk!" : `Kup (${formatMoney(devPrice)})`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
