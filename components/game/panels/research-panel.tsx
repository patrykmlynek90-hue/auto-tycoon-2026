"use client"

import { useGameStore } from "@/lib/game-store"
import { carClasses, CarClassId } from "@/data/carClasses" // Import data
import { engineOptions, chassisOptions, bodyOptions, interiorOptions, CarPart } from "@/data/parts" // Import parts
import { techTree } from "@/data/techTree"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConical,
  Cog,
  Frame,
  Palette,
  ShieldCheck,
  Cpu,
  Lock,
  CheckCircle2,
  Clock,
  Car,
  Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"




// Helper for Part Section
const PartCategorySection = ({
  title,
  parts,
  unlockedParts,
  currentYear,
  money,
  onUnlock
}: {
  title: string,
  parts: CarPart[],
  unlockedParts: string[],
  currentYear: number,
  money: number,
  onUnlock: (id: string) => void
}) => (
  <div className="space-y-3">
    <h3 className="text-md font-semibold text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-1">{title}</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {parts.sort((a, b) => a.unlockYear - b.unlockYear).map(part => {
        const isResearched = unlockedParts.includes(part.value)
        const isAvailable = currentYear >= part.unlockYear
        const canAfford = money >= part.researchCost

        return (
          <div
            key={part.value}
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between h-full transition-all relative overflow-hidden",
              isResearched
                ? "bg-primary/5 border-primary/50"
                : isAvailable
                  ? "bg-secondary/40 border-border hover:border-primary/30"
                  : "bg-secondary/20 border-border opacity-50 grayscale"
            )}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-[10px] h-5 px-1">
                  {part.unlockYear}
                </Badge>
                {isResearched && <CheckCircle2 className="w-4 h-4 text-primary" />}
                {!isResearched && !isAvailable && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <h4 className="font-semibold text-sm leading-tight text-foreground">{part.label}</h4>

              {/* Mini Stats */}
              <div className="text-[10px] text-muted-foreground space-y-0.5 pt-1">
                {part.stats?.power && <div>Moc: {part.stats.power} KM</div>}
                {part.stats?.weight && <div>Waga: {part.stats.weight} kg</div>}
                {part.stats?.style && <div>Styl: {part.stats.style}</div>}
                {part.stats?.safety && <div>Bezp: {part.stats.safety}</div>}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-border/50">
              {isResearched ? (
                <div className="text-center font-bold text-primary text-[10px] uppercase tracking-wide">
                  Opracowane
                </div>
              ) : isAvailable ? (
                <div className="space-y-1">
                  {part.researchCost > 0 ? (
                    <>
                      <div className="text-center font-bold text-foreground text-xs">
                        {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(part.researchCost)}
                      </div>
                      <Button
                        className="w-full h-7 text-xs"
                        variant={canAfford ? "default" : "outline"}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => onUnlock(part.value)}
                      >
                        Badaj
                      </Button>
                    </>
                  ) : (
                    // Fallback for 0 cost (should be auto unlocked but just in case)
                    <div className="text-center font-bold text-primary text-[10px] uppercase">Darmowe</div>
                  )}
                </div>
              ) : (
                <div className="text-center text-[10px] text-muted-foreground font-medium py-1">
                  Dostępne w {part.unlockYear}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export function ResearchPanel() {
  const { money, gameDate, unlockedClasses, unlockedParts, unlockedFeatures, unlockClass, unlockPart, unlockTech } = useGameStore()

  const formatMoney = useCurrencyFormatter()

  const currentYear = gameDate.getFullYear()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Centrum Badań</h2>
          <p className="text-muted-foreground">
            Odkrywaj nowe technologie dla swoich pojazdów
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-research/10 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-research" />
          </div>
        </div>
      </div>





      {/* Car Classes Research */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            Projekty Pojazdów (Klasy)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(carClasses)
              .sort((a, b) => a.unlockYear - b.unlockYear)
              .map((cls) => {
                const isResearched = unlockedClasses.includes(cls.id)
                const isAvailable = currentYear >= cls.unlockYear
                const canAfford = money >= cls.researchCost

                // Filter out Class A if cost is 0 and it's default? No, show it as unlocked checkmark

                return (
                  <div
                    key={cls.id}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between h-full transition-all relative overflow-hidden",
                      isResearched
                        ? "bg-primary/5 border-primary/50"
                        : isAvailable
                          ? "bg-secondary/40 border-border hover:border-primary/30"
                          : "bg-secondary/20 border-border opacity-50 grayscale"
                    )}
                  >
                    {/* Background Image / Icon Placeholder */}
                    {/* <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                       <Car className="w-12 h-12" />
                     </div> */}

                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge variant={isResearched ? "default" : "secondary"}>
                          {cls.unlockYear}
                        </Badge>
                        {isResearched && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        {!isResearched && !isAvailable && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>

                      <div>
                        <h4 className="font-bold text-lg leading-tight">{cls.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={cls.description}>
                          {cls.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      {isResearched ? (
                        <div className="text-center font-bold text-primary text-sm uppercase tracking-wide">
                          Technologia Gotowa
                        </div>
                      ) : isAvailable ? (
                        <div className="space-y-2">
                          <div className="text-center font-bold text-foreground">
                            {formatMoney(cls.researchCost)}
                          </div>
                          <Button
                            className="w-full"
                            variant={canAfford ? "default" : "outline"}
                            size="sm"
                            disabled={!canAfford}
                            onClick={() => unlockClass(cls.id)}
                          >
                            {canAfford ? "Kup Projekt" : "Brak Środków"}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground font-medium py-2">
                          Dostępne w {cls.unlockYear}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Car Components Research */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Wrench className="w-5 h-5 text-accent" />
            Komponenty (Części)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <PartCategorySection title="Silniki" parts={engineOptions} unlockedParts={unlockedParts} currentYear={currentYear} money={money} onUnlock={unlockPart} />
          <PartCategorySection title="Podwozia" parts={chassisOptions} unlockedParts={unlockedParts} currentYear={currentYear} money={money} onUnlock={unlockPart} />
          <PartCategorySection title="Karoserie" parts={bodyOptions} unlockedParts={unlockedParts} currentYear={currentYear} money={money} onUnlock={unlockPart} />
          <PartCategorySection title="Wnętrza" parts={interiorOptions} unlockedParts={unlockedParts} currentYear={currentYear} money={money} onUnlock={unlockPart} />
        </CardContent>
      </Card>
    </div>
  )
}
