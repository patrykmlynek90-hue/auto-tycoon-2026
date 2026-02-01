"use client"

import React from "react"
import { useEffect, useRef } from "react"
import { useGameStore } from "@/lib/game-store"
import { GameSidebar } from "./sidebar"
import { GameHeader } from "./header"
import { DashboardPanel } from "./panels/dashboard-panel"
import { ResearchPanel } from "./panels/research-panel"
import { ModelsPanel } from "./panels/models-panel"
import { FactoryPanel } from "./panels/factory-panel"
import { DealershipsPanel } from "./panels/dealerships-panel"
import { CityPanel } from "./panels/city-panel"
import { FinancesPanel } from "./panels/finances-panel"
import { BankPanel } from "./panels/bank-panel"
import { CorporationPanel } from "./panels/corporation-panel"
import { SettingsPanel } from "./panels/settings-panel"
import { StockMarketPanel } from "./panels/stock-market-panel"
import { AuctionModal } from "./modals/auction-modal"
import { AuctionResultModal } from "./modals/auction-result-modal"
import { CrisisModal } from "./crisis-modal"
import { ContractOfferModal } from "./modals/contract-offer-modal"

// Registry of panels
const panels: Record<string, React.ComponentType> = {
  dashboard: DashboardPanel,
  research: ResearchPanel,
  models: ModelsPanel,
  factory: FactoryPanel,
  dealerships: DealershipsPanel,
  city: CityPanel,
  finances: FinancesPanel,
  corporation: CorporationPanel,
  bank: BankPanel,
  stock_market: StockMarketPanel,
  settings: SettingsPanel,
}

export function GameContainer() {
  const { activeTab, tick, gameSpeed, isPaused } = useGameStore()

  // Ref to track last tick time for smoother handling if needed, 
  // but for now simple interval is fine for a tycoon game.
  const mainScrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Scroll to top when tab changes
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0
    }
  }, [activeTab])

  useEffect(() => {
    if (isPaused) return

    // 1 tick = 1 second real time
    const tickRate = 1000 / gameSpeed

    const intervalId = setInterval(() => {
      tick()
      // console.log("Tick fired", new Date().toISOString())
    }, tickRate)

    return () => clearInterval(intervalId)
  }, [isPaused, gameSpeed, tick])

  const ActivePanel = panels[activeTab] || DashboardPanel

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      <GameSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <GameHeader />
        <main className="flex-1 overflow-auto bg-background/50" ref={mainScrollRef}>
          <ActivePanel />
        </main>
      </div>
      <AuctionModal />
      <AuctionResultModal />
      <CrisisModal />
      <ContractOfferModal />
    </div>
  )
}
