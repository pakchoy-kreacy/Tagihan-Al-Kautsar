"use client"

import { useEffect, useRef, useState } from "react"

interface PageRefreshOptions {
  intervalMs?: number
  refreshKey?: string
  enabled?: boolean
}

type RefreshCallback = (isCurrent: () => boolean) => Promise<void>

export function usePageRefresh(
  callback: RefreshCallback,
  { intervalMs = 30000, refreshKey = "default", enabled = true }: PageRefreshOptions = {},
) {
  const callbackRef = useRef(callback)
  const stateRef = useRef({
    mounted: false,
    pageVisible: false,
    activeKey: refreshKey,
    generation: 0,
    inFlightKey: null as string | null,
    queued: false,
  })

  const [refresh] = useState(() => {
    const run = async (queueIfBusy = true) => {
      const state = stateRef.current
      if (!state.mounted || !state.pageVisible) return

      if (state.inFlightKey) {
        if (queueIfBusy) state.queued = true
        return
      }

      const requestKey = state.activeKey
      const requestGeneration = state.generation
      state.inFlightKey = requestKey
      state.queued = false
      const isCurrent = () => {
        const current = stateRef.current
        return current.mounted
          && current.pageVisible
          && current.activeKey === requestKey
          && current.generation === requestGeneration
      }

      try {
        await callbackRef.current(isCurrent)
      } finally {
        const current = stateRef.current
        state.inFlightKey = null
        if (current.queued && current.mounted && current.pageVisible) {
          current.queued = false
          void run(false)
        }
      }
    }
    return run
  })

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const state = stateRef.current
    state.mounted = true
    state.pageVisible = !document.hidden
    state.activeKey = refreshKey
    state.generation += 1
    let interval: ReturnType<typeof setInterval> | null = null

    const startInterval = () => {
      if (interval || intervalMs <= 0) return
      interval = setInterval(() => void refresh(), intervalMs)
    }

    const stopInterval = () => {
      if (!interval) return
      clearInterval(interval)
      interval = null
    }

    const onVisibilityChange = () => {
      state.pageVisible = !document.hidden
      if (state.pageVisible) {
        void refresh()
        startInterval()
      } else {
        stopInterval()
      }
    }

    const onPageShow = () => {
      state.pageVisible = true
      state.generation += 1
      void refresh()
      startInterval()
    }

    const onPageHide = () => {
      state.pageVisible = false
      state.generation += 1
      stopInterval()
    }

    const onPopState = () => void refresh()

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("pageshow", onPageShow)
    window.addEventListener("pagehide", onPageHide)
    window.addEventListener("popstate", onPopState)

    if (state.pageVisible) {
      void refresh(false)
      startInterval()
    }

    return () => {
      if (state.activeKey === refreshKey) {
        state.mounted = false
        state.pageVisible = false
      }
      stopInterval()
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("pageshow", onPageShow)
      window.removeEventListener("pagehide", onPageHide)
      window.removeEventListener("popstate", onPopState)
    }
  }, [enabled, intervalMs, refresh, refreshKey])

  return refresh
}
