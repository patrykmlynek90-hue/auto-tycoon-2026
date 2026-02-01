"use client"

import { cn } from "@/lib/utils"
import { useGameStore } from "@/lib/game-store"
import {
  LayoutDashboard,
  FlaskConical,
  Car,
  Factory,
  Store,
  Building2,
  Settings,
  TrendingUp,
  Landmark,
  Briefcase,
  PieChart,
  CreditCard,
} from "lucide-react"

const menuItems = [
  { id: "dashboard", label: "Panel Główny", icon: LayoutDashboard },
  { id: "research", label: "Badania", icon: FlaskConical },
  { id: "models", label: "Modele Aut", icon: Car },
  { id: "factory", label: "Fabryka", icon: Factory },
  { id: "dealerships", label: "Salony", icon: Store },
  { id: "city", label: "Miasto", icon: Building2 },
  { id: "corporation", label: "Korporacja", icon: Briefcase },
  { id: "finances", label: "Finanse", icon: PieChart },
  { id: "bank", label: "Bank", icon: CreditCard },
  { id: "stock_market", label: "Giełda", icon: TrendingUp },
  { id: "settings", label: "Ustawienia", icon: Settings },
]

export function GameSidebar() {
  const { activeTab, setActiveTab } = useGameStore()

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Car className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground tracking-tight">Auto Tycoon</h1>
            <p className="text-xs text-muted-foreground">Corporation Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          <p>Wersja 0.1.0 Alpha</p>
        </div>
      </div>
    </aside>
  )
}
