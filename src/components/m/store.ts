"use client"

import { useSyncExternalStore } from "react"

/** Mockup state shared across pages for this visit: which items have been handled. */
const done = new Set<string>()
let version = 0
const listeners = new Set<() => void>()

export function markDone(id: string) {
  done.add(id)
  version++
  listeners.forEach((l) => l())
}

export function undoDone(id: string) {
  done.delete(id)
  version++
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Re-renders when anything is marked done. Returns a checker. */
export function useDone() {
  useSyncExternalStore(subscribe, () => version, () => 0)
  return (id: string) => done.has(id)
}

/** Stage moves made in this visit, shared by the board, Today and the agent pages. */
const moved = new Map<string, string>()
export function moveStage(name: string, to: string) {
  moved.set(name, to)
  version++
  listeners.forEach((l) => l())
}
export function useStages() {
  useSyncExternalStore(subscribe, () => version, () => 0)
  return <T extends string>(name: string, fallback: T): T => (moved.get(name) as T) ?? fallback
}
