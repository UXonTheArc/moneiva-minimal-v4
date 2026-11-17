"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Mail, PhoneIncoming } from "lucide-react"
import { toast } from "sonner"

import { moveStage, useStages } from "@/components/m/store"
import { Card, Segmented } from "@/components/m/ui"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CALL_TYPES, REQUEST_TYPES, STAGES, type RequestType, type Stage } from "@/lib/moneiva/data"

/** The four steps, worded for selling: what happens at each one. */
export const STEP: Record<Stage, { n: number; name: string; does: string }> = {
  Learn: { n: 1, name: "Learn", does: "Reads past email and documents. Nothing is sent." },
  Shadow: { n: 2, name: "Shadow", does: "Watches live work and guesses what your team will do." },
  Review: { n: 3, name: "Review", does: "Does the work. A person approves it first." },
  Autopilot: { n: 4, name: "Autopilot", does: "Does it alone. Everything shows in Activity." },
}

type Kind = RequestType & { agent: "email" | "call" }
const ALL: Kind[] = [...REQUEST_TYPES.map((t) => ({ ...t, agent: "email" as const })), ...CALL_TYPES.map((t) => ({ ...t, agent: "call" as const }))]

export function useStageCounts() {
  const stageOf = useStages()
  return STAGES.map((s) => ({ stage: s, count: ALL.filter((t) => stageOf(t.name, t.stage) === s).length }))
}

/** Today: the four steps in one line, each a jump into the board. */
export function StageStrip() {
  const counts = useStageCounts()
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {counts.map(({ stage, count }, i) => (
        <Link key={stage} href={`/teach?step=${stage}#board`} className="group relative">
          <Card className="h-full px-2 py-3 text-center transition group-hover:shadow-md sm:p-5 sm:text-left">
            <div className="flex flex-col items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:flex-row sm:gap-2 sm:text-[12px]">
              <span className={cn("grid size-5 place-items-center rounded-full text-[11px] text-white", stage === "Autopilot" ? "bg-ok" : "bg-primary")}>{i + 1}</span>
              {STEP[stage].name}
            </div>
            <div className="mt-2 text-[24px] leading-none font-bold tracking-tight tabular-nums sm:text-[32px]">{count}</div>
            <div className="mt-1 hidden text-[13px] text-muted-foreground sm:block">{count === 1 ? "kind of request" : "kinds of request"}</div>
          </Card>
          {i < 3 && <ArrowRight className="absolute top-1/2 -right-[11px] z-10 hidden size-4 -translate-y-1/2 text-muted-foreground/50 sm:block" />}
        </Link>
      ))}
    </div>
  )
}

/** Teach: every request type, in the step it has reached. Like the old Playbook board. */
export function StageBoard({ focus }: { focus?: Stage }) {
  const stageOf = useStages()
  const [who, setWho] = useState<"all" | "email" | "call">("all")
  const [open, setOpen] = useState<Kind | null>(null)
  const list = ALL.filter((t) => who === "all" || t.agent === who)

  return (
    <section id="board" className="mb-12 scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">Every kind of request, step by step</h2>
          <p className="text-[13px] text-muted-foreground">Each one moves up on its own schedule, and only when you say so.</p>
        </div>
        <Segmented
          value={who}
          onChange={setWho}
          options={[
            { value: "all", label: "All" },
            { value: "email", label: "Email and texts" },
            { value: "call", label: "Calls" },
          ]}
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[880px] grid-cols-4 gap-3">
          {STAGES.map((st) => {
            const items = list.filter((t) => stageOf(t.name, t.stage) === st)
            return (
              <div key={st} className={cn("flex flex-col rounded-2xl bg-secondary/60 p-2", focus === st && "bg-primary/10")}>
                <div className="px-2 pt-2 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("grid size-6 place-items-center rounded-full text-[12px] font-semibold text-white", st === "Autopilot" ? "bg-ok" : "bg-primary")}>
                      {STEP[st].n}
                    </span>
                    <span className="text-[17px] font-semibold">{STEP[st].name}</span>
                    <span className="ml-auto text-[13px] text-muted-foreground tabular-nums">{items.length}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">{STEP[st].does}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((t) => (
                    <button key={t.name} onClick={() => setOpen(t)} className="text-left">
                      <Card className="p-3 transition hover:shadow-md">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 text-muted-foreground [&_svg]:size-3.5">{t.agent === "email" ? <Mail /> : <PhoneIncoming />}</span>
                          <span className="text-[14px] leading-snug font-medium">{t.name}</span>
                        </div>
                        <div className="mt-1 pl-[22px] text-[12px] text-muted-foreground">
                          {t.flag === "ready" && stageOf(t.name, t.stage) === t.stage ? (
                            <span className="font-medium text-primary">Ready to move up</span>
                          ) : t.of ? (
                            `${t.matched} of ${t.of} like your team`
                          ) : (
                            t.line
                          )}
                        </div>
                      </Card>
                    </button>
                  ))}
                  {!items.length && <p className="px-2 pb-2 text-[13px] text-muted-foreground">None right now</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
          {open && (
            <>
              <SheetHeader className="border-b border-border p-6">
                <p className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {open.agent === "email" ? "Email and texts" : "Inbound phone line"}
                </p>
                <SheetTitle className="text-[22px] font-semibold tracking-tight">{open.name}</SheetTitle>
                <SheetDescription className="text-[15px]">{open.line}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-6">
                <div className="text-[15px] font-semibold">Which step is it on?</div>
                <div className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1">
                  {STAGES.map((to) => (
                    <button
                      key={to}
                      onClick={() => {
                        const from = stageOf(open.name, open.stage)
                        if (from === to) return
                        moveStage(open.name, to)
                        toast.success(`${open.name} ${STAGES.indexOf(to) > STAGES.indexOf(from) ? "moved up" : "moved back"} to ${STEP[to].name}`)
                      }}
                      className={cn(
                        "h-9 rounded-full text-[13px] font-medium text-muted-foreground",
                        stageOf(open.name, open.stage) === to && "bg-primary text-primary-foreground"
                      )}
                    >
                      {STEP[to].name}
                    </button>
                  ))}
                </div>
                <p className="text-[14px] text-muted-foreground">{STEP[stageOf(open.name, open.stage)].does}</p>
                {open.of > 0 && (
                  <p className="text-[14px]">
                    Matched your team <b className="font-semibold">{open.matched} of {open.of}</b> times.
                  </p>
                )}
              </div>
              <div className="mt-auto flex gap-3 border-t border-border p-4">
                <Link href={`/activity?agent=${encodeURIComponent(open.agent === "email" ? "Email and texts" : "Inbound phone line")}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-secondary text-[15px] font-medium">
                  See it in Activity
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  )
}
