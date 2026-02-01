"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Users,
  TrendingUp,
  Home,
  Car,
  Briefcase,
  GraduationCap,
  AlertTriangle,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function CityPanel() {
  const { cityPopulation, cityGrowthRate, gameDate, dealerships, carModels, marketDemand } = useGameStore()

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(2)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return pop.toString()
  }

  // Calculate city stats based on segments
  const households = Math.floor(cityPopulation / 3)
  const monthlyDemandEstimate = Math.floor(households / 60)

  // Lower: 30%, Middle: 54%, Higher: 16%
  const lowerPop = Math.floor(cityPopulation * 0.30)
  const middlePop = Math.floor(cityPopulation * 0.54)
  const higherPop = Math.floor(cityPopulation * 0.16)

  const totalPotentialBuyers = marketDemand.lower + marketDemand.middle + marketDemand.higher

  // Generate population history
  const populationHistory = Array.from({ length: 12 }, (_, i) => {
    const monthsAgo = 11 - i
    const historicPop = Math.floor(cityPopulation / Math.pow(1 + cityGrowthRate / 12, monthsAgo))
    const date = new Date(gameDate)
    date.setMonth(date.getMonth() - monthsAgo)
    return {
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      population: historicPop,
    }
  })

  // Market stats
  const totalSalesCapacity = dealerships.reduce((sum, d) => sum + d.salesCapacity, 0)
  const marketCoverage = totalPotentialBuyers > 0
    ? Math.min(100, (totalSalesCapacity / totalPotentialBuyers) * 100)
    : 100

  const warnings: string[] = []
  if (marketCoverage < 20) warnings.push("Krytycznie niskie pokrycie rynku! Tracisz klientów.")
  else if (marketCoverage < 50) warnings.push("Niskie pokrycie rynku. Rozważ budowę nowych salonów.")

  if (marketCoverage > 95) warnings.push("Rynek nasycony w obecnych lokalizacjach.")


  const cityStats = [
    {
      title: "Klasa Niższa (30%)",
      value: formatPopulation(lowerPop),
      subValue: `Popyt: ${marketDemand.lower}`,
      icon: Users,
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
    },
    {
      title: "Klasa Średnia (54%)",
      value: formatPopulation(middlePop),
      subValue: `Popyt: ${marketDemand.middle}`,
      icon: Briefcase,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Klasa Wyższa (16%)",
      value: formatPopulation(higherPop),
      subValue: `Popyt: ${marketDemand.higher}`,
      icon: GraduationCap,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Miesięczny Popyt",
      value: formatPopulation(totalPotentialBuyers),
      subValue: `~1 auto na ${households > 0 ? (households / (totalPotentialBuyers || 1)).toFixed(0) : 60} rodzin`,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Miasto</h2>
          <p className="text-muted-foreground">
            Obserwuj rozwój miasta i potencjał rynku
            <br />
            <span className="text-xs italic text-accent">"Trudne lata powojenne - klienci kupują co jest dostępne, ale oczekują wyższych standardów w przyszłości."</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <p className="text-sm text-muted-foreground">Gospodarstwa domowe</p>
            <p className="text-xl font-bold text-foreground">
              {formatPopulation(households)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Populacja</p>
            <p className="text-2xl font-bold text-foreground">
              {formatPopulation(cityPopulation)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-info" />
          </div>
        </div>
      </div>

      {/* Market Feedback Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center">
                <Home className="w-8 h-8 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gospodarstwa domowe</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatPopulation(households)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatPopulation(cityPopulation)} mieszk.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pokrycie Popytu</p>
                <p className="text-3xl font-bold text-foreground">
                  {marketCoverage.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {dealerships.length} salonów • {totalSalesCapacity} miejsc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {cityStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    {stat.subValue && (
                      <p className="text-xs text-muted-foreground/80">{stat.subValue}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Population Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Wzrost Populacji
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={populationHistory}>
                <defs>
                  <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.20 200)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.60 0.20 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatPopulation(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.01 260)",
                    border: "1px solid oklch(0.25 0.01 260)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [formatPopulation(value), "Populacja"]}
                />
                <Area
                  type="monotone"
                  dataKey="population"
                  stroke="oklch(0.60 0.20 200)"
                  strokeWidth={2}
                  fill="url(#colorPop)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analiza Rynku
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Penetracja rynku</span>
                <span className="text-sm font-medium text-foreground">
                  {marketCoverage.toFixed(0)}%
                </span>
              </div>
              <Progress value={marketCoverage} className="h-2" />
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Potencjalni kupcy</span>
                <span className="text-sm font-medium text-foreground">
                  {formatPopulation(totalPotentialBuyers)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Twoja sprzedaż (mies.)</span>
                <span className="text-sm font-medium text-primary">
                  {dealerships.reduce((sum, d) => sum + d.salesThisMonth, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Udział w rynku</span>
                <span className="text-sm font-medium text-foreground">
                  {((dealerships.reduce((sum, d) => sum + d.salesThisMonth, 0) / Math.max(1, totalPotentialBuyers)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prognoza Rozwoju
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-1">Za 1 rok</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPopulation(Math.floor(cityPopulation * (1 + cityGrowthRate)))}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{formatPopulation(Math.floor(cityPopulation * cityGrowthRate))} mieszkańców
                </p>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-sm font-medium text-foreground mb-1">Za 5 lat</p>
                <p className="text-2xl font-bold text-accent">
                  {formatPopulation(Math.floor(cityPopulation * Math.pow(1 + cityGrowthRate, 5)))}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{formatPopulation(Math.floor(cityPopulation * (Math.pow(1 + cityGrowthRate, 5) - 1)))} mieszkańców
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
