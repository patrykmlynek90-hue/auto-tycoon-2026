"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameStore } from "@/lib/game-store"
import { cn } from "@/lib/utils"
import {
    TrendingUp,
    AlertTriangle,
    Eye,
    Zap,
    AlertOctagon,
    Award,
    Info
} from "lucide-react"

type LogCategory = {
    color: string
    Icon: typeof Info
    badgeColor: string
}

// Analyze message content and return appropriate category
function getLogCategory(message: string, type: 'success' | 'danger' | 'info'): LogCategory {
    const msg = message.toLowerCase()

    // CRITICAL (Rose)
    if (msg.includes('awaria') || msg.includes('pożar') || msg.includes('bankructwo') || msg.includes('strata')) {
        return {
            color: 'text-rose-400',
            Icon: AlertOctagon,
            badgeColor: 'bg-rose-900/30 text-rose-400'
        }
    }

    // STOCK WARNING (Amber)
    if (msg.includes('przecieki') || msg.includes('problemy') || msg.includes('spadek')) {
        return {
            color: 'text-amber-400',
            Icon: AlertTriangle,
            badgeColor: 'bg-amber-900/30 text-amber-400'
        }
    }

    // STOCK POSITIVE (Emerald)
    if (msg.includes('analitycy') || msg.includes('wyprzedza') || msg.includes('zysk') || msg.includes('sukces')) {
        return {
            color: 'text-emerald-400',
            Icon: TrendingUp,
            badgeColor: 'bg-emerald-900/30 text-emerald-400'
        }
    }

    // REWARD (Yellow)
    if (msg.includes('kontrakt') || msg.includes('odblokowano') || msg.includes('nagroda')) {
        return {
            color: 'text-yellow-400',
            Icon: Award,
            badgeColor: 'bg-yellow-900/30 text-yellow-400'
        }
    }

    // INFO (Blue/Zinc - default)
    return {
        color: type === 'success' ? 'text-green-400' : type === 'danger' ? 'text-red-400' : 'text-blue-400',
        Icon: Info,
        badgeColor: 'bg-blue-900/30 text-blue-400'
    }
}

export function NewsFeedPanel() {
    const { logs } = useGameStore()

    if (logs.length === 0) {
        return (
            <div className="w-full h-[280px] bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Brak wiadomości</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                📡 Centrum Operacyjne
            </h3>
            <ScrollArea className="w-full h-[280px] bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="divide-y divide-zinc-900">
                    {logs.map((log, index) => {
                        const category = getLogCategory(log.message, log.type)
                        const Icon = category.Icon

                        return (
                            <div
                                key={`${log.date}-${index}`}
                                className="px-4 py-3 hover:bg-zinc-900/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={cn("p-1.5 rounded shrink-0", category.badgeColor)}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                {log.date}
                                            </span>
                                        </div>
                                        <p className={cn("text-sm leading-tight", category.color)}>
                                            {log.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
