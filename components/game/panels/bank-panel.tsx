"use client"

import { useGameStore } from "@/lib/game-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Banknote,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Landmark,
    PiggyBank,
    AlertCircle,
    Calendar,
    Unlock,
    Lock
} from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency-formatter"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

export function BankPanel() {
    const {
        money,
        bank,
        gameDate,
        takeLoan,
        repayLoan,
        createDeposit,
        withdrawDeposit
    } = useGameStore()
    const formatMoney = useCurrencyFormatter()

    const [repayAmount, setRepayAmount] = useState(0)
    const [depositAmount, setDepositAmount] = useState(100000)

    // Credit Logic
    const monthlyPayment = Math.ceil(bank.loan / 120) // 10 Years = 120 Months
    const loanOptions = [100000, 500000, 1000000, 5000000]

    // Deposit Logic
    const activeDepositsTotal = bank.activeDeposit ? bank.activeDeposit.currentAmount : 0

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Landmark className="w-8 h-8 text-primary" />
                        Bank Centralny (Tycoon)
                    </h2>
                    <p className="text-muted-foreground">
                        Kapitał dla przedsiębiorców. Kredyty 10-letnie i Lokaty Terminowe.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Aktualne Środki</p>
                    <p className="text-3xl font-bold text-foreground">
                        {formatMoney(money)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Status Cards */}
                <Card className="bg-card border-border">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-destructive/10">
                                <ArrowDownRight className="w-6 h-6 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Całkowite Zadłużenie</p>
                                <p className="text-2xl font-bold text-foreground">{formatMoney(bank.loan)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Miesięczna Rata (Zmienna)</p>
                            <p className="text-lg font-bold text-destructive">{formatMoney(monthlyPayment)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <PiggyBank className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Zablokowane w Lokatach</p>
                                <p className="text-2xl font-bold text-foreground">{formatMoney(activeDepositsTotal)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Status Lokaty</p>
                            <p className={`text-lg font-bold ${bank.activeDeposit ? "text-green-500" : "text-muted-foreground"}`}>
                                {bank.activeDeposit ? "Aktywna" : "Brak"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="credit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credit">Kredyt Inwestycyjny</TabsTrigger>
                    <TabsTrigger value="savings">Lokaty Terminowe</TabsTrigger>
                </TabsList>

                {/* CREDIT TAB */}
                <TabsContent value="credit" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Oferta Kredytowa (Tycoon Loan)</CardTitle>
                            <CardDescription>
                                Kredyt na 10 lat. Koszt całkowity 50% doliczany z góry. Rata to 1/120 aktualnego zadłużenia.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Loan Options */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {loanOptions.map(amount => (
                                    <Button
                                        key={amount}
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center gap-1 hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => takeLoan(amount)}
                                        disabled={(bank.loan + (amount * 1.5)) > 7500000}
                                    >
                                        <span className="text-lg font-bold">{formatMoney(amount)}</span>
                                        <span className="text-xs text-muted-foreground">Koszt: {formatMoney(amount * 1.5)}</span>
                                        <span className="text-xs text-destructive">+{formatMoney((amount * 1.5) / 120)}/mc</span>
                                    </Button>
                                ))}
                            </div>

                            {/* Repayment */}
                            <div className="p-6 bg-accent/5 rounded-xl border border-border space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Banknote className="w-4 h-4" />
                                        Nadpłata Kredytu
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Kwota spłaty</label>
                                        <span className="text-xl font-bold">{formatMoney(repayAmount)}</span>
                                    </div>
                                    <Slider
                                        value={[repayAmount]}
                                        min={0}
                                        max={Math.min(money, bank.loan)}
                                        step={10000}
                                        onValueChange={(vals) => setRepayAmount(vals[0])}
                                    />
                                    <Button
                                        onClick={() => repayLoan(repayAmount)}
                                        disabled={repayAmount <= 0}
                                        className="w-full"
                                    >
                                        Dokonaj Nadpłaty
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Nadpłata zmniejsza kapitał, co automatycznie obniża przyszłe raty.
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SAVINGS TAB */}
                <TabsContent value="savings" className="space-y-4 mt-4">
                    {/* Active Deposit Info */}
                    {bank.activeDeposit ? (
                        <Card className="border-green-500/50 bg-green-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <TrendingUp className="w-6 h-6" />
                                    Twoja Aktywna Lokata (Procent Składany)
                                </CardTitle>
                                <CardDescription>
                                    Oprocentowanie 5% rocznie. Kapitalizacja odsetek następuje co pełny rok.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground">Wpłacony Kapitał</p>
                                        <p className="text-xl font-bold">{formatMoney(bank.activeDeposit.initialAmount)}</p>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground">Aktualna Wartość</p>
                                        <p className="text-xl font-bold text-green-600">{formatMoney(bank.activeDeposit.currentAmount)}</p>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground">Czas Trwania</p>
                                        <p className="text-xl font-bold">{bank.activeDeposit.totalYearsCompleted} Lat</p>
                                    </div>
                                    <div className="p-4 bg-background/50 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground">Następna Kapitalizacja</p>
                                        <p className="text-xl font-bold text-green-600">
                                            +{formatMoney(Math.floor(bank.activeDeposit.currentAmount * 0.05))}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        <div className="text-sm">
                                            <p className="font-medium text-yellow-600">Zasady Wypłaty</p>
                                            <p className="text-muted-foreground">
                                                Wypłata teraz oznacza utratę odsetek za bieżący, niedokończony rok.
                                                Zyskasz jedynie odsetki za {bank.activeDeposit.totalYearsCompleted} pełnych lat.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => withdrawDeposit()} // No ID needed now
                                        className="hover:bg-destructive hover:text-destructive-foreground border-destructive/50 text-destructive"
                                    >
                                        Wypłać / Zerwij
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Utwórz Lokatę Kapitałową (5% Rocznie)</CardTitle>
                                <CardDescription>
                                    Wpłać środki na procent składany. Odsetki są dopisywane do kapitału co roku. Możesz trzymać środki dowolną ilość lat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-6 bg-accent/5 rounded-xl border border-border space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium">Kwota Lokaty</label>
                                            <span className="text-xl font-bold">{formatMoney(depositAmount)}</span>
                                        </div>
                                        <Slider
                                            value={[depositAmount]}
                                            min={100000}
                                            max={Math.max(100000, money)}
                                            step={50000}
                                            onValueChange={(vals) => setDepositAmount(vals[0])}
                                        />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Prognozowany Zysk (po 1 roku):</span>
                                            <span className="font-bold text-green-500">+{formatMoney(Math.floor(depositAmount * 0.05))}</span>
                                        </div>
                                        <Button
                                            onClick={() => createDeposit(depositAmount)}
                                            disabled={money < depositAmount}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            Załóż Lokatę
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
