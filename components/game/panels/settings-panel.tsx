"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Settings,
  Volume2,
  Bell,
  Moon,
  Info,
  HardDrive
} from "lucide-react"
import { SaveLoadMenu } from "./save-load-menu"

export function SettingsPanel() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Ustawienia</h2>
        <p className="text-muted-foreground">Konfiguracja gry i preferencje</p>
      </div>

      <SaveLoadMenu />

      <div className="grid grid-cols-2 gap-6">
        {/* Game Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-muted-foreground" />
              Ustawienia Gry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Autopauza</Label>
                <p className="text-xs text-muted-foreground">
                  Pauzuj grę przy ważnych wydarzeniach
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Szybkie Badania</Label>
                <p className="text-xs text-muted-foreground">
                  Automatycznie rozpoczynaj kolejne badania
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Podpowiedzi</Label>
                <p className="text-xs text-muted-foreground">
                  Pokaż wskazówki dla nowych graczy
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              Dźwięk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Głośność Ogólna</Label>
                <span className="text-sm text-muted-foreground">80%</span>
              </div>
              <Slider defaultValue={[80]} max={100} step={1} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Muzyka</Label>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Slider defaultValue={[60]} max={100} step={1} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Efekty</Label>
                <span className="text-sm text-muted-foreground">70%</span>
              </div>
              <Slider defaultValue={[70]} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              Powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Ukończone Badania</Label>
                <p className="text-xs text-muted-foreground">
                  Powiadom gdy badanie się zakończy
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Raporty Finansowe</Label>
                <p className="text-xs text-muted-foreground">
                  Miesięczne podsumowanie finansów
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Nowe Ery</Label>
                <p className="text-xs text-muted-foreground">
                  Powiadom o przejściu do nowej ery
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <Moon className="w-5 h-5 text-muted-foreground" />
              Wyświetlanie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Tryb Ciemny</Label>
                <p className="text-xs text-muted-foreground">
                  Zawsze włączony dla tej gry
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Animacje</Label>
                <p className="text-xs text-muted-foreground">
                  Włącz animacje interfejsu
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Kompaktowy Widok</Label>
                <p className="text-xs text-muted-foreground">
                  Zmniejsz odstępy w interfejsie
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            O Grze
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Wersja</p>
              <p className="font-medium text-foreground">0.1.0 Alpha</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Technologia</p>
              <p className="font-medium text-foreground">React / Next.js</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Silnik UI</p>
              <p className="font-medium text-foreground">Tailwind CSS / shadcn/ui</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Auto Tycoon</strong> to gra typu manager,
              w której budujesz i rozwijasz korporację motoryzacyjną od lat 50. XX wieku.
              Projektuj samochody, badaj nowe technologie, zarządzaj fabrykami i salonami
              sprzedaży, aby stać się liderem rynku motoryzacyjnego.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
