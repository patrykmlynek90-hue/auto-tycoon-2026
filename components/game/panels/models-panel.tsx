"use client"

import { useState, useMemo, useEffect } from "react"
import { useGameStore, applyInflation } from "@/lib/game-store"
import { getAssetPath } from "@/lib/asset-path"
import { CarClassId, carClasses, CarClassDefinition } from "@/data/carClasses"
import { engineOptions, chassisOptions, bodyOptions, interiorOptions, CarPart } from "@/data/parts"
import { calculateSynergy } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  AlertTriangle,
  Plus,
  Car,
  TrendingUp,
  TrendingDown,
  Trash2,
  ShieldCheck,
  Zap,
  Scale,
  Star as StarIcon, // Renamed to avoid confusion if needed
  Trophy
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"

export function ModelsPanel() {
  const gameDate = useGameStore(state => state.gameDate)
  const gameYear = gameDate.getFullYear()
  const createCarModel = useGameStore(state => state.createCarModel)
  const updateCarModel = useGameStore(state => state.updateCarModel)
  const carModels = useGameStore(state => state.carModels)
  const factories = useGameStore(state => state.factories) // Added to read inventory
  const unlockedClasses = useGameStore(state => state.unlockedClasses)
  const unlockedParts = useGameStore(state => state.unlockedParts)
  const deleteCarModel = useGameStore(state => state.deleteCarModel)
  const economicMultiplier = useGameStore(state => state.economicMultiplier)

  const payForRetrofit = useGameStore(state => state.payForRetrofit)
  const currentMoney = useGameStore(state => state.money)

  const formatMoney = useCurrencyFormatter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Custom Retrofit Modal State
  const [showRetrofitConfirm, setShowRetrofitConfirm] = useState(false)
  const [retrofitCostData, setRetrofitCostData] = useState({ cost: 0, count: 0, canAfford: true, newName: "" })

  // Calculate Stock for currently edited model
  const currentStockCount = useMemo(() => {
    if (!editingId) return 0
    return factories
      .filter(f => f.producingModelId === editingId)
      .reduce((sum, f) => sum + f.inventory, 0)
  }, [factories, editingId])

  // Helper to check if a part is unlocked based on Tech OR Year AND Research
  const isPartUnlocked = (part: CarPart) => {
    // 1. Must be researched (in unlockedParts) - except for free/default ones if logic requires
    if (!unlockedParts.includes(part.value)) return false

    // 2. Year check (redundant if unlockPart handles it, but good for safety)
    if (part.unlockYear && part.unlockYear > gameYear) return false

    return true
  }

  const [newModel, setNewModel] = useState({
    name: "",
    class: "A" as CarClassId,
    price: 1150,
    engine: "small-i4",
    chassis: "frame",
    body: "small",
    interior: "spartan" // Default interior
  })

  // When opening dialog for Edit, populate form
  const handleEdit = (model: any) => {
    // Correct Reverse Lookup by Label
    const engineId = engineOptions.find(e => e.label === model.engine)?.value || "small-i4"
    const chassisId = chassisOptions.find(c => c.label === model.chassis)?.value || "frame"
    const bodyId = bodyOptions.find(c => c.label === model.body)?.value || "small"

    // Reverse lookup interior using interiorQuality heuristic
    // Since we don't store interior label/ID directly in old models (potentially), we guess based on quality score
    // If it was a new model, it might be fine.
    // Let's assume most precise match based on style/quality
    const interiorId = interiorOptions.find(i => (i.stats?.style || 0) === (model.interiorQuality > 10 ? model.interiorQuality : 5))?.value || "spartan"

    setNewModel({
      name: model.name,
      class: model.class,
      price: model.price,
      engine: engineId,
      chassis: chassisId,
      body: bodyId,
      interior: interiorId
    })
    setEditingId(model.id)
    setIsDialogOpen(true)
  }

  const handleOpenNew = () => {
    setEditingId(null)
    setNewModel({
      name: "",
      class: "A",
      price: Math.floor((applyInflation(carClasses['A'].minPrice, carClasses['A'].inflationSensitivity || 1.0, economicMultiplier) + applyInflation(carClasses['A'].maxPrice, carClasses['A'].inflationSensitivity || 1.0, economicMultiplier)) / 2),
      engine: "small-i4",
      chassis: "frame",
      body: "small",
      interior: "spartan"
    })
    setIsDialogOpen(true)
  }

  // Restrictions Logic - REPLACED BY SYNERGY SCORE
  // No explicit hard restrictions, but we calculate score to guide user.

  // 1. Prepare All Parts for SOTA check
  const allParts = useMemo(() => [
    ...engineOptions,
    ...chassisOptions,
    ...bodyOptions,
    ...interiorOptions
  ], [])

  // 2. Real-time Synergy Calculation
  const synergyResult = useMemo(() => {
    const selectedClass = carClasses[newModel.class]
    if (!selectedClass) return { score: 0, feedback: [] }

    const pEngine = engineOptions.find(e => e.value === newModel.engine)
    const pChassis = chassisOptions.find(c => c.value === newModel.chassis)
    const pBody = bodyOptions.find(b => b.value === newModel.body)
    const pInterior = interiorOptions.find(i => i.value === newModel.interior)

    // Filter out undefined parts (shouldn't happen ideally but just in case)
    const currentParts = [pEngine, pChassis, pBody, pInterior].filter((p): p is CarPart => !!p)

    return calculateSynergy(selectedClass, currentParts, gameYear, allParts)
  }, [newModel.class, newModel.engine, newModel.chassis, newModel.body, newModel.interior, gameYear, allParts])

  // Helper to ensure correct image path, effectively handling specific casing rules if needed
  const getCarClassImagePath = (classId: string) => {
    // Explicitly keep RS uppercase as requested
    if (classId === 'RS') return getAssetPath('/images/cars/class-RS.png')
    return getAssetPath(`/images/cars/class-${classId}.png`)
  }

  // Helper to get stats for a part ID
  const getPartStats = (partId: string, options: any[]) => {
    const part = options.find(p => p.value === partId)
    return part?.stats || {}
  }

  const selectedClass = carClasses[newModel.class]
  const adjustedHardCap = applyInflation(selectedClass.hardCap, selectedClass.inflationSensitivity || 1.0, economicMultiplier)

  // Calculate Production Cost (Base 1950s Value)
  const baseProductionCost = useMemo(() => {
    let partsCost = 0 // Materials cost
    const engine = engineOptions.find(e => e.value === newModel.engine)
    const chassis = chassisOptions.find(c => c.value === newModel.chassis)
    const body = bodyOptions.find(b => b.value === newModel.body)
    const interior = interiorOptions.find(i => i.value === newModel.interior)

    if (engine) partsCost += engine.cost
    if (chassis) partsCost += chassis.cost
    if (body) partsCost += body.cost
    if (interior) partsCost += interior.cost

    // FIXED: Multiplier affects LABOR only, not materials
    // Base labor cost for standard car assembly (~$3000 in 1950s)
    const BASE_LABOR_COST = 3000
    // @ts-ignore - ignoring potential missing property for now
    const classMult = selectedClass.productionCostMultiplier || 1.0
    const laborCost = BASE_LABOR_COST * classMult

    // Total = Materials + Labor (scaled by complexity)
    return Math.round(partsCost + laborCost)
  }, [newModel, selectedClass])

  // Calculate Weighted Sensitivity for Display
  const currentSensitivity = useMemo(() => {
    const pEngine = engineOptions.find(e => e.value === newModel.engine)
    const pChassis = chassisOptions.find(c => c.value === newModel.chassis)
    const pBody = bodyOptions.find(b => b.value === newModel.body)
    const pInterior = interiorOptions.find(i => i.value === newModel.interior)

    let totalWeightCost = 0
    let weightedSensSum = 0
    const addDisplaySens = (part: any) => {
      if (!part) return
      const cost = part.cost || 0
      const sens = part.inflationSensitivity || 1.0
      totalWeightCost += cost
      weightedSensSum += (cost * sens)
    }
    addDisplaySens(pEngine)
    addDisplaySens(pChassis)
    addDisplaySens(pBody)
    addDisplaySens(pInterior)
    return totalWeightCost > 0 ? (weightedSensSum / totalWeightCost) : 1.0
  }, [newModel])

  // Real-time Aggregated Stats
  const currentStats = useMemo(() => {
    const pEngine = engineOptions.find(e => e.value === newModel.engine);
    const pChassis = chassisOptions.find(c => c.value === newModel.chassis);
    const pBody = bodyOptions.find(b => b.value === newModel.body);
    const pInterior = interiorOptions.find(i => i.value === newModel.interior);

    const power = (pEngine?.stats?.power || 0);
    const weight = (pEngine?.stats?.weight || 0) + (pChassis?.stats?.weight || 0) + (pBody?.stats?.weight || 0) + (pInterior?.stats?.weight || 0);
    const safety = (pChassis?.stats?.safety || 0) + (pBody?.stats?.safety || 0);
    const style = (pBody?.stats?.style || 0) + (pInterior?.stats?.style || 0);

    return { power, weight, safety, style };
  }, [newModel]);

  // Display Cost (Inflated) for UI Feedback - using Tiered Inflation
  const displayProductionCost = applyInflation(baseProductionCost, currentSensitivity, economicMultiplier)

  const margin = newModel.price - displayProductionCost
  const isProfitable = margin > 0

  const handleCreateOrUpdate = () => {
    if (!newModel.name) return

    // RETROFIT COST LOGIC
    if (editingId) {
      const oldModel = carModels.find(m => m.id === editingId)
      if (oldModel && currentStockCount > 0) {
        const oldUnitCost = oldModel.productionCost // Base cost before inflation
        const newUnitCost = baseProductionCost // Base cost from new calculation
        const costDiff = newUnitCost - oldUnitCost

        // Scenario B: Upgrade Cost
        if (costDiff > 0) {
          const totalUpgradeCost = costDiff * currentStockCount
          setRetrofitCostData({
            cost: totalUpgradeCost,
            count: currentStockCount,
            canAfford: currentMoney >= totalUpgradeCost,
            newName: newModel.name
          })
          setShowRetrofitConfirm(true)
          return

          /*
          // Check Budget
          if (currentMoney < totalUpgradeCost) {
            alert(`Nie stać Cię na modernizację floty!\n\nKoszt modernizacji: ${formatMoney(totalUpgradeCost)}\nTwój budżet: ${formatMoney(currentMoney)}`)
            return // Block Save
          }

          // Confirmation
          const confirmed = window.confirm(
            `UWAGA: Posiadasz ${currentStockCount} sztuk tego modelu w magazynie.\n\n` +
            `Zmiana części na droższe wymaga modernizacji wyprodukowanych aut.\n` +
            `Koszt operacji: ${formatMoney(totalUpgradeCost)}\n\n` +
            `Czy chcesz zapłacić i zaktualizować model?`
          )

          if (!confirmed) return // Block Save

          // Deduct Money
          payForRetrofit(totalUpgradeCost, newModel.name, currentStockCount)
          */
        }
        // Scenario C: Downgrade (costDiff < 0) -> Free upgrade (no refund), proceed normally.
      }
    }

    finalizeSave()
  }

  const finalizeSave = () => {
    // Calculate final stats (use real-time calculation)
    const interior = interiorOptions.find(i => i.value === newModel.interior)

    // Weighted Inflation Sensitivity Calculation
    // Sum(Cost * Sensitivity) / TotalCost
    const pEngine = engineOptions.find(e => e.value === newModel.engine)
    // Redundant finds removed (pChassis, etc) as we can find them effectively or just reuse logic

    // REDUNDANT FIND LOGIC REMOVED FROM HERE, using currentStats
    const baseStats = { ...currentStats, reliability: 80 }

    // Weighted Inflation Sensitivity Calculation
    // Sum(Cost * Sensitivity) / TotalCost
    // ... kept same logic ...
    const pChassis = chassisOptions.find(c => c.value === newModel.chassis)
    const pBody = bodyOptions.find(b => b.value === newModel.body)
    const pInterior = interiorOptions.find(i => i.value === newModel.interior)
    // ...
    // Note: I will keep the sensitivity logic below as is, just splicing the stats part.

    let totalWeightCost = 0
    let weightedSensSum = 0

    const addPartSens = (part: any) => {
      if (!part) return
      const cost = part.cost || 0
      const sens = part.inflationSensitivity || 1.0
      totalWeightCost += cost
      weightedSensSum += (cost * sens)
    }

    addPartSens(pEngine)
    addPartSens(pChassis)
    addPartSens(pBody)
    addPartSens(pInterior)

    const finalSensitivity = totalWeightCost > 0 ? (weightedSensSum / totalWeightCost) : 1.0

    const modelData = {
      name: newModel.name,
      class: newModel.class,
      price: newModel.price,
      productionCost: baseProductionCost,
      stats: baseStats,
      popularity: 50, // Initial base
      interiorQuality: interior?.stats?.style || 10,
      interiorCost: interior?.cost || 100,
      engine: engineOptions.find(e => e.value === newModel.engine)?.label || "Unknown",
      chassis: chassisOptions.find(c => c.value === newModel.chassis)?.label || "Unknown",
      body: bodyOptions.find(b => b.value === newModel.body)?.label || "Unknown",
      inflationSensitivity: parseFloat(finalSensitivity.toFixed(2)),
      synergyScore: synergyResult.score,
      // Initialize Annual Stats
      salesThisYear: 0,
      revenueThisYear: 0,
      profitThisYear: 0,
      cogsThisYear: 0,
      lastYearStats: { sales: 0, revenue: 0, profit: 0, cogs: 0 }
    }

    if (editingId) {
      updateCarModel(editingId, modelData)
    } else {
      createCarModel(modelData)
    }

    setIsDialogOpen(false)
    setEditingId(null)
    setShowRetrofitConfirm(false)
  }

  const confirmRetrofit = () => {
    // SAFETY CHECK: Verify budget AGAIN before executing payment
    // Do not rely solely on UI - check one more time in the logic
    if (!retrofitCostData.canAfford) {
      console.error('[RETROFIT] Safety check failed: Insufficient funds. Payment blocked.')
      console.error(`[RETROFIT] Cost: ${retrofitCostData.cost}, Budget: ${currentMoney}`)
      setShowRetrofitConfirm(false)
      return // Block payment execution
    }

    if (retrofitCostData.canAfford && currentMoney >= retrofitCostData.cost) {
      console.log(`[RETROFIT] Payment approved: Cost ${retrofitCostData.cost}, Budget ${currentMoney}`)
      payForRetrofit(retrofitCostData.cost, retrofitCostData.newName, retrofitCostData.count)
      finalizeSave()
    } else {
      // Double-check failed - should never happen if UI is correct
      console.error('[RETROFIT] Double-check failed: Budget insufficient despite canAfford flag!')
      setShowRetrofitConfirm(false)
    }
  }

  // Helper to standardise labels: Name (Stats) [$Price]
  const renderOptionLabel = (opt: CarPart, type: 'engine' | 'chassis' | 'body' | 'interior') => {
    const yearLabel = opt.tags?.includes('timeless') ? '∞' : opt.unlockYear
    return `${opt.label} (${yearLabel}) - ${formatMoney(opt.cost)}`
  }

  // Renders JUST the name for the trigger button
  const renderShortLabel = (value: string, options: CarPart[]) => {
    const opt = options.find(o => o.value === value)
    return opt ? opt.label : value
  }

  const totalSales = carModels.reduce((sum, m) => sum + m.totalSales, 0)
  const totalRevenue = carModels.reduce((sum, m) => sum + m.totalSales * m.price, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Modele Samochodów</h2>
          <p className="text-muted-foreground">Projektuj i zarządzaj swoimi pojazdami. ({gameYear})</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="lg" onClick={handleOpenNew}>
              <Plus className="w-5 h-5" />
              Nowy Model
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-border sm:max-w-[95%] w-[95vw] p-0 overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="p-6 pb-2 border-b border-border bg-secondary/10">
              <DialogTitle className="flex items-center justify-between text-2xl text-foreground w-full">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  {editingId ? "Edycja Modelu" : "Projektowanie Nowego Modelu"}
                </div>
                {editingId && currentStockCount > 0 && (
                  <div className="text-base font-medium text-foreground bg-background/50 px-3 py-1 rounded-md border border-border">
                    W magazynie: <span className="text-primary font-bold">{currentStockCount} szt.</span>
                  </div>
                )}
              </DialogTitle>
              <div className="sr-only">
                {/* Accessibility Description */}
                <DialogDescription>
                  Formularz do tworzenia lub edycji modelu samochodu. Wybierz klasę, komponenty i cenę.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-8 overflow-y-auto w-full space-y-8 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">

              {/* Top Section: Visual + Core Info */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image Placeholder */}
                <div className="flex-shrink-0">
                  <Label className="text-foreground mb-2 block">Wizualizacja</Label>
                  <div className="w-[240px] h-[180px] rounded-xl bg-transparent border-2 border-border flex items-center justify-center overflow-hidden relative group">
                    {/* Dynamic Image */}
                    <img
                      src={getCarClassImagePath(newModel.class)}
                      alt={`Wizualizacja klasy ${newModel.class}`}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110 invert opacity-90"
                    />
                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                  </div>
                </div>

                {/* Middle: Basic Inputs */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-foreground text-lg">Nazwa Modelu</Label>
                      <Input
                        placeholder="np. Turbo Sport 300"
                        value={newModel.name}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                        className="bg-input border-border text-foreground h-12 text-lg w-full md:w-3/4"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground text-lg">Klasa Pojazdu</Label>
                      <Select
                        value={newModel.class}
                        onValueChange={(value) => {
                          const cls = carClasses[value as CarClassId]
                          const sens = cls.inflationSensitivity || 1.0
                          const min = applyInflation(cls.minPrice, sens, economicMultiplier)
                          const max = applyInflation(cls.maxPrice, sens, economicMultiplier)
                          const defaultPrice = Math.floor((min + max) / 2)

                          // Auto-select valid body
                          let newBody = newModel.body
                          const required = cls.requiredBodyTypes
                          if (required && required.length > 0) {
                            // Check if current body is valid
                            if (!required.includes(newBody)) {
                              // Find first unlocked valid body
                              const firstValid = bodyOptions.find(b => required.includes(b.value) && isPartUnlocked(b))
                              newBody = firstValid ? firstValid.value : "missing"
                            }
                          }

                          setNewModel({ ...newModel, class: value as CarClassId, price: defaultPrice, body: newBody })
                        }}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground h-12">
                          <SelectValue placeholder="Wybierz klasę" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border border-zinc-700 z-50">
                          {Object.values(carClasses)
                            .filter(cls => unlockedClasses.includes(cls.id))
                            .sort((a, b) => (a.unlockYear || 0) - (b.unlockYear || 0))
                            .map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1 flex justify-between">
                        <span>{selectedClass.description}</span>
                        <span>Limit: <span className="text-destructive font-bold">{formatMoney(adjustedHardCap)}</span></span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Technical Stats Panel */}
                  <div className="bg-transparent border border-zinc-800 rounded-xl p-5 space-y-4">
                    <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">Parametry Techniczne Modelu</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Moc Silnika:
                        </span>
                        <span className="text-xl font-bold text-foreground">{currentStats.power} KM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Scale className="w-4 h-4" /> Masa Całkowita:
                        </span>
                        <span className="text-xl font-bold text-foreground">{currentStats.weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <ShieldCheck className={`w-4 h-4 ${currentStats.safety >= 50 ? "text-green-500" : ""}`} /> Bezpieczeństwo:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">{currentStats.safety} pkt</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Sparkles className={`w-4 h-4 ${currentStats.style >= 80 ? "text-yellow-500" : ""}`} /> Stylistyka:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">{currentStats.style} pkt</span>
                        </div>
                      </div>

                      {/* SYNERGY SCORE DISPLAY */}
                      {/* SYNERGY SCORE DISPLAY */}
                      <div className="pt-2 border-t border-border mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2" title="Ocena dopasowania części do klasy">
                            <TrendingUp className={`w-4 h-4 ${synergyResult.score >= 100 ? "text-green-500" : "text-yellow-500"}`} />
                            Synergia:
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Star Rating Logic */}
                            {(() => {
                              let stars = 1;
                              const s = synergyResult.score;
                              if (s >= 140) stars = 7;
                              else if (s >= 120) stars = 6;
                              else if (s >= 100) stars = 5;
                              else if (s >= 80) stars = 4;
                              else if (s >= 60) stars = 3;
                              else if (s >= 30) stars = 2;

                              const isPurple = s >= 110;
                              const activeColorClass = isPurple ? "text-purple-500 fill-purple-500" : "text-yellow-500 fill-yellow-500";

                              return Array.from({ length: 7 }).map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${i < stars ? activeColorClass : "text-muted/20"}`}
                                />
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-secondary/30 rounded-full overflow-hidden relative border border-secondary/50">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${synergyResult.score >= 110 ? "bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse" :
                              synergyResult.score >= 91 ? "bg-green-500" :
                                synergyResult.score >= 51 ? "bg-yellow-500" :
                                  "bg-destructive"
                              }`}
                            style={{ width: `${Math.min(100, (synergyResult.score / 150) * 100)}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                            {synergyResult.score}/150
                          </div>
                        </div>
                      </div>

                      {/* SYNERGY FEEDBACK (Warnings) */}
                      {synergyResult.feedback.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-2 mt-2 text-xs text-destructive">
                          <p className="font-semibold mb-1">Uwagi konstrukcyjne:</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {synergyResult.feedback.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Components Grid - Responsive: Stack on mobile, 4 cols on large */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground pb-2 border-b border-border">Komponenty Mechaniczne</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Engine */}
                  <div className="space-y-2 min-w-0">
                    <Label className="text-foreground font-medium">Silnik</Label>
                    <Select
                      value={newModel.engine}
                      onValueChange={(value) => setNewModel({ ...newModel, engine: value })}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground h-11 w-full [&>span]:truncate">
                        {/* Show ONLY the name in the closed box */}
                        <span className="truncate">{renderShortLabel(newModel.engine, engineOptions)}</span>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border border-zinc-700 z-50 max-h-[300px]">
                        {engineOptions
                          .filter(opt => isPartUnlocked(opt))
                          // REMOVED RESTRICTIONS
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                              {renderOptionLabel(opt, 'engine')}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chassis */}
                  <div className="space-y-2 min-w-0">
                    <Label className="text-foreground font-medium">Podwozie</Label>
                    <Select
                      value={newModel.chassis}
                      onValueChange={(value) => setNewModel({ ...newModel, chassis: value })}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground h-11 w-full [&>span]:truncate">
                        <span className="truncate">{renderShortLabel(newModel.chassis, chassisOptions)}</span>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border border-zinc-700 z-50 max-h-[300px]">
                        {chassisOptions
                          .filter(opt => isPartUnlocked(opt))
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                              {renderOptionLabel(opt, 'chassis')}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body */}
                  <div className="space-y-2 min-w-0">
                    <Label className="text-foreground font-medium">Karoseria</Label>
                    <Select
                      value={newModel.body}
                      onValueChange={(value) => setNewModel({ ...newModel, body: value })}
                    >
                      <SelectTrigger className={`border-border h-11 w-full [&>span]:truncate ${newModel.body === "missing" ? "bg-destructive/10 text-destructive border-destructive" : "bg-input text-foreground"}`}>
                        <span className="truncate">
                          {newModel.body === "missing" ? "⚠️ Brak Wymaganego Nadwozia" : renderShortLabel(newModel.body, bodyOptions)}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border border-zinc-700 z-50 max-h-[300px]">
                        {/* If missing, show a disabled placeholder header */}
                        {newModel.body === "missing" && (
                          <SelectItem value="missing" disabled className="text-destructive font-bold">
                            ⚠️ Brak dostępnego nadwozia
                          </SelectItem>
                        )}
                        {bodyOptions
                          .filter(opt => isPartUnlocked(opt))
                          // BODY LOCK (Hard Requirement)
                          .filter(opt => {
                            // If class has required body types, ONLY show those.
                            if (selectedClass.requiredBodyTypes && selectedClass.requiredBodyTypes.length > 0) {
                              return selectedClass.requiredBodyTypes.includes(opt.value);
                            }
                            // Otherwise show all (or filter by tags if preferred, but user only asked for Hard Lock)
                            return true;
                          })
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                              {renderOptionLabel(opt, 'body')}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Interior */}
                  <div className="space-y-2 min-w-0">
                    <Label className="text-foreground font-medium">Wnętrze</Label>
                    <Select
                      value={newModel.interior}
                      onValueChange={(value) => setNewModel({ ...newModel, interior: value })}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground h-11 w-full [&>span]:truncate">
                        <span className="truncate">{renderShortLabel(newModel.interior, interiorOptions)}</span>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border border-zinc-700 z-50 max-h-[300px]">
                        {interiorOptions
                          .filter(opt => isPartUnlocked(opt))
                          // REMOVED RESTRICTIONS
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                              {renderOptionLabel(opt, 'interior')}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Footer: Pricing & Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pt-4 border-t border-border">
                <div className="space-y-4">
                  <Label className="text-foreground text-lg">Cena Sprzedaży</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="number"
                      value={newModel.price}
                      onChange={(e) => {
                        let val = parseInt(e.target.value) || 0
                        if (val < 1 && e.target.value !== "") val = 1
                        setNewModel({ ...newModel, price: val })
                      }}
                      min={1}
                      className="bg-input border-border text-foreground h-14 text-2xl font-bold w-full"
                    />
                    {newModel.price > adjustedHardCap && (
                      <p className="text-destructive font-medium flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" /> Cena powyżej Hard Cap ({formatMoney(adjustedHardCap)})!
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Preview Box */}
                <div className="bg-transparent border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Koszt Produkcji:</span>
                    <span className="font-semibold text-foreground">{formatMoney(displayProductionCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-muted-foreground">Marża (Zysk):</span>
                    <span className={`text-xl font-bold ${isProfitable ? 'text-primary' : 'text-destructive'}`}>
                      {formatMoney(margin)} ({margin > 0 ? ((margin / newModel.price) * 100).toFixed(1) : '0'}%)
                    </span>
                  </div>
                </div>

              </div>

              <div className="flex gap-4 mt-4">
                {editingId && (
                  <div className="flex-1 bg-secondary/10 p-4 rounded-lg text-sm text-muted-foreground">
                    <p>Uwaga: Zmiana komponentów (silnik, nadwozie itp.) spowoduje zresetowanie statystyk sprzedaży tego modelu ("Mark II"). Zmiana ceny nie resetuje statystyk.</p>
                  </div>
                )}
                <Button onClick={handleCreateOrUpdate} className="flex-1 h-14 text-xl font-bold" size="lg" disabled={!newModel.name || synergyResult.score === 0 || newModel.body === "missing"}>
                  {editingId ? "Zapisz Zmiany" : "Rozpocznij Produkcję Modelu"}
                </Button>
              </div>
            </div>
            {/* CUSTOM RETROFIT CONFIRMATION MODAL OVERLAY */}
            {showRetrofitConfirm && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg max-w-md w-full shadow-2xl space-y-4">
                  {/* Header */}
                  <h3 className={`text-xl font-bold ${retrofitCostData.canAfford ? "text-white" : "text-destructive"}`}>
                    {retrofitCostData.canAfford ? "Potwierdzenie Modernizacji" : "Brak Środków!"}
                  </h3>

                  {/* Body */}
                  <div className="space-y-2 text-zinc-300">
                    <p>W magazynie posiadasz: <span className="font-bold text-white">{retrofitCostData.count} szt.</span> tego modelu.</p>
                    <p>Wprowadzone zmiany wymagają wymiany części w wyprodukowanych autach.</p>

                    <div className="pt-2 border-t border-zinc-800 mt-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Koszt operacji:</span>
                        <span className="text-destructive font-bold text-lg">
                          -{formatMoney(retrofitCostData.cost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Twój budżet:</span>
                        <span className={retrofitCostData.canAfford ? "text-green-500" : "text-destructive font-bold"}>
                          {formatMoney(currentMoney)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Split Buttons by Scenario */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    {retrofitCostData.canAfford ? (
                      <>
                        {/* Scenario A: Has Funds - Show Cancel + Confirm */}
                        <Button
                          variant="ghost"
                          className="bg-zinc-700 hover:bg-zinc-600 text-white"
                          onClick={() => setShowRetrofitConfirm(false)}
                        >
                          Anuluj
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          onClick={confirmRetrofit}
                        >
                          Zatwierdź i Zapłać (-{formatMoney(retrofitCostData.cost)})
                        </Button>
                      </>
                    ) : (
                      /* Scenario B: No Funds - Only Close Button (Red, No Confirm) */
                      <Button
                        className="bg-red-900/50 border border-red-500 text-red-200 hover:bg-red-900"
                        onClick={() => setShowRetrofitConfirm(false)}
                      >
                        Zamknij
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Łącznie Modeli</p>
            <p className="text-2xl font-bold text-foreground">{carModels.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Łączna Sprzedaż</p>
            <p className="text-2xl font-bold text-foreground">{totalSales} szt.</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Przychód Całkowity</p>
            <p className="text-2xl font-bold text-primary">{formatMoney(totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {carModels.map((model) => {
          const currentProductionCost = applyInflation(model.productionCost, model.inflationSensitivity || 1.0, economicMultiplier)
          const margin = model.price - currentProductionCost
          const marginPrice = model.price > 0 ? ((margin / model.price) * 100).toFixed(0) : "0"

          // DYNAMIC SYNERGY CALCULATION (Display Logic Only)
          const pClass = carClasses[model.class];
          // Reverse Lookup for Parts (Model stores Labels, Parts use Values/IDs)
          const pEngine = engineOptions.find(e => e.label === model.engine) || engineOptions[0];
          const pChassis = chassisOptions.find(c => c.label === model.chassis) || chassisOptions[0];
          const pBody = bodyOptions.find(b => b.label === model.body) || bodyOptions[0];
          // Interior heuristic (Quality Match)
          // We look for exact quality match first, then fallback to closest or standard
          const pInterior = interiorOptions.find(i => (i.stats?.style || 0) === model.interiorQuality) || interiorOptions[1];

          const currentParts = [pEngine, pChassis, pBody, pInterior].filter(p => !!p);
          // Recalculate based on Current Game Year
          const dynamicSynergy = calculateSynergy(pClass, currentParts, gameYear, allParts);
          const currentScore = dynamicSynergy.score;

          return (
            <Card key={model.id} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Background Image (Car Only - Text Cropped) */}
              <div
                className="absolute left-1/2 ml-6 top-4 -translate-x-1/2 w-[240px] h-[140px] z-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `url('${getCarClassImagePath(model.class)}')`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'invert(1)',
                  // Sharp cut at 72% to hide text but keep wheels (estimated gap)
                  maskImage: 'linear-gradient(to bottom, black 72%, transparent 72%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 72%, transparent 72%)'
                }}
              />

              <div className="relative z-10 p-6 space-y-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl text-foreground">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">{carClasses[model.class]?.name || model.class}</p>
                    <p className="text-xs text-muted-foreground">Od {model.yearIntroduced} roku</p>
                  </div>
                  <div className="text-right flex gap-1">
                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(model)}
                    >
                      <Sparkles className="w-4 h-4" /> {/* Reuse Sparkles or Edit2 */}
                    </Button>
                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usuń model {model.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Zatrzymasz produkcję i sprzedaż tego modelu. Tej operacji nie można cofnąć.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCarModel(model.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* VISUALIZATION: SYNERGY & SCORE */}
                {/* Inserted between Header and Price/Margin as requested */}
                <div className="space-y-1">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Synergia
                    </span>
                    <div className="flex gap-0.5">
                      {(() => {
                        const score = currentScore; // Using Dynamic Score
                        let stars = 1;
                        if (score >= 140) stars = 7;
                        else if (score >= 120) stars = 6;
                        else if (score >= 100) stars = 5;
                        else if (score >= 80) stars = 4;
                        else if (score >= 60) stars = 3;
                        else if (score >= 30) stars = 2;

                        const isPurple = score >= 110;
                        const activeColorClass = isPurple ? "text-purple-500 fill-purple-500" : "text-yellow-500 fill-yellow-500";

                        return Array.from({ length: 7 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${i < stars ? activeColorClass : "text-muted/20"}`}
                          />
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative border border-border/50">
                    {(() => {
                      const score = currentScore; // Using Dynamic Score
                      let barColor = "bg-destructive";
                      if (score >= 110) barColor = "bg-purple-500 shadow-[0_0_10px_#a855f7]";
                      else if (score >= 91) barColor = "bg-green-500";
                      else if (score >= 51) barColor = "bg-yellow-500";

                      return (
                        <>
                          <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.min(100, (score / 150) * 100)}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black z-10">
                            {score}/150
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-border pb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Cena</p>
                    <p className="font-bold text-lg text-primary">{formatMoney(model.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Marża</p>
                    <p className={`font-medium ${margin > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {marginPrice}%
                    </p>
                  </div>
                </div>

                {model.stats && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-secondary/20 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Moc</p>
                      <p className="font-medium">{model.stats.power} KM</p>
                    </div>
                    <div className="bg-secondary/20 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Waga</p>
                      <p className="font-medium">{model.stats.weight} kg</p>
                    </div>
                    <div className="bg-secondary/20 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Styl</p>
                      <p className="font-medium">{model.stats.style}</p>
                    </div>
                    <div className="bg-secondary/20 p-2 rounded">
                      <p className="text-xs text-muted-foreground">Bezpieczeństwo</p>
                      <p className="font-medium">{model.stats.safety}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {model.salesThisMonth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{model.salesThisMonth} sprzedanych w tym miesiącu</span>
                  </div>
                  {/* Sales Breakdown */}
                  {model.salesBreakdown && (
                    <div className="flex gap-3 text-xs pl-6">
                      <span className="text-muted-foreground" title="Niższa kasa">📉 {model.salesBreakdown.Lower}</span>
                      <span className="text-muted-foreground" title="Klasa średnia">😐 {model.salesBreakdown.Middle}</span>
                      <span className="text-muted-foreground" title="Wyższa klasa">📈 {model.salesBreakdown.Higher}</span>
                    </div>
                  )}
                  {/* NEW STATS for Total Sales and Profit */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-dashed border-border/50">
                    <span>Łącznie: {model.totalSales} szt.</span>
                    <span className={model.totalProfit > 0 ? "text-green-500" : "text-muted-foreground"}>
                      Zysk: {formatMoney(model.totalProfit || 0)}
                    </span>
                  </div>

                  {/* Factory Inventory Info */}
                  <div className="pt-2 border-t border-dashed border-border/50 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Scale className="w-3 h-3" /> Magazyn Fabryczny:
                    </span>
                    <span className="font-mono font-medium text-foreground">
                      {factories.filter(f => f.producingModelId === model.id).reduce((sum, f) => sum + f.inventory, 0)} szt.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
        {carModels.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border">
            <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nie masz jeszcze żadnych modeli.</p>
            <p className="text-sm">Kliknij "Nowy Model" aby zaprojektować pierwszy samochód.</p>
          </div>
        )}
      </div>
    </div>
  )
}
