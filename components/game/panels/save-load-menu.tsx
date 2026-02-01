"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game-store"
import { Save, Download, Upload, Trash2, HardDrive, FileJson, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface SaveSlotMeta {
    date: string      // Real date of save
    gameDate: string  // In-game date
    money: number
    companyName: string
}

export function SaveLoadMenu() {
    const { serializeState, loadFromData, saveToSlot, loadFromSlot, deleteSlot, gameDate, money } = useGameStore()
    const [slots, setSlots] = useState<{ [key: string]: SaveSlotMeta | null }>({
        "1": null,
        "2": null,
        "autosave": null
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load metadata on mount
    useEffect(() => {
        refreshSlots()
    }, [])

    const refreshSlots = () => {
        const newSlots: any = {}
            ;['1', '2', 'autosave'].forEach(id => {
                const metaJson = localStorage.getItem(`auto-tycoon-meta-${id}`)
                if (metaJson) {
                    try {
                        newSlots[id] = JSON.parse(metaJson)
                    } catch {
                        newSlots[id] = null
                    }
                } else {
                    newSlots[id] = null
                }
            })
        setSlots(newSlots)
    }

    const handleSave = (id: string) => {
        saveToSlot(id)
        refreshSlots()
    }

    const handleLoad = (id: string) => {
        if (confirm("Czy na pewno chcesz wczytać grę? Utracisz niezapisane postępy.")) {
            loadFromSlot(id)
        }
    }

    const handleDelete = (id: string) => {
        if (confirm("Czy na pewno chcesz usunąć ten zapis?")) {
            deleteSlot(id)
            refreshSlots()
        }
    }

    const handleDownload = () => {
        const json = serializeState()
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const dateStr = format(gameDate, 'yyyy-MM-dd')
        link.download = `auto-tycoon-save-${dateStr}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string
                const data = JSON.parse(json)

                if (confirm("Wczytać grę z pliku? Obecny postęp zostanie nadpisany.")) {
                    loadFromData(data)
                }
            } catch (err) {
                alert("Błąd odczytu pliku zapisu!")
                console.error(err)
            }
        }
        reader.readAsText(file)
        // Clear input so same file can be selected again
        e.target.value = ''
    }

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">

                {/* SECTION A: LOCAL SLOTS */}
                <Card className="bg-card border-border md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-primary" />
                            Sloty Lokalne (Przeglądarka)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {['1', '2', 'autosave'].map(slotId => {
                            const meta = slots[slotId]
                            const isAuto = slotId === 'autosave'

                            return (
                                <div key={slotId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-foreground uppercase">
                                                {isAuto ? "Autosave" : `Slot ${slotId}`}
                                            </span>
                                            {meta && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {new Date(meta.date).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        {meta ? (
                                            <div className="text-sm text-muted-foreground flex gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(meta.gameDate).getFullYear()}
                                                </span>
                                                <span className="text-emerald-500 font-mono">
                                                    ${meta.money.toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Pusty slot</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isAuto && (
                                            <Button variant="outline" size="sm" onClick={() => handleSave(slotId)}>
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        )}

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={!meta}
                                            onClick={() => handleLoad(slotId)}
                                        >
                                            Wczytaj
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10"
                                            disabled={!meta}
                                            onClick={() => handleDelete(slotId)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* SECTION B: FILE BACKUP */}
                <Card className="bg-card border-border md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-blue-400" />
                            Kopia Zapasowa (Plik)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-secondary/20 p-4 rounded-lg border border-border text-sm text-muted-foreground">
                            <p>
                                Pobierz plik <strong>.json</strong> na dysk, aby przenieść zapis na inny komputer lub zrobić bezpieczną kopię zapasową.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Button onClick={handleDownload} className="w-full flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Pobierz Zapis na Dysk
                            </Button>

                            <div className="relative">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4" />
                                    Wczytaj z Pliku
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
