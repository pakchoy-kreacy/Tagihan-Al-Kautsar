"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(false)
      setPrevPath(pathname)
    }
  }, [pathname, prevPath])

  useEffect(() => {
    function onStart() { setLoading(true) }
    function onDone() { setLoading(false) }

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a, button[data-navigate]")
      if (!target) return
      const href = target.getAttribute("href")
      if (href && href.startsWith("/") && !href.startsWith("/admin")) {
        setLoading(true)
      }
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("beforeunload", onDone)
    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("beforeunload", onDone)
    }
  }, [])

  if (!loading) return null

  return (
    <>
      <style>{`
        @keyframes navProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 95%; }
        }
      `}</style>
      <div className="nav-progress-bar">
        <div className="nav-progress-fill" />
      </div>
    </>
  )
}
