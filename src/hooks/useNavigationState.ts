"use client"

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"

export function useNavigationState() {
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const navigatingRef = useRef<string | null>(null)

  const reset = useCallback(() => {
    navigatingRef.current = null
    setNavigatingTo(null)
  }, [])

  useEffect(() => {
    const onPageShow = () => reset()
    const onPopState = () => reset()
    const onVisibilityChange = () => {
      if (!document.hidden) reset()
    }

    window.addEventListener("pageshow", onPageShow)
    window.addEventListener("pagehide", reset)
    window.addEventListener("popstate", onPopState)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("pageshow", onPageShow)
      window.removeEventListener("pagehide", reset)
      window.removeEventListener("popstate", onPopState)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [reset])

  const startNavigation = useCallback((destination: string, event?: MouseEvent<HTMLAnchorElement>) => {
    if (event) {
      const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      const opensNewContext = event.button !== 0 || event.currentTarget.target === "_blank"
      if (isModifiedClick || opensNewContext) return

      if (navigatingRef.current) {
        event.preventDefault()
        return
      }
    } else if (navigatingRef.current) {
      return
    }

    navigatingRef.current = destination
    setNavigatingTo(destination)
  }, [])

  return { navigatingTo, startNavigation, resetNavigation: reset }
}
