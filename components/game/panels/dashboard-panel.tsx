"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Car,
  Factory,
  Store,
  ShoppingBag,
} from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from "recharts"
import { ContractHistoryBox } from "./contract-history-box"
import { NewsFeedPanel } from "./news-feed-panel"

export function DashboardPanel() {
  const {
    money,
    monthlyRevenue,
    monthlyExpenses,
    carModels,
    factories,
    dealerships,
    salesHistory,
    marketDemand,
    dashboardChartMode,
    setDashboardChartMode
  } = useGameStore()

  const profit = monthlyRevenue - monthlyExpenses
  const isProfit = profit >= 0


  const formatMoney = useCurrencyFormatter()

  const totalSalesMonth = dealerships.reduce((s, d) => s + d.salesThisMonth, 0)
  const totalSalesCapacity = dealerships.reduce((s, d) => s + (d.status === 'active' ? d.salesCapacity : 0), 0)

  // Desired Order:
  // 1. Market Demand
  // 2. Current Sales (New)
  // 3. Car Models
  // 4. Dealerships
  // 5. Factories

  const statCards = [
    {
      title: "Popyt Rynkowy (Msc)",
      value: (marketDemand.lower + marketDemand.middle + marketDemand.higher).toLocaleString(),
      subtitle: `L: ${marketDemand.lower} | M: ${marketDemand.middle} | H: ${marketDemand.higher}`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Aktualna sprzedaż (Msc)",
      value: `${totalSalesMonth} / ${totalSalesCapacity}`,
      subtitle: "Sprzedane / Potencjał",
      icon: ShoppingBag,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Modele Aut",
      value: carModels.length,
      subtitle: `${carModels.reduce((sum, m) => sum + m.salesThisMonth, 0)} sprzedanych (Tot)`,
      icon: Car,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Salony",
      value: dealerships.length,
      subtitle: `${dealerships.reduce((sum, d) => sum + d.salesThisMonth, 0)} sprzedaży`,
      icon: Store,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Ilość Fabryk",
      value: factories.length,
      subtitle: `${factories.reduce((sum, f) => sum + f.currentProduction, 0)} / ${factories.reduce((sum, f) => sum + f.capacity, 0)} Prod.`,
      icon: Factory,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  // Sort by sales this month descending
  const topSellingModels = [...carModels]
    .sort((a, b) => b.salesThisMonth - a.salesThisMonth)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">


      {/* Finance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budżet</p>
                <p className="text-2xl font-bold text-primary">{formatMoney(money)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Przychód (mies.)</p>
                <p className="text-2xl font-bold text-foreground">{formatMoney(monthlyRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zysk netto</p>
                <p className={`text-2xl font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
                  {formatMoney(profit)}
                </p>
              </div>
              {isProfit ? (
                <TrendingUp className="w-8 h-8 text-primary/40" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive/40" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* News Feed Panel */}
      <NewsFeedPanel />

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Historia Sprzedaży
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesHistory}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="oklch(0.65 0.18 145)"
                    strokeWidth={2}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {dashboardChartMode === 'revenue' ? "Przychody Miesięczne" : "Zysk Miesięczny"}
            </CardTitle>
            <div className="flex bg-secondary/50 rounded-md p-1 h-7">
              <button
                onClick={() => setDashboardChartMode('revenue')}
                className={`px-2 text-xs rounded-sm transition-all ${dashboardChartMode === 'revenue' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Przychód
              </button>
              <button
                onClick={() => setDashboardChartMode('profit')}
                className={`px-2 text-xs rounded-sm transition-all ${dashboardChartMode === 'profit' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Zysk
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesHistory.map(item => ({ ...item, profit: item.revenue - item.expenses }))}>
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
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.16 0.01 260)",
                      border: "1px solid oklch(0.25 0.01 260)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, dashboardChartMode === 'revenue' ? "Przychód" : "Zysk"]}
                  />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                  <Bar
                    dataKey={dashboardChartMode}
                    fill={dashboardChartMode === 'revenue' ? "oklch(0.70 0.16 55)" : "oklch(0.65 0.18 145)"}
                    radius={[4, 4, 0, 0]}
                  >
                    {/* Dynamic color for profit bars (red/green) */}
                    {dashboardChartMode === 'profit' && salesHistory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry.revenue - entry.expenses) >= 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Najlepiej Sprzedające się Modele (Miesiąc)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSellingModels.map((model, index) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{model.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.engine} • {model.body}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{model.totalSales} szt.</p>
                  <p className="text-xs text-muted-foreground">
                    {model.salesThisMonth} w tym mies.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract History */}
      <ContractHistoryBox />
    </div>
  )
}
