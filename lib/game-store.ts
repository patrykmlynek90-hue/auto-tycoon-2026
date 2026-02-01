import { create } from 'zustand'
import { advanceDate, isNewMonth, getEra } from '@/lib/timeEngine'
import { CarClassId, carClasses, getEngineMismatchPenalty } from '@/data/carClasses' // Active R&D System
import { CarPart, engineOptions, chassisOptions, bodyOptions, interiorOptions } from '@/data/parts'
import { techTree } from '@/data/techTree'


// Jan(0) to Dec(11)
// Jan(0) to Dec(11)
const SEASONALITY_MODIFIERS = [0.8, 0.8, 1.0, 1.1, 1.2, 1.2, 1.0, 1.0, 1.1, 1.1, 0.9, 0.8]




// Stock Market Interfaces
export type StockCategory = 'Automotive' | 'Technology' | 'Energy' | 'Raw Materials' | 'Logistics'
export type IndustrySector = 'Automotive' | 'Technology' | 'Heavy Industry' | 'Energy' | 'Finance'

export interface StockCompany {
  id: string
  name: string
  category: StockCategory
  startingPrice: number      // Fixed price from Year 1 (for long-term stats)
  currentPrice: number       // Changes monthly
  volatility: number         // 0.05 to 0.2
  totalShares: number        // Fixed at 10,000,000 (reduced from 1B)
  history: number[]          // Array of prices (Limit to last 120 months)
  // Cycle Fields
  sector: IndustrySector
  isETF: boolean
  isProtected?: boolean      // Diamond Companies (Blue Chips) - protected from bankruptcy
  cycleEndYear: number
  longTermTarget: number
  formationYear: number      // Year company was listed on stock market
}

export interface PortfolioItem {
  shares: number
  avgBuyPrice: number
}

export interface BankruptcyDetails {
  oldCompanyName: string
  oldCategory: string
  bankruptcyDate: string
  ipoPrice: number
  yearsActive: number
  playerHadShares: boolean
  sharesOwned?: number
  moneyLost?: number
  newCompanyName: string
  newCategory: string
  newIpoPrice: number
}

export const STOCK_CATEGORIES: StockCategory[] = ['Automotive', 'Technology', 'Energy', 'Raw Materials', 'Logistics']

const COMPANY_NAMES: Record<StockCategory, string[]> = {
  'Automotive': ['Apex Motors', 'Velocity Inc', 'IronHorse Trucks', 'EcoDrive Systems'],
  'Technology': ['NanoChip Corp', 'CyberNet', 'Quantum Data', 'SynthOS'],
  'Energy': ['Solaris Power', 'AtomCore', 'GeoThermal Ltd', 'PureWind'],
  'Raw Materials': ['SteelWorks Global', 'Lithium Sources', 'Polymer Chem', 'RareEarth Mining'],
  'Logistics': ['Global Freight', 'SpeedWay Trans', 'Harbor Logistics', 'AeroCargo']
}

// Baza słów dla generatora nazw
const COMPANY_NAME_PARTS: Record<StockCategory, { prefixes: string[], suffixes: string[] }> = {
  'Automotive': {
    prefixes: ['Apex', 'Velox', 'Turbo', 'Hyper', 'Nova', 'Titan', 'Omega', 'Prime', 'Red', 'Blue'],
    suffixes: ['Motors', 'Auto', 'Engineering', 'Performance', 'Cars', 'Mobility', 'Works', 'Machines']
  },
  'Technology': {
    prefixes: ['Cyber', 'Nano', 'Data', 'Quantum', 'Synapse', 'Robo', 'Logic', 'Micro', 'Future', 'Net'],
    suffixes: ['Sys', 'Tech', 'Soft', 'Labs', 'Solutions', 'Systems', 'Inc', 'Group', 'AI']
  },
  'Energy': {
    prefixes: ['Solar', 'Atom', 'Eco', 'Green', 'Power', 'Fusion', 'Volt', 'Terra', 'Hydro', 'Sun'],
    suffixes: ['Energy', 'Power', 'Grid', 'Electric', 'Nuclear', 'Gen', 'Resources', 'Dynamics']
  },
  'Raw Materials': {
    prefixes: ['Steel', 'Iron', 'Gold', 'Heavy', 'Global', 'United', 'Deep', 'Rock', 'Geo', 'Metal'],
    suffixes: ['Mining', 'Works', 'Materials', 'Corp', 'Steel', 'Extract', 'Foundry', 'Resources']
  },
  'Logistics': {
    prefixes: ['Fast', 'Global', 'Trans', 'Cargo', 'Swift', 'Pacific', 'Atlantic', 'Air', 'Road', 'Inter'],
    suffixes: ['Freight', 'Logistics', 'Shipping', 'Lines', 'Transport', 'Express', 'Delivery', 'Port']
  }
}

// Funkcja pomocnicza do generowania nazwy
function generateCompanyName(sector: StockCategory): string {
  const parts = COMPANY_NAME_PARTS[sector]
  if (!parts) return "General Corp" // Fallback

  const prefix = parts.prefixes[Math.floor(Math.random() * parts.prefixes.length)]
  const suffix = parts.suffixes[Math.floor(Math.random() * parts.suffixes.length)]

  // Np. "Cyber" + "Labs" = "Cyber Labs"
  return `${prefix} ${suffix}`
}

function generateStockCycle(currentPrice: number, currentYear: number): { cycleEndYear: number, longTermTarget: number } {
  // Czas trwania: 3-7 lat (średnio 5)
  const duration = 3 + Math.floor(Math.random() * 5)
  const cycleEndYear = currentYear + duration

  // Cel cenowy (Target)
  const rand = Math.random()
  let target = currentPrice

  if (rand < 0.40) {
    // Wzrost Stabilny (x1.5)
    target = currentPrice * (1.2 + Math.random() * 0.6)
  } else if (rand < 0.60) {
    // Boom (x3.0)
    target = currentPrice * (2.0 + Math.random() * 2.0)
  } else if (rand < 0.90) {
    // Spadek (x0.5)
    target = currentPrice * (0.3 + Math.random() * 0.4)
  } else {
    // Krach ($0.00 - praktycznie bankructwo lub groszowe sprawy)
    target = 0.01
  }

  return { cycleEndYear, longTermTarget: parseFloat(target.toFixed(2)) }
}

function bankruptAndRegenerateCompany(
  company: StockCompany,
  currentYear: number
): StockCompany {

  // 1. Zachowujemy sektor starej firmy, żeby nie zaburzyć balansu gry
  const sector = company.category

  // 2. Generujemy nową tożsamość
  const newName = generateCompanyName(sector)

  // 3. Ustalamy cenę startową (IPO)
  // Losujemy między $2.00 a $5.00
  const startPrice = 2.0 + Math.random() * 3.0

  // 5. Nowa zmienność (Volatility)
  const newVolatility = 0.05 + Math.random() * 0.15

  // 6. Inicjalizacja Cyklu
  const cycle = generateStockCycle(startPrice, currentYear)

  // 4. Resetujemy obiekt firmy (ZASTĘPUJEMY stary obiekt nowymi danymi)
  // Ważne: ID zostaje to samo, żeby nie psuć tablic w UI, ale dane są nowe.
  // Uwaga: Funkcja zwraca NOWY obiekt, który podmienimy w tablicy
  return {
    ...company,
    id: `${sector.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Nuclear Fix: New ID to prevent ghost shares
    name: newName,
    currentPrice: parseFloat(startPrice.toFixed(2)),
    startingPrice: parseFloat(startPrice.toFixed(2)), // Reset początkowej ceny dla ROI
    history: [parseFloat(startPrice.toFixed(2))], // Initialize with starting price
    volatility: newVolatility,
    cycleEndYear: cycle.cycleEndYear,
    longTermTarget: cycle.longTermTarget,
    totalShares: 10_000_000,
    formationYear: currentYear, // New company gets current year
    sector: sector as IndustrySector, // Ensure type safety
    isETF: false // Normal companies are not ETFs
  }
}

function generateInitialCompanies(): StockCompany[] {
  const companies: StockCompany[] = []
  const startYear = 1950 // Or get from game state if possible, but store init is static-ish

  STOCK_CATEGORIES.forEach(category => {
    COMPANY_NAME_PARTS[category].prefixes.slice(0, 4).forEach((_, i) => {
      // Use a simpler loop or just iterate names? 
      // The original used COMPANY_NAMES array which we removed/replaced? 
      // Wait, I see COMPANY_NAMES in the file view (line 37) but I replaced it with COMPANY_NAME_PARTS?
      // Ah, I need to check if COMPANY_NAMES constant still exists or if I should construct names.
      // In previous edit I replaced lines 37-43 (COMPANY_NAMES) with COMPANY_NAME_PARTS logic?
      // Let's assume I need to generate 4 companies per category using the new logic.
      const name = generateCompanyName(category) // Initial names might be random now

      const startPrice = 0.5 + Math.random() * 4.5 // $0.50 - $5.00
      const cycle = generateStockCycle(startPrice, startYear)

      // Diamond Companies (Blue Chips) - Mark strategic Heavy Industry and Energy companies as protected
      const isProtected = (category === 'Raw Materials' && i < 3) || (category === 'Energy' && i < 2)

      companies.push({
        id: `${category.toLowerCase()}-${i}`, // Stable ID based on category index
        name: name,
        category: category,
        startingPrice: parseFloat(startPrice.toFixed(2)),
        currentPrice: parseFloat(startPrice.toFixed(2)),
        volatility: 0.05 + Math.random() * 0.15,
        totalShares: 10_000_000,
        history: [parseFloat(startPrice.toFixed(2))],
        cycleEndYear: cycle.cycleEndYear,
        longTermTarget: cycle.longTermTarget,
        formationYear: 1950, // All initial companies formed in 1950
        sector: category === 'Raw Materials' ? 'Heavy Industry' : (category as IndustrySector), // Map Raw Materials -> Heavy Industry
        isETF: false,
        isProtected: isProtected
      })
    })
  })

  // 2. FUNDUSZE ETF (Fixed)
  const etfs: StockCompany[] = [
    {
      id: 'etf-global',
      name: 'Global Market Index',
      category: 'Finance' as StockCategory, // Mapping for UI compatibility if needed, using Finance
      sector: 'Finance',
      isETF: true,
      startingPrice: 5.00,
      currentPrice: 5.00,
      volatility: 0.02,
      totalShares: 50_000_000,
      history: [5.00],
      cycleEndYear: 2000, // Irrelevant for ETF
      longTermTarget: 0,
      formationYear: 1950
    },
    {
      id: 'etf-tech',
      name: 'Future Tech ETF',
      category: 'Technology' as StockCategory,
      sector: 'Technology',
      isETF: true,
      startingPrice: 3.50,
      currentPrice: 3.50,
      volatility: 0.08,
      totalShares: 20_000_000,
      history: [3.50],
      cycleEndYear: 2000,
      longTermTarget: 0,
      formationYear: 1950
    },
    {
      id: 'etf-heavy',
      name: 'Heavy Giants ETF',
      category: 'Raw Materials' as StockCategory, // Mapping to Heavy Industry logic
      sector: 'Heavy Industry',
      isETF: true,
      startingPrice: 2.00,
      currentPrice: 2.00,
      volatility: 0.04,
      totalShares: 30_000_000,
      history: [2.00],
      cycleEndYear: 2000,
      longTermTarget: 0,
      formationYear: 1950
    },
    {
      id: 'etf-auto',
      name: 'Auto-Moto Fund',
      category: 'Automotive' as StockCategory,
      sector: 'Automotive',
      isETF: true,
      startingPrice: 4.00,
      currentPrice: 4.00,
      volatility: 0.06,
      totalShares: 15_000_000,
      history: [4.00],
      cycleEndYear: 2000,
      longTermTarget: 0,
      formationYear: 1950
    },
    {
      id: 'etf-energy',
      name: 'Global Power ETF',
      category: 'Energy' as StockCategory,
      sector: 'Energy',
      isETF: true,
      startingPrice: 6.00,
      currentPrice: 6.00,
      volatility: 0.03,
      totalShares: 50_000_000,
      history: [6.00],
      cycleEndYear: 2000,
      longTermTarget: 0,
      formationYear: 1950
    }
  ]

  return [...companies, ...etfs]
}


export interface CarModel {
  id: string
  name: string
  engine: string
  chassis: string
  body: string
  price: number
  productionCost: number
  popularity: number
  salesThisMonth: number
  salesBreakdown: { Lower: number, Middle: number, Higher: number }
  totalSales: number
  yearIntroduced: number
  class: CarClassId
  interiorQuality: number // 0-100
  interiorCost: number
  stats: {
    power: number
    weight: number
    style: number
    safety: number
    reliability: number
  }
  totalProfit: number
  tempDesirabilityMap?: Record<string, number>
  inflationSensitivity: number // Weighted average of component sensitivities
  synergyScore?: number // New Global Synergy Score (0-150)
  // Annual Stats
  salesThisYear: number
  revenueThisYear: number
  profitThisYear: number
  cogsThisYear: number
  lastYearStats: {
    sales: number
    revenue: number
    profit: number
    cogs: number
  }
}

export interface Factory {
  id: string
  name: string
  level: number
  capacity: number
  currentProduction: number
  efficiency: number
  workers: number
  upgradeCost: number
  wageLevel: number // Multiplier for base wage (1.0 = standard)
  status: 'active' | 'idle'
  // New Fields
  producingModelId: string | null
  productionTarget: number // Manual slider 0-Max
  inventory: number // Stored cars
}



export interface AuctionState {
  year: number
  landValue: number
  rivalBid: number
  isOpen: boolean
  estimatedValue: number
  userBid: number
}

export interface AuctionResultState {
  won: boolean
  year: number
  bid: number
  message: string
}

export interface Dealership {
  id: string
  name: string
  location: string
  salesCapacity: number
  workers: number
  salesThisMonth: number
  upgradeCost: number
  level: number
  status: 'active' | 'idle'
  // New Fields
  producingClassId: CarClassId | null
  productionTarget: number // Manual slider 0-Max
  inventory: number // Stored cars
}

export interface TermDeposit {
  id: string
  initialAmount: number           // Początkowa wpłata
  currentAmount: number            // Aktualna wartość z odsetkami
  startDate: string                // Data założenia
  lastCompoundDate: string | null  // Data ostatniej kapitalizacji
  totalYearsCompleted: number      // Liczba ukończonych pełnych lat
  interestRate: number             // 0.05 (5%)
}

export interface BankState {
  loan: number // Total Debt (includes interest)
  activeDeposit: TermDeposit | null // Pojedyncza lokata lub null
  paymentStats: {
    loanPaymentLastMonth: number
    depositProfitLastMonth: number
  }
}

export interface SalesRecord {
  date: string
  sales: number
  revenue: number
  expenses: number
}

export interface ExportContract {
  country: string
  carClass: CarClassId
  requestedQuantity: number
  fulfilledQuantity: number
  pricePerUnit: number
  totalRevenue: number
  year: number
}

export interface ContractOffer {
  type: 'domestic' | 'export'
  contractor: string // Name or country
  carClass: CarClassId
  requestedQty: number
  pricePerUnit: number
  totalRevenue: number
  availableInventory: number
  offeredOn: Date
}

export interface TransactionDetails {
  modelName: string
  quantity: number
  basePrice: number
  finalPrice: number
  negotiationPercent: number
  totalRevenue: number
  totalProfit: number
}

export interface BankruptcyDetails {
  oldCompanyName: string
  oldCategory: string
  bankruptcyDate: string
  ipoPrice: number
  yearsActive: number
  playerHadShares: boolean
  sharesOwned?: number
  moneyLost?: number
  newCompanyName: string
  newCategory: string
  newIpoPrice: number
}

export interface ContractHistoryEntry {
  id: string
  type: 'domestic' | 'export'
  contractor: string
  carClass: CarClassId
  requestedQty: number
  fulfilledQty: number
  pricePerUnit: number
  totalRevenue: number
  inventoryBefore: number
  inventoryAfter: number
  date: Date
}

const EXPORT_COUNTRIES = [
  'USA', 'Chiny', 'Japonia', 'Niemcy', 'Indie', 'Wielka Brytania',
  'Francja', 'Brazylia', 'Włochy', 'Kanada', 'Korea Południowa',
  'Australia', 'Meksyk', 'Hiszpania', 'Indonezja', 'Turcja',
  'Holandia', 'Arabia Saudyjska', 'Szwajcaria', 'Polska'
] as const

const EXPORT_ELIGIBLE_CLASSES: CarClassId[] = ['S', 'E', 'F', 'X']

const DOMESTIC_CONTRACTORS = [
  'Ministerstwo Transportu', 'Policja Krajowa', 'Pogotowie Ratunkowe',
  'Poczta Państwowa', 'Straż Graniczna', 'Służba Celna',
  'Krajowa Administracja Skarbowa', 'Inspekcja Transportu Drogowego',
  'Agencja Bezpieczeństwa Wewnętrznego', 'Wojskowa Służba Logistyczna',
  'Regionalna Dyrekcja Lasów Państwowych', 'Zarząd Dróg i Mostów',
  'Państwowa Straż Pożarna', 'Agencja Restrukturyzacji i Modernizacji',
  'Krajowy Ośrodek Wspierania Rolnictwa', 'Urząd Miasta Stołecznego',
  'Zakład Ubezpieczeń Społecznych', 'Narodowy Fundusz Zdrowia',
  'Polskie Koleje Państwowe', 'Energetyka Krajowa',
  'Gazownia Centralna', 'Wodociągi Miejskie',
  'Miejski Zakład Komunikacji', 'Agencja Rozwoju Przemysłu',
  'Polska Agencja Żeglugi Powietrznej', 'Instytut Meteorologii i Gospodarki Wodnej',
  'Główny Urząd Statystyczny', 'Polska Akademia Nauk',
  'Agencja Mienia Wojskowego', 'Narodowe Centrum Badań i Rozwoju',
  'Korporacja Taksówkowa "Grom"', 'Sieć Hoteli "Panorama"',
  'Firma Budowlana "Beton-Mix"', 'Przedsiębiorstwo Geodezyjne "Mapa"',
  'Kurierzy "Pędziwiatr"', 'Biuro Ochrony "Tarcza"',
  'Agencja Reklamowa "Wizja"', 'Holding Wydawniczy "Prasa"',
  'Konsorcjum "Tele-Kom"', 'Stowarzyszenie Inżynierów'
] as const

export interface CrisisEvent {
  title: string
  description: string
  cost: number
  year: number
}

const CRISIS_SCENARIOS = [
  'Awaria głównej taśmy montażowej – konieczna natychmiastowa wymiana modułów sterujących.',
  'Wycofanie wadliwej partii skrzyń biegów – koszty akcji serwisowej w salonach.',
  'Nagły wzrost cen energii przemysłowej – korekta rachunków za ubiegły rok.',
  'Jednorazowe odprawy po negocjacjach ze związkami – koszt utrzymania pokoju społecznego.',
  'Kara za usterki w systemie oczyszczania ścieków – grzywna od inspekcji środowiska.',
  'Pożar w hali składowania opon – straty nieobjęte pełnym ubezpieczeniem.',
  'Atak ransomware na bazy projektowe – koszt odzyskania danych i wzmocnienia cyberryzyk.',
  'Przegrany proces o patent systemu wtrysku – jednorazowe odszkodowanie dla konkurencji.',
  'Zalanie magazynu gotowych tapicerek – pęknięta rura w głównej hali.',
  'Kradzież transportu rzadkich metali – utrata surowców do produkcji katalizatorów.',
  'Błąd w ogólnopolskiej kampanii reklamowej – koszty wycofania materiałów i poprawek.',
  'Nagłe dostosowanie linii do nowych norm BHP – modernizacja stanowisk pracy.',
  'Awaria systemu chłodzenia w serwerowni R&D – kosztowne naprawy infrastruktury.',
  'Grzywna za błędy w raportowaniu odpadów – biurokratyczne niedociągnięcie w dziale logistyki.',
  'Wykrycie malwersacji finansowych – straty wynikające z nadużyć w lokalnym oddziale.',
  'Zniszczenie prototypu w wypadku testowym – błąd aparatury podczas crash-testu.',
  'Sabotaż techniczny w lakierni – konieczność czyszczenia i rekalibracji dysz.',
  'Skokowy wzrost opłat za fracht morski – nagła zmiana stawek przewoźników.',
  'Poważna awaria instalacji w głównym salonie – zalanie luksusowej ekspozycji.',
  'Uszkodzenie dachu fabryki po gradobiciu – naprawy poszycia po ekstremalnej pogodzie.',
  'Konieczna aktualizacja softu robotów – wykryty błąd bezpieczeństwa w oprogramowaniu.',
  'Kara za przekroczenie norm hałasu nocnego – skarga mieszkańców okolic fabryki.',
  'Wypłata „złotych spadochronów” – koszty odejścia części kadry zarządzającej.',
  'Wymiana wadliwego oświetlenia stanowiskowego – masowa usterka zakupionych lamp LED.',
  'Rozszczelnienie podziemnego zbiornika – kosztowna rekultywacja terenu przy zakładzie.'
] as const

const CRISIS_BASE_COSTS = [10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000] as const

export interface GameState {
  // Time & Era
  gameDate: Date
  era: string
  gameSpeed: number
  wasAutoPaused: boolean
  speedBeforePause: number
  isPaused: boolean

  // Finances
  money: number
  monthlyRevenue: number

  monthlyExpenses: number
  baseExpenses: number // For inflation calculation
  inflationRate: number // default 0.05 (5%)
  economicMultiplier: number
  currency: 'USD' | 'PLN'

  // City
  cityPopulation: number
  cityCapacity: number
  baseGrowthRate: number
  minGrowthRate: number
  cityGrowthRate: number // Current effective annual rate

  // Market
  marketDemand: {
    lower: number
    middle: number
    higher: number
  }
  previousMarketDemandTotal: number
  marketNoise: {
    lower: number
    middle: number
    higher: number
  }

  // Financial Stats
  totalRevenueAllTime: number
  totalExpensesAllTime: number
  totalCarsProducedAllTime: number
  totalCarsSoldAllTime: number
  totalExportSalesAllTime: number
  totalExportRevenueAllTime: number
  totalContractSalesAllTime: number // Domestic
  totalContractRevenueAllTime: number // Domestic
  totalCrisisCostsAllTime: number
  lastCrisisYear: number
  lastExportYear: number // Year of last completed export contract
  domesticContractsThisYear: number // Limit 2 per year

  // Stock Market Financial Tracking
  currentMonthStockRevenue: number
  currentMonthStockSpend: number // Asset Transfer
  currentMonthBrokerageFees: number // Expense
  totalRealizedStockProfit: number // All-time Profit
  totalBrokerageFees: number // All-time Fees
  isCrisisModalOpen: boolean
  currentCrisis: CrisisEvent | null
  pendingContractOffer: ContractOffer | null
  isContractOfferModalOpen: boolean
  contractHistory: ContractHistoryEntry[]

  // Stock Market
  stockCompanies: StockCompany[]
  portfolio: Record<string, PortfolioItem>

  // Bank
  // Bank
  bank: BankState

  // Assets
  carModels: CarModel[]
  unlockedClasses: string[] // IDs of unlocked car classes
  unlockedParts: string[] // IDs of unlocked car parts (value)
  unlockedFeatures: string[] // IDs of unlocked special features (techTree)
  factories: Factory[]
  dealerships: Dealership[]

  salesHistory: SalesRecord[]
  notifications: string[]
  logs: { date: string, type: 'success' | 'danger' | 'info', message: string, details?: TransactionDetails, bankruptcyDetails?: BankruptcyDetails }[] // New structured logs
  auctionsHeld: number // Limit 5 total auctions (win or lose)

  // Hardcore Economy State
  auctionAttempts: number // Tracks how many auctions happened (max 5)
  globalFactoryLimit: number // Base 9 + Expansions
  globalShowroomLimit: number // Base 14 + Expansions
  factoryExpansionLevel: number // paid upgrades
  showroomExpansionLevel: number // paid upgrades

  // UI State
  activeTab: string
  isAuctionModalOpen: boolean
  dashboardChartMode: 'revenue' | 'profit'

  // Actions
  addLog: (type: 'success' | 'danger' | 'info', message: string, details?: TransactionDetails, bankruptcyDetails?: BankruptcyDetails) => void

  // Actions
  setActiveTab: (tab: string) => void
  togglePause: () => void
  setGameSpeed: (speed: number) => void
  emergencyBrake: () => void
  toggleCurrency: () => void
  tick: () => void
  startResearch: (techId: string) => void
  buyDealership: () => void
  upgradeDealership: (dealerId: string) => void
  toggleDealershipStatus: (dealerId: string) => void
  upgradeFactory: (factoryId: string) => void
  toggleFactoryStatus: (factoryId: string) => void
  raiseFactoryWages: (factoryId: string) => void
  updateFactorySettings: (factoryId: string, settings: Partial<Factory>) => void
  createCarModel: (model: Omit<CarModel, 'id' | 'salesThisMonth' | 'salesBreakdown' | 'totalSales' | 'yearIntroduced' | 'totalProfit'>) => void
  updateCarModel: (modelId: string, updates: Partial<CarModel>) => void
  deleteCarModel: (modelId: string) => void
  unlockClass: (classId: string) => void
  unlockPart: (partId: string) => void
  unlockTech: (techId: string) => void

  setDashboardChartMode: (mode: 'revenue' | 'profit') => void

  // Bank Actions
  takeLoan: (amount: number) => void
  repayLoan: (amount: number) => void
  createDeposit: (amount: number) => void
  withdrawDeposit: () => void

  // Corporation Calculators
  getCompanyValuation: () => {
    total: number
    liquidAssets: number
    realEstate: number
    inventoryValue: number
    portfolioValue?: number
  }
  getPrestigeTier: () => {
    min: number
    max: number
    name: string
    rank: number
    nextTierThreshold?: number
    salesProgress: number
  }
  getMarketDominance: () => Record<string, { totalSales: number; totalRevenue: number; totalCOGS: number }>
  // Auction Actions
  auction: AuctionState | null
  startAuction: (year: number) => void
  placeBid: (bid: number) => { success: boolean, message: string }
  buyLandFromDev: () => void
  closeAuction: () => void // Legacy/Hard close
  openAuctionModal: () => void
  closeAuctionModal: () => void

  // Result Modal
  auctionResult: AuctionResultState | null
  closeAuctionResult: () => void

  // Crisis Events
  payCrisisCost: () => void

  // Contract Actions
  acceptContractOffer: () => void

  rejectContractOffer: () => void

  // Retrofit Actions
  payForRetrofit: (amount: number, modelName: string, count: number) => void

  // Stock Market Actions
  buyShares: (companyId: string, amount: number) => void
  sellShares: (companyId: string, amount: number) => void

  // Hardcore Actions
  purchaseFactoryExpansion: () => void
  purchaseShowroomExpansion: () => void

  // Save System
  serializeState: () => string
  loadFromData: (data: Partial<GameState>) => void
  saveToSlot: (slotId: string) => void
  loadFromSlot: (slotId: string) => boolean
  deleteSlot: (slotId: string) => void
}

// Helper: Apply Tiered Inflation
// Formula: Base + (Growth * Sensitivity)
export function applyInflation(baseValue: number, sensitivity: number, multiplier: number): number {
  if (multiplier <= 1) return Math.floor(baseValue * multiplier) // No logic change for deflation/early game
  const growthFactor = multiplier - 1
  const dampenedGrowth = growthFactor * sensitivity
  return Math.floor(baseValue * (1 + dampenedGrowth))
}

const initialCarModels: CarModel[] = []

export const useGameStore = create<GameState>()((set, get) => ({
  // Initial State
  gameDate: new Date(1950, 1, 1), // Start near end of June so we cross into July soon
  era: 'Era Pionierów',
  gameSpeed: 1,
  wasAutoPaused: false,

  // Hardcore Economy Init
  auctionAttempts: 0,
  globalFactoryLimit: 9,
  globalShowroomLimit: 14,
  factoryExpansionLevel: 0,
  showroomExpansionLevel: 0,

  speedBeforePause: 1,
  isPaused: false,

  money: 5000000,
  monthlyRevenue: 0,

  monthlyExpenses: 35000,
  baseExpenses: 35000,
  inflationRate: 0.05,
  economicMultiplier: 1.0,
  currency: 'USD',

  cityPopulation: 50000,
  cityCapacity: 1600000,
  baseGrowthRate: 0.02,
  minGrowthRate: 0.001,
  cityGrowthRate: 0.02,
  marketDemand: {
    lower: 0,
    middle: 0,
    higher: 0
  },
  previousMarketDemandTotal: 0,

  marketNoise: { lower: 1.0, middle: 1.0, higher: 1.0 },

  // Financial Stats
  totalRevenueAllTime: 0,
  totalExpensesAllTime: 0,
  totalCarsProducedAllTime: 0,
  totalCarsSoldAllTime: 0,
  totalExportSalesAllTime: 0,
  totalExportRevenueAllTime: 0,
  totalContractSalesAllTime: 0,
  totalContractRevenueAllTime: 0,
  totalCrisisCostsAllTime: 0,
  lastCrisisYear: 0,
  lastExportYear: 0,
  domesticContractsThisYear: 0,

  // Stock Market Financial Tracking
  currentMonthStockRevenue: 0,
  currentMonthStockSpend: 0,
  currentMonthBrokerageFees: 0,
  totalRealizedStockProfit: 0,
  totalBrokerageFees: 0,
  isCrisisModalOpen: false,
  currentCrisis: null,
  pendingContractOffer: null,
  isContractOfferModalOpen: false,
  contractHistory: [],

  // Stock Market Init
  stockCompanies: generateInitialCompanies(),
  portfolio: {},

  bank: {
    loan: 0,
    activeDeposit: null,
    paymentStats: {
      loanPaymentLastMonth: 0,
      depositProfitLastMonth: 0
    }
  },

  unlockedClasses: ['A'], // Class A is always unlocked by default
  unlockedParts: ['small-i4', 'frame', 'small', 'spartan'], // Basic parts
  unlockedFeatures: [],
  carModels: initialCarModels,
  factories: [
    {
      id: 'factory-1',
      name: 'Fabryka Główna',
      level: 1,
      capacity: 100,
      currentProduction: 0,
      efficiency: 78,
      workers: 50,
      upgradeCost: 100000,
      wageLevel: 1.0,
      status: 'active',
      producingModelId: null, // Initially no model assigned
      productionTarget: 50,
      inventory: 0
    }
  ],
  auction: null,
  dealerships: [
    {
      id: 'dealer-1',
      name: 'Salon Centrum',
      location: 'Centrum miasta',
      salesCapacity: 30,
      workers: 20,
      salesThisMonth: 0,
      upgradeCost: 50000,
      level: 1,
      status: 'active',
      producingClassId: null,
      productionTarget: 20,
      inventory: 0
    }
  ],
  salesHistory: [],
  notifications: [],
  logs: [],
  auctionsHeld: 0,

  activeTab: 'dashboard',
  isAuctionModalOpen: false,
  dashboardChartMode: 'revenue',
  auctionResult: null,

  // Actions
  addLog: (type, message, details, bankruptcyDetails) => {
    const newLog = { date: get().gameDate.toISOString().split('T')[0], type, message, details, bankruptcyDetails }

    if (bankruptcyDetails) {
      console.log('[ADD LOG] Storing log with bankruptcyDetails:', newLog)
    }

    set(state => ({
      logs: [newLog, ...state.logs].slice(0, 50)
    }))
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setDashboardChartMode: (mode) => set({ dashboardChartMode: mode }),

  togglePause: () => set((state) => ({
    isPaused: !state.isPaused,
    wasAutoPaused: false // Reset auto-pause flag when manually toggling
  })),

  setGameSpeed: (speed) => set({ gameSpeed: speed }),

  emergencyBrake: () => {
    const state = get()
    // Only slow down if currently faster than 1x
    if (state.gameSpeed > 1) {
      set({
        speedBeforePause: state.gameSpeed,
        gameSpeed: 1, // Slow down to 1x instead of pausing
        wasAutoPaused: true
      })
    }
  },

  toggleCurrency: () => set((state) => ({ currency: state.currency === 'USD' ? 'PLN' : 'USD' })),

  tick: () => {
    const state = get()
    if (state.isPaused) return

    // 1. Advance Time (8 hours per tick)
    const oldDate = state.gameDate
    const newDate = advanceDate(oldDate, 1)

    // 3. Monthly Updates
    let newMoney = state.money
    let newPopulation = state.cityPopulation
    let newCityGrowthRate = state.cityGrowthRate
    let newSalesHistory = [...state.salesHistory]
    let newCarModels = [...state.carModels]
    let newFactories = state.factories

    let newMonthlyRevenue = state.monthlyRevenue
    let newDealerships = [...state.dealerships]
    let newBaseExpenses = state.baseExpenses
    let newMonthlyExpenses = state.monthlyExpenses
    let newMarketDemand = { ...state.marketDemand }
    let newMarketNoise = { ...state.marketNoise }
    let newPortfolio = { ...state.portfolio }

    // Bank Vars
    let loanPayment = 0
    let depositProfit = 0
    let newLoanAmount = state.bank.loan
    let newActiveDeposit = state.bank.activeDeposit ? { ...state.bank.activeDeposit } : null

    // Reset Monthly Financial Trackers if new month
    let newCurrentMonthStockRevenue = state.currentMonthStockRevenue
    let newCurrentMonthStockSpend = state.currentMonthStockSpend
    let newCurrentMonthBrokerageFees = state.currentMonthBrokerageFees

    if (isNewMonth(oldDate, newDate)) {
      newCurrentMonthStockRevenue = 0
      newCurrentMonthStockSpend = 0
      newCurrentMonthBrokerageFees = 0
    }

    // Auto Compound Interest (Annual)
    if (newActiveDeposit) {
      const depositStart = new Date(newActiveDeposit.startDate)
      const lastCompound = newActiveDeposit.lastCompoundDate
        ? new Date(newActiveDeposit.lastCompoundDate)
        : depositStart

      // Check if full year passed since last compound/start
      // Use time difference to be precise
      const msPerYear = 365 * 24 * 60 * 60 * 1000
      const msSinceLastCompound = newDate.getTime() - lastCompound.getTime()

      if (msSinceLastCompound >= msPerYear) {
        // Compound Interest Event!
        const interest = Math.floor(newActiveDeposit.currentAmount * 0.05)
        newActiveDeposit.currentAmount += interest
        newActiveDeposit.lastCompoundDate = newDate.toISOString()
        newActiveDeposit.totalYearsCompleted += 1

        // Notification is optional, maybe too spammy? Let's add it for clarity
        // But we can't easily add notifications inside this loop structure without checking how 'notifications' var is handled.
        // There is no local 'newNotifications' array variable visible in immediate scope (based on previous view), usually notifications are added in store actions.
        // Let's skip notification inside tick for now to avoid complexity, user will see amount grow.
      }
    }

    // Inflation Check (Every 12 months)
    if (oldDate.getMonth() === 11 && newDate.getMonth() === 0) {
      newBaseExpenses = Math.floor(state.baseExpenses * (1 + state.inflationRate))
    }

    let newStockCompanies = [...state.stockCompanies]
    // Stock Market - Weekly Update (Every Monday, once per week)
    // Runs only when transitioning INTO Monday to avoid 3x updates (since 1 day = 3 ticks)
    if (oldDate.getDay() !== 1 && newDate.getDay() === 1) {
      let bankruptcyOccurred = false
      let bankruptcyEvents: {
        oldId: string,
        oldName: string,
        oldCategory: string,
        replacement: StockCompany,
        sharesOwned?: number,
        avgBuyPrice?: number
      }[] = []
      let newPortfolio = { ...state.portfolio }
      const currentYear = newDate.getFullYear()
      // Approx weeks in year for smoothing calculation
      const currentWeek = Math.floor((newDate.getMonth() * 30 + newDate.getDate()) / 7) + 1

      let detailedCompanies = newStockCompanies.filter(c => !c.isETF)
      const sectorStats: Record<string, { sum: number, count: number }> = {}
      let globalSum = 0

      detailedCompanies.forEach(c => {
        if (!sectorStats[c.sector]) sectorStats[c.sector] = { sum: 0, count: 0 }
        sectorStats[c.sector].sum += c.currentPrice
        sectorStats[c.sector].count += 1
        globalSum += c.currentPrice
      })
      const globalAvg = globalSum / Math.max(1, detailedCompanies.length)

      newStockCompanies = newStockCompanies.map(company => {
        // --- 1. ETF LOGIC ---
        if (company.isETF) {
          let targetPrice = 100.00
          if (company.sector === 'Finance') {
            // Global Market Index
            targetPrice = globalAvg
          } else {
            // Sector ETF
            const stats = sectorStats[company.sector]
            targetPrice = stats ? (stats.sum / Math.max(1, stats.count)) : 50.00
          }

          // Smoothing: Move 5% towards target
          const gap = targetPrice - company.currentPrice
          let newPrice = company.currentPrice + gap * 0.05

          // Add tiny noise
          newPrice += (Math.random() * 0.4 - 0.2)

          return {
            ...company,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            history: [...company.history.slice(-120), parseFloat(newPrice.toFixed(2))]
          }
        }

        // --- 2. REGULAR COMPANY LOGIC ---

        // Check Cycle Expiry
        let companyCycleEnd = company.cycleEndYear
        let companyTarget = company.longTermTarget

        if (currentYear >= company.cycleEndYear) {
          // Cycle ended - generate new cycle silently (no player notification)
          const newCycle = generateStockCycle(company.currentPrice, currentYear)
          companyCycleEnd = newCycle.cycleEndYear
          companyTarget = newCycle.longTermTarget
        }

        // Calculate Smoothing Step
        const yearsRemaining = Math.max(0, companyCycleEnd - currentYear)
        const weeksRemaining = yearsRemaining * 48 + (48 - currentWeek)
        const safeWeeks = Math.max(1, weeksRemaining)

        const priceGap = companyTarget - company.currentPrice
        const trendStep = priceGap / safeWeeks

        // Calculate price change with volatility
        // Diamond Companies (Blue Chips) have 70% lower volatility (0.3x multiplier)
        const volatilityMultiplier = company.isProtected ? 0.3 : 1.0
        const noise = (Math.random() * 2 - 1) * (company.volatility * 0.5 * volatilityMultiplier) * company.currentPrice
        let newPrice = company.currentPrice + trendStep + noise


        // Check Bankruptcy (Hard Low Floor)
        // Diamond Companies (Blue Chips) are protected from bankruptcy with safety floor
        if (company.isProtected && newPrice < 1.00) {
          // Safety Floor: Bounce to stable range $1.05-$1.15 with small oscillations
          newPrice = 1.05 + Math.random() * 0.10
        } else if (!company.isProtected && newPrice <= 0.10) {
          // Regular companies: Bankruptcy at $0.10 (10 cents)
          bankruptcyOccurred = true

          // 1. Capture shares BEFORE deletion for the log
          const startPortfolioItem = newPortfolio[company.id]
          const sharesOwned = startPortfolioItem ? startPortfolioItem.shares : 0
          const avgBuyPrice = startPortfolioItem ? startPortfolioItem.avgBuyPrice : 0

          // 2. Remove shares from player (robust delete)
          if (newPortfolio[company.id]) {
            // Create a new object without the key to be 100% sure
            const { [company.id]: removed, ...rest } = newPortfolio
            newPortfolio = rest
          }

          // 3. Regenerate Company and capture replacement data
          const replacementCompany = bankruptAndRegenerateCompany(company, currentYear)

          // 4. Track bankruptcy event with full data
          bankruptcyEvents.push({
            oldId: company.id,  // Store ID for portfolio lookup
            oldName: company.name,
            oldCategory: company.category,
            replacement: replacementCompany,
            // Store financial data directly here!
            sharesOwned: sharesOwned,
            avgBuyPrice: avgBuyPrice
          })

          return replacementCompany
        }


        // No global safety floor - let regular companies reach bankruptcy at $0.01
        // Protected companies already have their $1.05-$1.15 safety floor above


        // Update History
        const newHistory = [...company.history, newPrice]
        if (newHistory.length > 1300) newHistory.shift() // Limit to ~25 years (1300 weeks)

        const finalPrice = parseFloat(newPrice.toFixed(2))

        return {
          ...company,
          currentPrice: finalPrice,
          history: newHistory,
          cycleEndYear: companyCycleEnd,
          longTermTarget: companyTarget
        }
      })

      // Handle Side Effects of Bankruptcy
      if (bankruptcyOccurred) {
        // ADD NOTIFICATIONS WITH BANKRUPTCY DETAILS
        bankruptcyEvents.forEach(event => {
          // Get portfolio data from event (safest!)
          const sharesOwned = event.sharesOwned || 0 // Default to 0 just in case
          const playerHadShares = sharesOwned > 0
          const totalCost = playerHadShares ? ((event.avgBuyPrice || 0) * sharesOwned) : 0

          // Calculate years active (approx)
          const bankruptcyYear = newDate.getFullYear()
          const yearsActive = bankruptcyYear - 1950 // Simplified - companies start at game start

          const bankruptcyDetails = {
            oldCompanyName: event.oldName,
            oldCategory: event.oldCategory,
            bankruptcyDate: newDate.toISOString().split('T')[0],
            ipoPrice: 0, // We don't store original IPO - could enhance later
            yearsActive: yearsActive,
            playerHadShares: playerHadShares,
            sharesOwned: sharesOwned,
            moneyLost: totalCost,
            newCompanyName: event.replacement.name,
            newCategory: event.replacement.category,
            newIpoPrice: event.replacement.startingPrice
          }

          // Build detailed bankruptcy message
          let bankruptcyMessage = `BANKRUCTWO: Spółka ${event.oldName} (${event.oldCategory}) ogłosiła upadłość!`

          if (playerHadShares) {
            // Player had shares - show losses
            const lossFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalCost)
            bankruptcyMessage += ` Posiadałeś ${sharesOwned.toLocaleString()} akcji, strata: ${lossFormatted}.`
          } else {
            // Player didn't have shares
            bankruptcyMessage += ` Nie posiadałeś akcji.`
          }

          // Add replacement company info
          const ipoFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(event.replacement.startingPrice)
          bankruptcyMessage += ` Nowa firma: ${event.replacement.name} (${event.replacement.category}, IPO: ${ipoFormatted})`

          state.addLog('danger', bankruptcyMessage, undefined, bankruptcyDetails)
        })

        // Apply portfolio changes to state
        // Portfolio and companies updated after bankruptcy
        set({
          stockCompanies: newStockCompanies,
          portfolio: newPortfolio
        })
      }
    }

    // Recalculate Economic Multiplier based on wages (0.8% per year since 1950)
    const currentMultiplier = Math.pow(1.008, newDate.getFullYear() - 1950)

    let actualTotalSales = 0

    if (isNewMonth(oldDate, newDate)) {
      // City growth (Hard S-Curve)
      const saturation = state.cityPopulation / state.cityCapacity
      const growthMultiplier = 1.0 - saturation
      let currentAnnualRate = state.baseGrowthRate * growthMultiplier
      if (currentAnnualRate < state.minGrowthRate) currentAnnualRate = state.minGrowthRate

      newCityGrowthRate = currentAnnualRate
      newPopulation = Math.floor(state.cityPopulation * (1 + currentAnnualRate / 12))

      // --- ADVANCED ECONOMY ENGINE ---
      const costFluctuation = 1 + (Math.random() * 0.20 - 0.10)


      // 1. PRODUCTION PHASE (Updates Inventory)
      newFactories = newFactories.map(f => {
        if (f.status === 'idle' || !f.producingModelId) {
          return { ...f, currentProduction: 0 }
        }

        // COMPLEXITY LOGIC START
        // Find the model being produced to get its class complexity
        const producingModel = f.producingModelId ? newCarModels.find(m => m.id === f.producingModelId) : null
        const producingClassDef = producingModel ? carClasses[producingModel.class] : null
        const complexityMultiplier = producingClassDef?.productionCostMultiplier || 1.0

        // Adjusted Capacity: Base / Multiplier
        // Example: Capacity 100, Multiplier 2.0 (Sport) -> Effective 50
        const effectiveCapacity = Math.floor(f.capacity / complexityMultiplier)

        const maxProd = Math.floor(effectiveCapacity * (f.efficiency / 100))
        // Target is set by user, but limited by physical capacity
        const target = Math.min(f.productionTarget, maxProd)

        const parkingCapacity = 1200 + (f.level - 1) * 200

        // Check if space exists
        if (f.inventory >= parkingCapacity) {
          // Warning will be handled in UI, logic simply stops producing
          return { ...f, currentProduction: 0 }
        }

        // Produce (capped by remaining space)
        const spaceLeft = parkingCapacity - f.inventory
        // Limit production to space left, but min 0
        const actualProduction = Math.max(0, Math.min(target, spaceLeft))

        return {
          ...f,
          currentProduction: actualProduction,
          inventory: f.inventory + actualProduction
        }
      })

      // Update worker costs based on wage levels + 0.8% annual inflation (Synced with Multiplier)
      const wageInflation = currentMultiplier

      const factoryWages = newFactories.reduce((sum, f) => {
        // COMPLEXITY COST LOGIC
        // More complex cars require higher skilled (more expensive) labor
        const pModel = f.producingModelId ? newCarModels.find(m => m.id === f.producingModelId) : null
        const pClass = pModel ? carClasses[pModel.class] : null
        // If idle, we don't apply complexity multiplier to base cost, OR we do? 
        // Logic: "Produkcja skomplikowanego auta wymaga..." - suggests only when active/producing?
        // But usually specialized factories have higher fixed costs. 
        // Requirement: "Zastosuj ten sam multiplier do CAŁOŚCI kosztów"
        // Let's apply it if the factory is assigned to a class (even if idle/paused maybe? No, let's look at status).
        // If status is idle, wages are already 15%.
        // We will apply the multiplier to the BASE wage before idle reduction.

        const complexityMult = pClass?.productionCostMultiplier || 1.0

        const rawWage = Math.floor(f.workers * 2500 * wageInflation * f.wageLevel * complexityMult)
        return sum + (f.status === 'idle' ? Math.floor(rawWage * 0.15) : rawWage)
      }, 0)
      const dealershipWages = state.dealerships.reduce((sum, d) => {
        const rawWage = Math.floor((d.workers || 20) * 4000 * wageInflation)
        return sum + (d.status === 'idle' ? Math.floor(rawWage * 0.15) : rawWage)
      }, 0)
      const totalWorkerCosts = factoryWages + dealershipWages

      const factoryMaintenance = newFactories.reduce((sum, f) => {
        // COMPLEXITY MAINTENANCE LOGIC
        const pModel = f.producingModelId ? newCarModels.find(m => m.id === f.producingModelId) : null
        const pClass = pModel ? carClasses[pModel.class] : null
        const complexityMult = pClass?.productionCostMultiplier || 1.0

        const baseMaint = 50000 * (1 + 0.01 * (f.level - 1)) * currentMultiplier
        return sum + Math.floor(baseMaint * complexityMult)
      }, 0)
      const dealershipMaintenance = Math.floor(state.dealerships.length * 15000 * currentMultiplier)
      const facilityCosts = factoryMaintenance + dealershipMaintenance

      // Dynamic Other Costs: Base Random (10k-50k) * Multiplier * Factory Count
      const baseRandom = Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000
      const otherCosts = Math.floor(baseRandom * currentMultiplier * Math.max(1, newFactories.length))

      // Calculate Variable Costs (Material Costs) based on actual production
      let totalMaterialCost = 0
      newFactories.forEach(f => {
        if (f.currentProduction > 0 && f.producingModelId) {
          // Find specific Model
          const model = newCarModels.find(m => m.id === f.producingModelId)
          if (model) {
            totalMaterialCost += (f.currentProduction * applyInflation(model.productionCost, model.inflationSensitivity || 1.0, currentMultiplier))
          }
        }
      })

      // --- BANK LOGIC (Fixed cost loans & Term Deposits) ---
      const bank = state.bank

      // 1. Loan Payment (1/120th of remaining balance)
      if (bank.loan > 0) {
        // "rata się oblicza na nowo na poczatku kolejnego miesiąca od pozostałej kwoty do spłaty"
        // 10 years = 120 months. A simple heuristic is to pay 1/120th of HEADLINE debt.
        // If we want it to clear in 10 years, it should be a fixed schedule, but user said "recalculates from remaining".
        // If it recalculates 1/120th of REMAINING, it's an infinite curve.
        // User Example: 5M Loan (7.5M Debt) -> 62,500/mo. 7,500,000 / 120 = 62,500.
        // This matches 1/120th of initial. But user said "recalculates... from remaining".
        // If I pay half, does the rate drop? Yes "mogę ją spłacic (...) rata się oblicza na nowo".
        // So: Payment = CurrentDebt / 120.

        loanPayment = Math.ceil(bank.loan / 120)

        // Auto-pay
        newLoanAmount = Math.max(0, bank.loan - loanPayment)
      }

      // 2. Term Deposits (Just update stats if any matured? No, profit only on withdraw)
      // We don't need to do anything for deposits in tick unless we want to auto-notify.
      // Profit is realized only on manual withdrawal.

      // HARDCORE ECONOMY FIX: Divide factory costs by 3 to match new production scale (20-100 vs old 600)
      const factoryCostsAdjustment = (totalWorkerCosts + facilityCosts) / 3
      newBaseExpenses = factoryCostsAdjustment + otherCosts + totalMaterialCost + loanPayment
      // Loan Payment is treated as Expense for Cash Flow visibility

      newMonthlyExpenses = newBaseExpenses

      // 2. Sales Algorithm Overhaul - Realistic Market Demand

      // Base: 1.5 cars per 1000 people
      const baseDemand = (newPopulation / 1000) * 1.5

      // Apply Seasonality
      const seasonality = SEASONALITY_MODIFIERS[newDate.getMonth()]

      // Add Random Factor (0.8 to 1.2) - Market Noise
      const randomFactor = 0.8 + Math.random() * 0.4
      newMarketNoise = { lower: randomFactor, middle: randomFactor, higher: randomFactor } // Simplified unified noise

      const finalMonthlyMarket = Math.round(baseDemand * seasonality * randomFactor)

      const segmentDemands = {
        'Lower': Math.floor(finalMonthlyMarket * 0.30),
        'Middle': Math.floor(finalMonthlyMarket * 0.54),
        'Higher': Math.floor(finalMonthlyMarket * 0.16)
      }

      // Sync with UI State
      newMarketDemand = {
        lower: segmentDemands.Lower,
        middle: segmentDemands.Middle,
        higher: segmentDemands.Higher
      }

      const totalDealershipCapacity = state.dealerships.reduce((sum, d) => sum + (d.status === 'idle' ? 0 : d.salesCapacity), 0)
      const totalProductionCapacity = state.factories.reduce((sum, f) => sum + f.currentProduction, 0)

      let modelDemands: { id: string, demand: number, desirability: number, breakdown: { Lower: number, Middle: number, Higher: number } }[] = []
      const segmentTotalDesirability = { 'Lower': 0, 'Middle': 0, 'Higher': 0 }

      // First Pass: Calculate Desirability
      newCarModels.forEach(model => {
        const carClass = carClasses[model.class]

        let effectiveDesirabilityMap: Record<string, number> = { 'Lower': 0, 'Middle': 0, 'Higher': 0 }
        let score = 100

        // 1. Stat Priorities
        if (carClass.priority === 'Economy') {
          const priceFactor = Math.max(0, 1500 - model.price) / 10
          score += Math.min(50, priceFactor)
        } else if (carClass.priority === 'Performance' || carClass.priority === 'Power') {
          score += (model.stats.power - 50) * 0.5
        } else if (carClass.priority === 'Luxury' || carClass.priority === 'Status') {
          score += (model.stats.style - 20) * 1.0
        }

        // 2. Penalties 
        const adjustedHardCap = carClass.hardCap * currentMultiplier
        const adjustedMaxPrice = carClass.maxPrice * currentMultiplier

        if (model.price > adjustedHardCap) {
          const ratio = model.price / adjustedHardCap
          const penalty = 1 / Math.pow(ratio, 4)
          score *= penalty
        } else if (model.price > adjustedMaxPrice) {
          const range = adjustedHardCap - adjustedMaxPrice
          const excess = model.price - adjustedMaxPrice
          const penalty = 1.0 - (0.5 * (excess / range))
          score *= Math.max(0.1, penalty)
        }

        // 3. Engine Mismatch (Based on Power)
        const mismatchPenalty = getEngineMismatchPenalty(model.class, model.stats.power)
        score *= mismatchPenalty

        // 4. Quality
        score *= (1 + (model.interiorQuality - 10) / 200)

        // SYNERGY BONUS APPLIED TO DEMAND
        const synergyFactor = (model.synergyScore || 100) / 100
        score *= synergyFactor;

        const baseDesirability = Math.max(5, score)

        // Segmentation
        effectiveDesirabilityMap[carClass.socialClass] = baseDesirability
        if (carClass.secondaryMarket) {
          carClass.secondaryMarket.forEach(market => {
            effectiveDesirabilityMap[market.socialClass] = baseDesirability * market.multiplier
          })
        }

        Object.entries(effectiveDesirabilityMap).forEach(([seg, des]) => {
          if (des > 0) {
            segmentTotalDesirability[seg as keyof typeof segmentTotalDesirability] = (segmentTotalDesirability[seg as keyof typeof segmentTotalDesirability] || 0) + des
          }
        })
        model.tempDesirabilityMap = effectiveDesirabilityMap
      })

      // Second Pass: Distribute Segment Buyers
      newCarModels.forEach(model => {
        const desMap = model.tempDesirabilityMap as Record<string, number>
        let modelTotalDemand = 0
        let breakdown = { Lower: 0, Middle: 0, Higher: 0 }

        Object.entries(desMap).forEach(([seg, des]) => {
          const totalDes = segmentTotalDesirability[seg as keyof typeof segmentTotalDesirability]
          const segmentBuyers = segmentDemands[seg as keyof typeof segmentDemands]

          if (totalDes > 0 && des > 0) {
            const share = des / totalDes
            const segDemand = Math.floor(segmentBuyers * share * (0.95 + Math.random() * 0.1))
            modelTotalDemand += segDemand
            if (seg in breakdown) breakdown[seg as keyof typeof breakdown] += segDemand
          }
        })

        const maxDes = Math.max(...Object.values(desMap))
        modelDemands.push({ id: model.id, demand: modelTotalDemand, desirability: maxDes, breakdown })
      })

      let totalModelDemand = modelDemands.reduce((sum, m) => sum + m.demand, 0)
      let remainingGlobalThroughput = totalDealershipCapacity

      newCarModels = newCarModels.map((model, index) => {
        const demandData = modelDemands.find(d => d.id === model.id)
        if (!demandData) return model

        // GUILLOTINE & Price Checks
        const classDef = carClasses[model.class]
        const classSensitivity = classDef.inflationSensitivity || 1.0
        const adjustedHardCap = applyInflation(classDef.hardCap, classSensitivity, currentMultiplier)

        const modelSensitivity = model.inflationSensitivity || 1.0
        const maxAllowedMargin = Math.floor(model.productionCost * currentMultiplier * 10)
        let sales = 0

        if (model.price <= (adjustedHardCap * 1.5) && model.price <= maxAllowedMargin) {
          // Base sales on demand
          sales = demandData.demand
        }

        // Limit by Global Dealership Throughput
        sales = Math.min(sales, remainingGlobalThroughput)

        // Limit by Inventory (Class Specific -> Model Specific)
        // Find factories producing THIS model
        const relevantFactories = newFactories.filter(f => f.producingModelId === model.id)
        const totalInventory = relevantFactories.reduce((sum, f) => sum + f.inventory, 0)

        sales = Math.min(sales, totalInventory)

        // Execute Sales & Deduct Inventory
        if (sales > 0) {
          remainingGlobalThroughput -= sales
          actualTotalSales += sales // Update global counter

          let toDeduct = sales
          newFactories = newFactories.map(f => {
            if (toDeduct > 0 && f.producingModelId === model.id && f.inventory > 0) {
              const take = Math.min(toDeduct, f.inventory)
              toDeduct -= take
              return { ...f, inventory: f.inventory - take }
            }
            return f
          })
        }

        // Calculate Breakdown of Sales (Proportional to Demand)
        const finalBreakdown = { Lower: 0, Middle: 0, Higher: 0 }
        if (sales > 0 && demandData.demand > 0) {
          const ratio = sales / demandData.demand
          finalBreakdown.Lower = Math.floor(demandData.breakdown.Lower * ratio)
          finalBreakdown.Middle = Math.floor(demandData.breakdown.Middle * ratio)
          finalBreakdown.Higher = Math.floor(demandData.breakdown.Higher * ratio)

          // Adjust rounding errors to match total sales
          let currentSum = finalBreakdown.Lower + finalBreakdown.Middle + finalBreakdown.Higher
          let diff = sales - currentSum
          if (diff > 0) finalBreakdown.Middle += diff
        }

        const currentCOGS = applyInflation(model.productionCost, modelSensitivity, currentMultiplier)
        const profit = sales * (model.price - currentCOGS)
        return {
          ...model,
          salesThisMonth: sales,
          salesBreakdown: finalBreakdown,
          totalSales: model.totalSales + sales,
          totalProfit: (model.totalProfit || 0) + profit,
          popularity: Math.floor(model.popularity * 0.9 + demandData.desirability * 0.1),
          salesThisYear: (model.salesThisYear || 0) + sales,
          revenueThisYear: (model.revenueThisYear || 0) + (sales * model.price),
          profitThisYear: (model.profitThisYear || 0) + profit,
          cogsThisYear: (model.cogsThisYear || 0) + (sales * applyInflation(model.productionCost, modelSensitivity, currentMultiplier))
        }
      })

      let cumulativeCapacity = 0
      let salesAllocatedSoFar = 0

      newDealerships = state.dealerships.map(dealer => {
        if (dealer.status === 'idle') {
          return { ...dealer, salesThisMonth: 0 }
        }
        cumulativeCapacity += dealer.salesCapacity
        const targetCumulativeSales = totalDealershipCapacity > 0
          ? Math.floor(actualTotalSales * (cumulativeCapacity / totalDealershipCapacity))
          : 0
        const dealerSales = targetCumulativeSales - salesAllocatedSoFar
        salesAllocatedSoFar += dealerSales
        return { ...dealer, salesThisMonth: dealerSales }
      })

      newMonthlyRevenue = newCarModels.reduce((sum, m) => sum + (m.salesThisMonth * m.price), 0)
      // Note: Loan Payment is already inside newMonthlyExpenses (as requested by user to show in operational costs)
      // But wait "Principal must be deducted separately" logic from before is gone.
      // We added `loanPayment` to `newBaseExpenses` -> `newMonthlyExpenses`.
      // So `newMonthlyExpenses` already reduces money.
      // We just need to ensure we don't double deduct.
      newMoney = state.money + newMonthlyRevenue - newMonthlyExpenses

      const monthStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
      newSalesHistory = [...state.salesHistory.slice(-11), {
        date: monthStr,
        sales: actualTotalSales,
        revenue: newMonthlyRevenue,
        expenses: newMonthlyExpenses,
      }]

      // Accumulate All-Time Statistics (only when month changes)
      set({
        totalRevenueAllTime: state.totalRevenueAllTime + newMonthlyRevenue,
        totalExpensesAllTime: state.totalExpensesAllTime + newMonthlyExpenses,
        totalCarsProducedAllTime: state.totalCarsProducedAllTime + newFactories.reduce((sum, f) => sum + (f.currentProduction || 0), 0),
        totalCarsSoldAllTime: state.totalCarsSoldAllTime + actualTotalSales,
      })

      // Domestic Contracts: Twice per year, Rank 5+, Middle-class only
      const prestige = get().getPrestigeTier()
      if (prestige.rank >= 5 && state.domesticContractsThisYear < 2) {
        // ~16.67% chance per month (~2 times per year)
        const contractChance = Math.random()
        if (contractChance < 0.1667) {
          // Generate contract offer
          const contractor = DOMESTIC_CONTRACTORS[Math.floor(Math.random() * DOMESTIC_CONTRACTORS.length)]

          // Get middle-class car classes dynamically, filtering only those with models
          const middleClasses = Object.entries(carClasses)
            .filter(([_, cls]) => cls.socialClass === 'Middle')
            .map(([id, _]) => id as CarClassId)
            .filter(classId => newCarModels.some(m => m.class === classId))

          if (middleClasses.length > 0) {
            const carClass = middleClasses[Math.floor(Math.random() * middleClasses.length)]
            const requestedQty = Math.floor(5 + Math.random() * 46) // 5-50

            // Find models & price
            const classModels = newCarModels.filter(m => m.class === carClass)
            const pricePerUnit = classModels.length > 0 ? classModels[0].price : 0

            if (pricePerUnit > 0) {
              // Find factories with inventory
              const eligibleFactories = newFactories.filter(f =>
                f.producingModelId && newCarModels.find(m => m.id === f.producingModelId)?.class === carClass
              )

              const totalInventory = eligibleFactories.reduce((sum, f) => sum + f.inventory, 0)

              // Variable Pricing Logic
              // Random factor -0.15 to +0.15
              const negotiationFactor = (Math.random() * 0.30) - 0.15
              let finalPrice = Math.floor(pricePerUnit * (1 + negotiationFactor))

              // Safety check: Don't sell below production cost * 1.05
              const model = classModels[0] // Assuming uniform model for the class/contract
              const currentCOGS = applyInflation(model.productionCost, model.inflationSensitivity || 1.0, currentMultiplier)
              // Ensure at least 5% margin over CURRENT COGS (safe approach)
              if (finalPrice < currentCOGS * 1.05) {
                finalPrice = Math.floor(currentCOGS * 1.05)
              }

              const totalRevenue = requestedQty * finalPrice
              const totalCost = requestedQty * currentCOGS
              const totalProfit = totalRevenue - totalCost

              if (totalInventory >= requestedQty) {
                // Silent Resolve: Accept
                newMoney += totalRevenue
                newMonthlyRevenue += totalRevenue

                let remaining = requestedQty
                newFactories = newFactories.map(f => {
                  if (remaining > 0 && f.producingModelId && newCarModels.find(m => m.id === f.producingModelId)?.class === carClass) {
                    const take = Math.min(f.inventory, remaining)
                    if (take > 0) {
                      remaining -= take
                      return { ...f, inventory: f.inventory - take }
                    }
                  }
                  return f
                })

                set(s => ({
                  domesticContractsThisYear: s.domesticContractsThisYear + 1,
                  totalContractSalesAllTime: s.totalContractSalesAllTime + requestedQty,
                  totalContractRevenueAllTime: s.totalContractRevenueAllTime + totalRevenue
                }))

                const details: TransactionDetails = {
                  modelName: model.name,
                  quantity: requestedQty,
                  basePrice: pricePerUnit,
                  finalPrice: finalPrice,
                  negotiationPercent: negotiationFactor,
                  totalRevenue: totalRevenue,
                  totalProfit: totalProfit
                }

                get().addLog('success', `Kontrakt (Kraj): ${contractor} zakupił ${requestedQty} aut klasy ${carClass}. Zysk: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}`, details)
              } else {
                get().addLog('info', `Odrzucono kontrakt krajowy (${contractor}): Brak towaru (${totalInventory}/${requestedQty})`)
              }
            }
          }
        }
      }
    }

    set({
      gameDate: newDate,
      era: getEra(newDate.getFullYear()),
      money: newMoney,
      economicMultiplier: currentMultiplier,
      cityPopulation: newPopulation,
      cityGrowthRate: newCityGrowthRate,
      marketDemand: newMarketDemand, // Updated with Seasonality & Noise
      previousMarketDemandTotal: isNewMonth(oldDate, newDate)
        ? (state.marketDemand.lower + state.marketDemand.middle + state.marketDemand.higher)
        : state.previousMarketDemandTotal,
      marketNoise: newMarketNoise,
      stockCompanies: newStockCompanies, // Update Stocks
      portfolio: newPortfolio, // Update Portfolio (Bankruptcy check)
      salesHistory: newSalesHistory,
      // Assets
      monthlyRevenue: newMonthlyRevenue,
      monthlyExpenses: newMonthlyExpenses,
      baseExpenses: newBaseExpenses,
      dealerships: newDealerships,
      factories: newFactories,
      bank: {
        ...state.bank,
        loan: newLoanAmount, // PERSIST THE UPDATED LOAN AMOUNT
        activeDeposit: newActiveDeposit,
        paymentStats: {
          loanPaymentLastMonth: isNewMonth(oldDate, newDate) ? (newLoanAmount > 0 || state.bank.loan > 0 ? loanPayment : 0) : state.bank.paymentStats.loanPaymentLastMonth,
          depositProfitLastMonth: state.bank.paymentStats.depositProfitLastMonth
        }
      },
    })

    // Yearly Updates Logic (Prepare Data)
    let finalCarModels = newCarModels
    let auctionTriggeredSet = false

    if (newDate.getFullYear() > oldDate.getFullYear()) {
      const newYear = newDate.getFullYear()

      // 0. Rollover Annual Stats
      finalCarModels = newCarModels.map(m => ({
        ...m,
        lastYearStats: {
          sales: m.salesThisYear || 0,
          revenue: m.revenueThisYear || 0,
          profit: m.profitThisYear || 0,
          cogs: m.cogsThisYear || 0
        },
        salesThisYear: 0,
        revenueThisYear: 0,
        profitThisYear: 0,
        cogsThisYear: 0
      }))

      // Reset domestic contracts counter for new year
      set({ domesticContractsThisYear: 0 })

      // 1. Export Contracts (Rank 10+ only, once per year)
      const prestige = get().getPrestigeTier()
      if (prestige.rank >= 10 && state.lastExportYear !== newYear) {
        const higherClasses = Object.entries(carClasses)
          .filter(([_, cls]) => cls.socialClass === 'Higher')
          .map(([id, _]) => id as CarClassId)
          .filter(classId => finalCarModels.some(m => m.class === classId))

        if (higherClasses.length > 0) {
          const country = EXPORT_COUNTRIES[Math.floor(Math.random() * EXPORT_COUNTRIES.length)]
          const carClass = higherClasses[Math.floor(Math.random() * higherClasses.length)]
          const requestedQty = Math.floor(25 + Math.random() * 476) // 25-500

          const classModels = finalCarModels.filter(m => m.class === carClass)
          const pricePerUnit = classModels.length > 0 ? classModels[0].price : 0

          if (pricePerUnit > 0) {
            // Check inventory in current state (latest)
            const currentFactories = get().factories
            const eligibleFactories = currentFactories.filter(f =>
              f.producingModelId && finalCarModels.find(m => m.id === f.producingModelId)?.class === carClass
            )
            const totalInventory = eligibleFactories.reduce((sum, f) => sum + f.inventory, 0)
            const model = classModels[0]
            // Variable Pricing Logic
            const negotiationFactor = (Math.random() * 0.30) - 0.15
            let finalPrice = Math.floor(pricePerUnit * (1 + negotiationFactor))

            // Safety Check
            const currentCOGS = applyInflation(model.productionCost, model.inflationSensitivity || 1.0, currentMultiplier)
            if (finalPrice < currentCOGS * 1.05) {
              finalPrice = Math.floor(currentCOGS * 1.05)
            }

            const revenue = requestedQty * finalPrice
            const totalCost = requestedQty * currentCOGS
            const totalProfit = revenue - totalCost

            if (totalInventory >= requestedQty) {
              // Auto-Accept (Silent Resolve)
              const updatedFactories = currentFactories.map(f => ({ ...f })) // Shallow copy factories

              let remainingToDeduct = requestedQty
              updatedFactories.forEach(f => {
                // Match eligible filter again for safety or just loop all?
                // Only deduct from eligible
                if (f.producingModelId && finalCarModels.find(m => m.id === f.producingModelId)?.class === carClass) {
                  if (remainingToDeduct > 0 && f.inventory > 0) {
                    const take = Math.min(f.inventory, remainingToDeduct)
                    f.inventory -= take
                    remainingToDeduct -= take
                  }
                }
              })

              set(state => ({
                money: state.money + revenue,
                monthlyRevenue: state.monthlyRevenue + revenue,
                totalExportSalesAllTime: state.totalExportSalesAllTime + requestedQty,
                totalExportRevenueAllTime: state.totalExportRevenueAllTime + revenue,
                lastExportYear: newYear,
                factories: updatedFactories
              }))

              const details: TransactionDetails = {
                modelName: model.name,
                quantity: requestedQty,
                basePrice: pricePerUnit,
                finalPrice: finalPrice,
                negotiationPercent: negotiationFactor,
                totalRevenue: revenue,
                totalProfit: totalProfit
              }
              get().addLog('success', `KONTRAKT EKSPORTOWY: ${country} zakupił ${requestedQty} aut klasy ${carClass}! Przychód: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue)}`, details)
            } else {
              get().addLog('info', `Odrzucono eksport do ${country}: Niewystarczająca produkcja klasy ${carClass}`)
            }
            set({ lastExportYear: newYear })
          }
        }
      }

      // 2. Crisis Events: Once per year, Rank 5-20 (Silent Resolve)
      const prestigeCrisis = get().getPrestigeTier()
      if (prestigeCrisis.rank >= 5 && prestigeCrisis.rank <= 20 && state.lastCrisisYear !== newYear) {
        const baseCost = CRISIS_BASE_COSTS[Math.floor(Math.random() * CRISIS_BASE_COSTS.length)]
        const multiplier = prestigeCrisis.rank === 5 ? 1 : 4 * (prestigeCrisis.rank - 5)
        const totalCost = baseCost * multiplier
        const scenario = CRISIS_SCENARIOS[Math.floor(Math.random() * CRISIS_SCENARIOS.length)]

        set(s => ({
          money: s.money - totalCost,
          lastCrisisYear: newYear,
          totalCrisisCostsAllTime: s.totalCrisisCostsAllTime + totalCost
        }))
        get().addLog('danger', `Kryzys: ${scenario} - Zapłacono $${totalCost.toLocaleString()}`)
      }

      // 3. Resolve Active Auction (End of Year)
      const currentAuction = get().auction
      if (currentAuction && currentAuction.isOpen && newYear > currentAuction.year) {
        auctionTriggeredSet = true
        if (currentAuction.userBid > currentAuction.rivalBid) {
          // Win
          const newFactory: Factory = {
            id: `factory-${Date.now()}`,
            name: `Fabryka ${state.factories.length + 1}`,
            level: 1,
            capacity: 30, // HARDCORE MODE: 20 + (1 * 10) = 30
            currentProduction: 0,
            efficiency: 80,
            workers: 20, // Reduced from 50 to match new production scale
            upgradeCost: 50000,
            wageLevel: 1.0,
            status: 'active',
            producingModelId: null,
            productionTarget: 15, // Half of capacity
            inventory: 0
          }
          set(s => ({
            auction: null,
            isAuctionModalOpen: false,
            auctionResult: {
              won: true,
              year: currentAuction.year,
              bid: currentAuction.userBid,
              message: "Gratulacje! Twoja oferta byłą najwyższa. Zakupiłeś nową działkę ziemi i możesz postawić kolejną fabrykę."
            },
            factories: [...s.factories, newFactory],
            auctionsHeld: s.auctionsHeld + 1, // Legacy counter kept for compatibility
            auctionAttempts: s.auctionAttempts + 1, // New counter
            notifications: [`WYGRANA PRZETARGU! Zakupiłeś ziemię za ${currentAuction.userBid}.`, ...s.notifications],
            carModels: finalCarModels // Preserve carModels update
          }))
          get().addLog('success', `Aukcja: Wygrano przetarg za $${currentAuction.userBid.toLocaleString()}. Nowa fabryka dostępna.`)
        } else {
          // Lose (Refund)
          set(s => ({
            auction: null,
            isAuctionModalOpen: false,
            auctionResult: {
              won: false,
              year: currentAuction.year,
              bid: currentAuction.userBid,
              message: `Niestety, Twoja oferta (${currentAuction.userBid}) została przebita przez konkurencję (${currentAuction.rivalBid}). Środki zostały zwrócone na Twoje konto.`
            },
            money: s.money + currentAuction.userBid,
            notifications: [`PRZEGRANA PRZETARGU. Oferta ${currentAuction.userBid} była zbyt niska (Rywale: ${currentAuction.rivalBid}). Zwrot środków.`, ...s.notifications],
            auctionsHeld: s.auctionsHeld + 1, // Legacy
            auctionAttempts: s.auctionAttempts + 1, // New counter
            carModels: finalCarModels // Preserve carModels update
          }))
          get().addLog('info', `Aukcja: Przegrano przetarg (My: ${currentAuction.userBid}, Rywal: ${currentAuction.rivalBid}). Zwrot środków.`)
        }
      }

      const availableForResearch = Object.values(carClasses).filter(c => c.unlockYear === newYear)
      if (availableForResearch.length > 0) {
        const classNames = availableForResearch.map(c => c.name).join(", ")
        set(s => ({ notifications: [`Rok ${newYear}: Nowe projekty dostępne w Centrum Badań (${classNames})`, ...s.notifications] }))
      }




      // Marine & Aerospace: No automatic sales


      if (newYear % 5 === 0) {
        // Hardcore Condition: Max 5 attempts AND must have space under limit
        const limit = 9 + (state.factoryExpansionLevel * 4)
        if (state.auctionAttempts < 5 && state.factories.length < limit) {
          get().startAuction(newYear)
        }
      }
    }

    // FINAL STATE UPDATE FOR CAR MODELS (To ensure rollover applies)
    if (!auctionTriggeredSet) {
      set({ carModels: finalCarModels })
    }
  }, // END OF TICK

  rejectContractOffer: () => {
    set({ pendingContractOffer: null, isContractOfferModalOpen: false })
  },

  unlockClass: (classId) => {
    const state = get()
    const carClass = carClasses[classId as keyof typeof carClasses]
    if (!carClass) return

    // Validation
    if (state.unlockedClasses.includes(classId)) return
    if (state.money < carClass.researchCost) return
    const currentYear = state.gameDate.getFullYear()
    if (carClass.unlockYear && currentYear < carClass.unlockYear) return

    set({
      money: state.money - carClass.researchCost,
      unlockedClasses: [...state.unlockedClasses, classId],
      notifications: [`Technologia opracowana! Możesz teraz produkować pojazdy klasy: ${carClass.name}`, ...state.notifications]
    })
  },

  unlockTech: (techId) => {
    const state = get()
    const tech = techTree.find(t => t.id === techId)
    if (!tech) return

    if (state.unlockedFeatures.includes(techId)) return
    if (state.money < tech.cost) return
    if (state.gameDate.getFullYear() < tech.eraYear) return

    // Check prerequisites
    const missingPrereqs = tech.prerequisites.filter(p => !state.unlockedFeatures.includes(p))
    if (missingPrereqs.length > 0) return

    set({
      money: state.money - tech.cost,
      unlockedFeatures: [...state.unlockedFeatures, techId],
      notifications: [`Opracowano nową technologię: ${tech.name}`, ...state.notifications]
    })
  },

  unlockPart: (partId) => {
    const state = get()
    // Helper to find part in all options
    const allParts = [...engineOptions, ...chassisOptions, ...bodyOptions, ...interiorOptions]
    const part = allParts.find(p => p.value === partId)

    if (!part) return

    if (state.unlockedParts.includes(partId)) return
    if (state.money < part.researchCost) return
    const currentYear = state.gameDate.getFullYear()
    if (currentYear < part.unlockYear) return

    set({
      money: state.money - part.researchCost,
      unlockedParts: [...state.unlockedParts, partId],
      notifications: [`Nowy komponent opracowany: ${part.label}`, ...state.notifications]
    })
  },

  startResearch: (techId) => {
    // This action is removed as technologies are no longer part of the state.
  },

  buyDealership: () => {
    const state = get()
    const cost = 75000
    if (state.money < cost) return

    const newDealership: Dealership = {
      id: `dealer-${Date.now()}`,
      name: `Salon ${state.dealerships.length + 1}`,
      location: 'Nowa lokalizacja',
      salesCapacity: 20,
      workers: 20,
      salesThisMonth: 0,
      upgradeCost: 50000,
      level: 1,
      status: 'active',
      producingClassId: null,
      productionTarget: 20,
      inventory: 0
    }

    set({
      money: state.money - cost,
      dealerships: [...state.dealerships, newDealership],
      notifications: [`Zakupiono nowy salon sprzedaży! (-$${cost.toLocaleString()})`, ...state.notifications]
    })
  },

  upgradeDealership: (dealerId) => {
    const state = get()
    const dealer = state.dealerships.find(d => d.id === dealerId)
    if (!dealer) return
    if (dealer.level >= 5) return
    if (state.money < dealer.upgradeCost) return

    set({
      money: state.money - dealer.upgradeCost,
      dealerships: state.dealerships.map(d =>
        d.id === dealerId ? {
          ...d,
          level: d.level + 1,
          salesCapacity: d.salesCapacity + 10, // +10 capacity per level
          upgradeCost: Math.floor(d.upgradeCost * 1.5)
        } : d
      )
    })
  },

  toggleDealershipStatus: (dealerId) => {
    const state = get()
    set({
      dealerships: state.dealerships.map(d =>
        d.id === dealerId ? {
          ...d,
          status: d.status === 'active' ? 'idle' : 'active'
        } : d
      )
    })
  },

  // Bank Actions
  takeLoan: (amount) => {
    const state = get()
    // Validation handled in UI generally, but basic checks here
    if (amount <= 0) return

    set({
      money: state.money + amount,
      bank: {
        ...state.bank,
        loan: state.bank.loan + (amount * 1.5) // 50% Markup
      },
      notifications: [`Zaciągnięto kredyt: $${amount.toLocaleString()} (Do spłaty: $${(amount * 1.5).toLocaleString()})`, ...state.notifications]
    })
  },

  repayLoan: (amount) => {
    const state = get()
    if (amount <= 0) return
    const actualRepay = Math.min(amount, state.bank.loan, state.money)

    if (actualRepay <= 0) return

    const newLoanBalance = state.bank.loan - actualRepay

    set({
      money: state.money - actualRepay,
      bank: {
        ...state.bank,
        loan: newLoanBalance,
        // Reset payment stats if loan is fully paid off
        paymentStats: newLoanBalance <= 0 ? {
          ...state.bank.paymentStats,
          loanPaymentLastMonth: 0
        } : state.bank.paymentStats
      },
      notifications: [`Spłacono część długu: $${actualRepay.toLocaleString()}`, ...state.notifications]
    })
  },

  createDeposit: (amount: number) => {
    const state = get()
    // Sprawdź czy już istnieje lokata
    if (state.bank.activeDeposit !== null) {
      set({ notifications: ['Nie można utworzyć nowej lokaty. Wypłać istniejącą lokatę najpierw.', ...state.notifications] })
      return
    }
    if (amount <= 0 || state.money < amount) return

    const newDeposit: TermDeposit = {
      id: `dep-${Date.now()}`,
      initialAmount: amount,
      currentAmount: amount,
      startDate: state.gameDate.toISOString(),
      lastCompoundDate: null,
      totalYearsCompleted: 0,
      interestRate: 0.05
    }

    set({
      money: state.money - amount,
      bank: {
        ...state.bank,
        activeDeposit: newDeposit
      },
      notifications: [`Utworzono lokatę: $${amount.toLocaleString()} (5% rocznie)`, ...state.notifications]
    })
  },

  withdrawDeposit: () => {
    const state = get()
    const deposit = state.bank.activeDeposit
    if (!deposit) return

    // Oblicz ile pełnych lat upłynęło
    const depositStart = new Date(deposit.startDate)
    const now = state.gameDate
    const yearsHeld = Math.floor((now.getTime() - depositStart.getTime()) / (365 * 24 * 60 * 60 * 1000))

    // Oblicz wypłatę z compound interest tylko za pełne lata
    const payout = Math.floor(deposit.initialAmount * Math.pow(1.05, yearsHeld))
    const profit = payout - deposit.initialAmount

    set({
      money: state.money + payout,
      bank: {
        ...state.bank,
        activeDeposit: null,
        paymentStats: {
          ...state.bank.paymentStats,
          depositProfitLastMonth: profit  // Zapisz dla panelu Finanse
        }
      },
      notifications: [
        yearsHeld > 0
          ? `Wypłacono lokatę z zyskiem: $${payout.toLocaleString()} (Zysk: $${profit.toLocaleString()} za ${yearsHeld} lat)`
          : `Zerwano lokatę: $${payout.toLocaleString()} (Brak zysków - nie upłynął pełny rok)`,
        ...state.notifications
      ]
    })
  },

  upgradeFactory: (factoryId) => {
    const state = get()
    const factory = state.factories.find(f => f.id === factoryId)
    if (!factory) return

    if (factory.level >= 8) return // Hardcore cap reduced from 20

    if (state.money < factory.upgradeCost) return

    set({
      money: state.money - factory.upgradeCost,
      factories: state.factories.map(f =>
        f.id === factoryId
          ? {
            ...f,
            level: f.level + 1,
            capacity: f.capacity + 10, // Reduced from +25
            upgradeCost: Math.floor(f.upgradeCost * 1.5),
            workers: f.workers + 5  // HARDCORE MODE: Reduced from +50 to match new production scale
          }
          : f
      )
    })
  },

  toggleFactoryStatus: (factoryId) => {
    const state = get()
    set({
      factories: state.factories.map(f =>
        f.id === factoryId ? { ...f, status: f.status === 'idle' ? 'active' : 'idle' } : f
      )
    })
  },

  raiseFactoryWages: (factoryId) => {
    const state = get()
    set({
      factories: state.factories.map(f =>
        f.id === factoryId
          ? {
            ...f,
            efficiency: Math.min(100, f.efficiency + 5),
            wageLevel: f.wageLevel + 0.05
          }
          : f
      )
    })
  },

  updateFactorySettings: (factoryId, settings: Partial<Factory>) => {
    const state = get()
    set({
      factories: state.factories.map(f =>
        f.id === factoryId ? { ...f, ...settings } : f
      )
    })
  },

  startAuction: (year) => {
    const state = get()
    const yearsPassed = year - 1950
    const landValue = Math.floor(500000 * Math.pow(1.03, yearsPassed))
    const rivalFactor = 0.9 + Math.random() * 0.3
    const rivalBid = Math.floor(landValue * rivalFactor)

    set({
      auction: {
        year,
        landValue,
        estimatedValue: landValue,
        rivalBid,
        isOpen: true,
        userBid: 0
      },
      isAuctionModalOpen: true,
      notifications: ["Rozpoczął się przetarg na nową działkę przemysłową!", ...state.notifications]
    })
  },

  placeBid: (bid) => {
    const state = get()
    if (!state.auction || !state.auction.isOpen) return { success: false, message: "Przetarg zakończony." }

    const currentBid = state.auction.userBid
    const diff = bid - currentBid

    if (diff > 0 && state.money < diff) return { success: false, message: "Brak wystarczających środków." }

    set({
      money: state.money - diff, // Deduct difference (or refund if diff negative)
      auction: {
        ...state.auction,
        userBid: bid
      }
    })
    return { success: true, message: "Oferta zaktualizowana." }
  },

  buyLandFromDev: () => {
    const state = get()

    // Check Limits
    const limit = 9 + (state.factoryExpansionLevel * 4)
    if (state.factories.length >= limit) {
      get().addLog('danger', "Osiągnięto limit fabryk. Wykup ekspansję w panelu Korporacji.")
      return
    }

    const currentYear = state.gameDate.getFullYear()
    // Cap cost inflation at year 2050 (100 years) to prevent impossible prices
    const yearsPassed = Math.min(100, currentYear - 1950)
    const baseValue = Math.floor(500000 * Math.pow(1.03, yearsPassed))
    const devPrice = baseValue * 5

    if (state.money < devPrice) return

    const newFactory: Factory = {
      id: `factory-${Date.now()}`,
      name: `Fabryka ${state.factories.length + 1}`,
      level: 1,
      capacity: state.factories.length === 0 ? 100 : 20, // Nerf for subsequent factories
      currentProduction: 0,
      efficiency: 80,
      workers: 50,
      upgradeCost: 50000,
      wageLevel: 1.0,
      status: 'active',
      producingModelId: null,
      productionTarget: state.factories.length === 0 ? 80 : 16, // Auto-set proportional target (80% eff)
      inventory: 0
    }

    set({
      money: state.money - devPrice,
      factories: [...state.factories, newFactory],
      auction: null,
      notifications: [`Zakupiono ziemię od dewelopera za ${devPrice}.`, ...state.notifications]
    })
  },

  purchaseFactoryExpansion: () => {
    const state = get()
    if (state.gameDate.getFullYear() < 2025) return

    const level = state.factoryExpansionLevel
    // Cost: 500M * 1.2^level
    let cost = 500000000 * Math.pow(1.2, level)
    // Round to nearest million
    cost = Math.round(cost / 1000000) * 1000000

    if (state.money < cost) return

    set({
      money: state.money - cost,
      factoryExpansionLevel: level + 1,
      notifications: [`Ekspansja Przemysłowa (Poz. ${level + 1}): Limit fabryk zwiększony o +4!`, ...state.notifications]
    })
  },

  purchaseShowroomExpansion: () => {
    const state = get()
    if (state.gameDate.getFullYear() < 2025) return

    const level = state.showroomExpansionLevel
    // Cost: 250M * 1.2^level
    let cost = 250000000 * Math.pow(1.2, level)
    // Round to nearest million
    cost = Math.round(cost / 1000000) * 1000000

    if (state.money < cost) return

    set({
      money: state.money - cost,
      showroomExpansionLevel: level + 1,
      notifications: [`Ekspansja Sieci (Poz. ${level + 1}): Limit salonów zwiększony o +7!`, ...state.notifications]
    })
  },

  closeAuction: () => {
    set({ auction: null })
  },

  openAuctionModal: () => set({ isAuctionModalOpen: true }),

  closeAuctionModal: () => set({ isAuctionModalOpen: false }),

  closeAuctionResult: () => set({ auctionResult: null }),

  createCarModel: (model) => {
    const state = get()
    const newModel: CarModel = {
      ...model,
      id: `model-${Date.now()}`,
      salesThisMonth: 0,
      salesBreakdown: { Lower: 0, Middle: 0, Higher: 0 },
      totalSales: 0,
      totalProfit: 0,
      yearIntroduced: state.gameDate.getFullYear(),
      salesThisYear: 0,
      revenueThisYear: 0,
      profitThisYear: 0,
      cogsThisYear: 0,
      lastYearStats: {
        sales: 0,
        revenue: 0,
        profit: 0,
        cogs: 0
      }
    }

    set({
      carModels: [...state.carModels, newModel]
    })
  },

  updateCarModel: (modelId, updates) => {
    const state = get()
    set({
      carModels: state.carModels.map(model => {
        if (model.id !== modelId) return model
        // Check for structural changes that reset stats. 
        // Note: 'interior' label is not stored in CarModel, so we check 'interiorQuality' instead.
        const structuralKeys = ['engine', 'chassis', 'body', 'interiorQuality', 'class']
        const hasStructuralChanges = structuralKeys.some(key => updates[key as keyof CarModel] !== undefined && updates[key as keyof CarModel] !== model[key as keyof CarModel])

        if (hasStructuralChanges) {
          return {
            ...model,
            ...updates,
            salesThisMonth: 0,
            salesBreakdown: { Lower: 0, Middle: 0, Higher: 0 },
            totalSales: 0,
            totalProfit: 0,
            yearIntroduced: state.gameDate.getFullYear()
          }
        }
        return { ...model, ...updates }
      })
    })
  },

  deleteCarModel: (modelId) => {
    const state = get()
    set({
      carModels: state.carModels.filter(m => m.id !== modelId)
    })
  },

  payCrisisCost: () => {
    const state = get()
    if (!state.currentCrisis) return

    const cost = state.currentCrisis.cost

    set({
      money: state.money - cost,
      totalExpensesAllTime: state.totalExpensesAllTime + cost,
      totalCrisisCostsAllTime: state.totalCrisisCostsAllTime + cost,
      monthlyExpenses: state.monthlyExpenses + cost,
      isCrisisModalOpen: false,
      currentCrisis: null,
      gameSpeed: 1, // Reset to safe speed
      wasAutoPaused: false, // Clear auto-pause flag
      notifications: [
        `💸 Zdarzenie Nadzwyczajne: Zapłacono $${cost.toLocaleString()} z tytułu kryzysu operacyjnego.`,
        ...state.notifications.slice(0, 19)
      ]
    })
  },

  // Contract Actions
  // Contract Actions
  acceptContractOffer: () => {
    const state = get()
    const offer = state.pendingContractOffer
    if (!offer) return

    const fulfilledQty = Math.min(offer.availableInventory, offer.requestedQty)
    if (fulfilledQty === 0) {
      // No inventory, reject
      get().rejectContractOffer()
      return
    }

    const actualRevenue = fulfilledQty * offer.pricePerUnit

    // ... existing contract logic ...


    // Find relevant factories and deduct inventory
    let newFactories = [...state.factories]
    let newCarModels = [...state.carModels]

    // Get models of this class to distribute sales
    const classModels = newCarModels.filter(m => m.class === offer.carClass)

    // Find factories producing this class
    const eligibleFactories = newFactories.filter(f =>
      f.producingModelId && classModels.some(m => m.id === f.producingModelId)
    )

    // Calculate inventory before
    const inventoryBefore = eligibleFactories.reduce((sum, f) => sum + f.inventory, 0)


    // Deduct inventory proportionally
    let remaining = fulfilledQty
    newFactories = newFactories.map(f => {
      if (eligibleFactories.some(ef => ef.id === f.id) && remaining > 0) {
        const take = Math.min(f.inventory, remaining)
        remaining -= take
        return { ...f, inventory: f.inventory - take }
      }
      return f
    })

    // Calculate inventory after
    const eligibleFactoriesAfter = newFactories.filter(f =>
      f.producingModelId && classModels.some(m => m.id === f.producingModelId)
    )
    const inventoryAfter = eligibleFactoriesAfter.reduce((sum, f) => sum + f.inventory, 0)

    // Update model sales statistics (distribute across models)
    const salesPerModel = classModels.length > 0 ? Math.floor(fulfilledQty / classModels.length) : 0
    newCarModels = newCarModels.map(m => {
      if (m.class === offer.carClass) {
        return {
          ...m,
          totalSales: m.totalSales + salesPerModel
        }
      }
      return m
    })

    // Create history entry
    const historyEntry: ContractHistoryEntry = {
      id: `${offer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: offer.type,
      contractor: offer.contractor,
      carClass: offer.carClass,
      requestedQty: offer.requestedQty,
      fulfilledQty: fulfilledQty,
      pricePerUnit: offer.pricePerUnit,
      totalRevenue: actualRevenue,
      inventoryBefore: inventoryBefore,
      inventoryAfter: inventoryAfter,
      date: new Date(state.gameDate)
    }

    // Add to history (keep last 50)
    const newHistory = [historyEntry, ...state.contractHistory].slice(0, 50)

    // Update state based on contract type
    const updates: any = {
      money: state.money + actualRevenue,
      totalCarsSoldAllTime: state.totalCarsSoldAllTime + fulfilledQty,
      factories: newFactories,
      carModels: newCarModels,
      pendingContractOffer: null,
      isContractOfferModalOpen: false,
      contractHistory: newHistory,
      gameSpeed: 1, // Reset to safe speed
      wasAutoPaused: false // Clear auto-pause flag
    }

    if (offer.type === 'domestic') {
      updates.totalContractSalesAllTime = state.totalContractSalesAllTime + fulfilledQty
      updates.totalContractRevenueAllTime = state.totalContractRevenueAllTime + actualRevenue
      updates.domesticContractsThisYear = state.domesticContractsThisYear + 1
      updates.notifications = [
        `✅ Kontrakt Krajowy: ${offer.contractor} zakupiło ${fulfilledQty} sztuk klasy ${offer.carClass} po $${offer.pricePerUnit.toLocaleString()} za sztukę. Łączny zarobek: $${actualRevenue.toLocaleString()}!`,
        ...state.notifications.slice(0, 19)
      ]
    } else {
      updates.totalExportSalesAllTime = state.totalExportSalesAllTime + fulfilledQty
      updates.totalExportRevenueAllTime = state.totalExportRevenueAllTime + actualRevenue
      updates.lastExportYear = offer.offeredOn.getFullYear()
      updates.notifications = [
        `✅ Kontrakt Eksportowy: ${offer.contractor} zakupiło ${fulfilledQty} sztuk klasy ${offer.carClass} po $${offer.pricePerUnit.toLocaleString()} za sztukę. Łączny zarobek: $${actualRevenue.toLocaleString()}!`,
        ...state.notifications.slice(0, 19)
      ]
    }

    set(updates)
  },





  // Stock Market Actions
  buyShares: (companyId: string, amount: number) => {
    const state = get()
    const company = state.stockCompanies.find(c => c.id === companyId)
    if (!company) return

    const price = company.currentPrice
    const totalCost = price * amount * 1.01 // 1% commission

    if (state.money < totalCost) {
      get().addLog('danger', `Nieudany zakup akcji: Brak wystarczających środków ($${totalCost.toLocaleString()})`)
      return
    }

    const currentPortfolio = state.portfolio[companyId] || { shares: 0, avgBuyPrice: 0 }
    const newShares = currentPortfolio.shares + amount

    // Cap at 1 billion shares (100% of company)
    if (newShares > 1000000000) {
      get().addLog('danger', `Nieudany zakup: Nie możesz posiadać więcej niż 1 mld akcji (100% firmy).`)
      return
    }

    // Weighted Average Price
    const newAvgPrice = ((currentPortfolio.shares * currentPortfolio.avgBuyPrice) + (amount * price)) / newShares

    set({
      money: state.money - totalCost,
      currentMonthStockSpend: state.currentMonthStockSpend + (price * amount),
      currentMonthBrokerageFees: state.currentMonthBrokerageFees + (price * amount * 0.01),
      totalBrokerageFees: state.totalBrokerageFees + (price * amount * 0.01),

      portfolio: {
        ...state.portfolio,
        [companyId]: {
          shares: newShares,
          avgBuyPrice: parseFloat(newAvgPrice.toFixed(2))
        }
      }
    })
    get().addLog('success', `Kupiono ${amount.toLocaleString()} akcji ${company.name} za $${totalCost.toLocaleString()}`)
  },

  sellShares: (companyId: string, amount: number) => {
    const state = get()
    const company = state.stockCompanies.find(c => c.id === companyId)
    if (!company) return

    const currentPortfolio = state.portfolio[companyId]
    if (!currentPortfolio || currentPortfolio.shares < amount) {
      get().addLog('danger', `Nieudana sprzedaż: Posiadasz tylko ${currentPortfolio?.shares || 0} akcji.`)
      return
    }

    const price = company.currentPrice
    const revenue = price * amount * 0.99 // 1% commission
    const remainingShares = currentPortfolio.shares - amount

    // Update or Remove from portfolio
    const newPortfolio = { ...state.portfolio }
    if (remainingShares <= 0) {
      delete newPortfolio[companyId]
    } else {
      newPortfolio[companyId] = {
        ...currentPortfolio,
        shares: remainingShares
      }
    }

    const profit = revenue - (amount * currentPortfolio.avgBuyPrice) // Simple profit calc for log

    // Fees on sell are (price * amount * 0.01) - implicitly deducted from revenue?
    // User logic: revenue = price * amount * 0.99. So 1% is the fee.
    const fee = price * amount * 0.01

    set({
      money: state.money + revenue,
      currentMonthStockRevenue: state.currentMonthStockRevenue + revenue,
      currentMonthBrokerageFees: state.currentMonthBrokerageFees + fee,
      totalBrokerageFees: state.totalBrokerageFees + fee,
      totalRealizedStockProfit: state.totalRealizedStockProfit + profit,
      portfolio: newPortfolio
    })

    const profitMsg = profit >= 0 ? `Zysk: $${profit.toLocaleString()}` : `Strata: $${Math.abs(profit).toLocaleString()}`
    get().addLog('success', `Sprzedano ${amount.toLocaleString()} akcji ${company.name}. ${profitMsg}`)
  },

  // Retrofit Actions
  payForRetrofit: (amount: number, modelName: string, count: number) => {
    set((state) => {
      // Logic assumes check was done in UI, but double check safety
      if (state.money < amount) return state

      const newLog = {
        date: state.gameDate.toISOString().split('T')[0],
        type: 'info' as const,
        message: `Modernizacja ${count} sztuk modelu ${modelName}. Koszt: -$${amount.toLocaleString()}`
      }

      return {
        money: state.money - amount,
        logs: [newLog, ...state.logs]
      }
    })
  },

  // Corporation Panel Calculators
  getCompanyValuation: () => {
    const state = get()

    // Cash + Deposits
    const liquidAssets = state.money + (state.bank.activeDeposit ? state.bank.activeDeposit.currentAmount : 0)

    // Real Estate (Factories + Dealerships)
    const factoryValue = state.factories.length * 150000 // Current market price
    const dealershipValue = state.dealerships.length * 75000
    const realEstate = factoryValue + dealershipValue

    // Inventory Value (cars in parking)
    const inventoryValue = state.factories.reduce((sum, factory) => {
      const model = state.carModels.find(m => m.id === factory.producingModelId)
      return sum + (factory.inventory * (model?.price || 0))
    }, 0)

    // Stock Portfolio Value
    const stockCompanies = state.stockCompanies
    const portfolio = state.portfolio
    const portfolioValue = Object.entries(portfolio).reduce((sum, [id, item]) => {
      const company = stockCompanies.find(c => c.id === id)
      return sum + (company ? item.shares * company.currentPrice : 0)
    }, 0)

    return {
      total: liquidAssets + realEstate + inventoryValue + portfolioValue,
      liquidAssets,
      realEstate,
      inventoryValue,
      portfolioValue
    }
  },


  getPrestigeTier: () => {
    const sales = get().totalCarsSoldAllTime
    const tiers = [
      { min: 0, max: 1500, name: 'Garaż Hobbysty', rank: 1 },
      { min: 1500, max: 3500, name: 'Mały Producent', rank: 2 },
      { min: 3500, max: 8000, name: 'Lokalna Marka', rank: 3 },
      { min: 8000, max: 15000, name: 'Poważny Gracz', rank: 4 },
      { min: 15000, max: 25000, name: 'Solidna Firma', rank: 5 },
      { min: 25000, max: 40000, name: 'Znana Marka', rank: 6 },
      { min: 40000, max: 60000, name: 'Regionalny Lider', rank: 7 },
      { min: 60000, max: 90000, name: 'Krajowy Gracz', rank: 8 },
      { min: 90000, max: 130000, name: 'Potentat Rynkowy', rank: 9 },
      { min: 130000, max: 180000, name: 'Dominująca Marka', rank: 10 },
      { min: 180000, max: 250000, name: 'Gigant Motoryzacyjny', rank: 11 },
      { min: 250000, max: 350000, name: 'Europejski Tytan', rank: 12 },
      { min: 350000, max: 500000, name: 'Globalny Potentat', rank: 13 },
      { min: 500000, max: 700000, name: 'Międzynarodowa Ikona', rank: 14 },
      { min: 700000, max: 1000000, name: 'Legenda Branży', rank: 15 },
      { min: 1000000, max: 1500000, name: 'Imperium Auto', rank: 16 },
      { min: 1500000, max: 2500000, name: 'Kolos Motoryzacji', rank: 17 },
      { min: 2500000, max: 4000000, name: 'Hegemon Światowy', rank: 18 },
      { min: 4000000, max: 7000000, name: 'Przemysłowy Tytan', rank: 19 },
      { min: 7000000, max: 10000000, name: 'Legenda Motoryzacji', rank: 20 },
      { min: 10000000, max: Infinity, name: 'Imperator Automotive', rank: 21 },
    ]
    const currentTier = tiers.find(t => sales >= t.min && sales < t.max) || tiers[0]
    const nextTier = tiers.find(t => t.rank === currentTier.rank + 1)
    return {
      ...currentTier,
      nextTierThreshold: nextTier?.min,
      salesProgress: sales
    }
  },

  getMarketDominance: () => {
    const state = get()
    const classSales: Record<string, { totalSales: number; totalRevenue: number; totalCOGS: number }> = {}

    state.carModels.forEach(model => {
      if (!classSales[model.class]) {
        classSales[model.class] = { totalSales: 0, totalRevenue: 0, totalCOGS: 0 }
      }
      classSales[model.class].totalSales += model.totalSales
      classSales[model.class].totalRevenue += model.totalSales * model.price
      classSales[model.class].totalCOGS += (model.totalProfit !== undefined && model.totalSales > 0)
        ? (model.totalSales * model.price - model.totalProfit)
        : 0
    })

    return classSales
  },

  // Save System Implementation
  serializeState: () => {
    const state = get()

    // 1. Create Clean Object (omit actions and temp UI state function keys)
    // We only need data fields. JSON.stringify effectively drops functions.
    // However, we want to omit volatile UI state like modals.

    const persistentState: Partial<GameState> = {
      // Time
      gameDate: state.gameDate,
      era: state.era,
      gameSpeed: state.gameSpeed,
      wasAutoPaused: state.wasAutoPaused,

      // Finances
      money: state.money,
      monthlyRevenue: state.monthlyRevenue,
      monthlyExpenses: state.monthlyExpenses,
      baseExpenses: state.baseExpenses,
      inflationRate: state.inflationRate,
      economicMultiplier: state.economicMultiplier,
      currency: state.currency,

      // City
      cityPopulation: state.cityPopulation,
      cityCapacity: state.cityCapacity,
      baseGrowthRate: state.baseGrowthRate,
      minGrowthRate: state.minGrowthRate,
      cityGrowthRate: state.cityGrowthRate,

      // Market
      marketDemand: state.marketDemand,
      previousMarketDemandTotal: state.previousMarketDemandTotal,
      marketNoise: state.marketNoise,

      // Stats
      totalRevenueAllTime: state.totalRevenueAllTime,
      totalExpensesAllTime: state.totalExpensesAllTime,
      totalCarsProducedAllTime: state.totalCarsProducedAllTime,
      totalCarsSoldAllTime: state.totalCarsSoldAllTime,
      totalExportSalesAllTime: state.totalExportSalesAllTime,
      totalExportRevenueAllTime: state.totalExportRevenueAllTime,
      totalContractSalesAllTime: state.totalContractSalesAllTime,
      totalContractRevenueAllTime: state.totalContractRevenueAllTime,
      totalCrisisCostsAllTime: state.totalCrisisCostsAllTime,
      lastCrisisYear: state.lastCrisisYear,
      lastExportYear: state.lastExportYear,
      domesticContractsThisYear: state.domesticContractsThisYear,

      // Stock Market Financials
      currentMonthStockRevenue: state.currentMonthStockRevenue,
      currentMonthStockSpend: state.currentMonthStockSpend,
      currentMonthBrokerageFees: state.currentMonthBrokerageFees,
      totalRealizedStockProfit: state.totalRealizedStockProfit,
      totalBrokerageFees: state.totalBrokerageFees,
      contractHistory: state.contractHistory,

      // Stock Market
      stockCompanies: state.stockCompanies,
      portfolio: state.portfolio,

      // Bank
      bank: state.bank,

      // Assets
      carModels: state.carModels,
      unlockedClasses: state.unlockedClasses,
      unlockedParts: state.unlockedParts,
      unlockedFeatures: state.unlockedFeatures,
      factories: state.factories,
      dealerships: state.dealerships,

      salesHistory: state.salesHistory,
      notifications: state.notifications,
      logs: state.logs,
      auctionsHeld: state.auctionsHeld,

      // Hardcore Economy
      auctionAttempts: state.auctionAttempts,
      globalFactoryLimit: state.globalFactoryLimit,
      globalShowroomLimit: state.globalShowroomLimit,
      factoryExpansionLevel: state.factoryExpansionLevel,
      showroomExpansionLevel: state.showroomExpansionLevel,

      // UI State (Persist some preferences)
      activeTab: state.activeTab,
      dashboardChartMode: state.dashboardChartMode,
    }

    // JSON.stringify will handle dates as ISO strings
    return JSON.stringify(persistentState, null, 2)
  },

  loadFromData: (data: any) => {
    try {
      if (!data) return

      // SAFE DEEP MERGE with reviving Date objects
      // Parse dates manually since JSON.parse gave us strings

      const parsedGameDate = data.gameDate ? new Date(data.gameDate) : new Date(1950, 1, 1)

      // Validate Date
      if (isNaN(parsedGameDate.getTime())) {
        console.error("Invalid gameDate in save", data.gameDate)
        // Fallback or abort? Let's use current default or what was passed if possible
      }

      // Restore Arrays (if missing in save, default to empty)
      const stockCompanies = data.stockCompanies || generateInitialCompanies()
      const portfolio = data.portfolio || {}

      set((state) => ({
        ...state,
        ...data,
        gameDate: parsedGameDate,
        // Ensure complex objects are not undefined
        marketDemand: data.marketDemand || state.marketDemand,
        marketNoise: data.marketNoise || state.marketNoise,
        bank: data.bank || state.bank,
        stockCompanies: stockCompanies,
        portfolio: portfolio,
        // Reset Volatile State
        isPaused: true, // Always load paused
        wasAutoPaused: false,
        isAuctionModalOpen: false,
        auctionResult: null,
        isCrisisModalOpen: false,
        currentCrisis: null,
        pendingContractOffer: null,
        isContractOfferModalOpen: false,
      }))

      // Force UI refresh or log
      console.log("Save Loaded Successfully", data)
    } catch (e) {
      console.error("Failed to load save data", e)
    }
  },

  saveToSlot: (slotId: string) => {
    const json = get().serializeState()
    const key = `auto-tycoon-save-${slotId}`
    const metaKey = `auto-tycoon-meta-${slotId}`

    try {
      localStorage.setItem(key, json)

      // Metadata for UI (Quick view without detailed parsing)
      const meta = {
        date: new Date().toISOString(),
        gameDate: get().gameDate.toISOString(),
        money: get().money,
        companyName: "Moja Firma" // Placeholder if we add company name later
      }
      localStorage.setItem(metaKey, JSON.stringify(meta))

      get().addLog('success', `Gra zapisana (Slot: ${slotId})`)
    } catch (e) {
      console.error("Save to LocalStorage failed", e)
      get().addLog('danger', `Błąd zapisu! (Quota exceeded?)`)
    }
  },

  loadFromSlot: (slotId: string) => {
    const key = `auto-tycoon-save-${slotId}`
    try {
      const json = localStorage.getItem(key)
      if (!json) return false

      const data = JSON.parse(json)
      get().loadFromData(data)
      get().addLog('success', `Wczytano grę (Slot: ${slotId})`)
      return true
    } catch (e) {
      console.error("Load from LocalStorage failed", e)
      get().addLog('danger', `Błąd wczytywania zapisu!`)
      return false
    }
  },

  deleteSlot: (slotId: string) => {
    const key = `auto-tycoon-save-${slotId}`
    const metaKey = `auto-tycoon-meta-${slotId}`
    localStorage.removeItem(key)
    localStorage.removeItem(metaKey)
  }

}))

