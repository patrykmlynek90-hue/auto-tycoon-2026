
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGameStore, TransactionDetails, BankruptcyDetails } from "@/lib/game-store"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { LogDetailsModal } from "./modals/log-details-modal"
import { BankruptcyModal } from "./modals/bankruptcy-modal"

type LogEntry = {
    date: string
    type: 'success' | 'danger' | 'info'
    message: string
    details?: TransactionDetails
    bankruptcyDetails?: BankruptcyDetails
}

export function NotificationLog() {
    const { logs } = useGameStore()
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

    if (logs.length === 0) return null

    return (
        <div className="border-t border-sidebar-border p-3 bg-secondary/20">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Log Systemowy</h4>
            <ScrollArea className="h-[200px] w-full rounded border border-border/50 bg-background/50">
                <div className="p-2 space-y-2">
                    {logs.map((log, index) => (
                        <div
                            key={`${log.date}-${index}`}
                            className={cn(
                                "text-xs space-y-0.5",
                                (log.details || log.bankruptcyDetails) && "cursor-pointer hover:bg-white/5 p-1 rounded -mx-1 transition-colors"
                            )}
                            onClick={() => (log.details || log.bankruptcyDetails) && setSelectedLog(log)}
                        >
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{log.date}</span>
                                <div className="flex items-center gap-1">
                                    {(log.details || log.bankruptcyDetails) && <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">INFO</span>}
                                    {log.type === 'danger' && <span className="text-red-500 font-bold">!</span>}
                                    {log.type === 'success' && <span className="text-green-500 font-bold">$</span>}
                                </div>
                            </div>
                            <p className={cn(
                                "leading-tight",
                                log.type === 'danger' && "text-red-400",
                                log.type === 'success' && "text-green-400",
                                log.type === 'info' && "text-foreground/80",
                                // Custom coloring for Insider News
                                log.message.includes('wyprzedza') && "text-green-400 font-medium",
                                log.message.includes('Analitycy') && "text-green-400 font-medium",
                                log.message.includes('Przecieki') && "text-orange-400 font-medium",
                                log.message.includes('Problemy') && "text-orange-400 font-medium"
                            )}>
                                {log.message}
                            </p>
                            <div className="h-px w-full bg-border/30 mt-1" />
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <LogDetailsModal
                isOpen={!!selectedLog && !selectedLog?.bankruptcyDetails}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
            <BankruptcyModal
                isOpen={!!selectedLog && !!selectedLog?.bankruptcyDetails}
                onClose={() => setSelectedLog(null)}
                details={selectedLog?.bankruptcyDetails || null}
            />
        </div>
    )
}
