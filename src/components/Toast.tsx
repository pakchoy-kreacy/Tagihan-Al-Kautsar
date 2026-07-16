"use client"

import { createContext, useCallback, useContext, useEffect, useState, useRef, type ReactNode } from "react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  type: ToastType
}

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void
} | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idCounter = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  const clearToasts = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer)
    timers.current.clear()
    setToasts([])
  }, [])

  useEffect(() => {
    const activeTimers = timers.current
    window.addEventListener("pagehide", clearToasts)
    window.addEventListener("pageshow", clearToasts)
    return () => {
      window.removeEventListener("pagehide", clearToasts)
      window.removeEventListener("pageshow", clearToasts)
      for (const timer of activeTimers) clearTimeout(timer)
      activeTimers.clear()
    }
  }, [clearToasts])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idCounter.current
    setToasts((prev) => [...prev, { id, message, type }])
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timers.current.delete(timer)
    }, 3000)
    timers.current.add(timer)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background:
                toast.type === "success"
                  ? "#1B5E20"
                  : toast.type === "error"
                    ? "#E53935"
                    : "#1565C0",
              color: "white",
              padding: "12px 24px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              animation: "toastSlide 0.3s ease",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { showToast: () => {} }
  return ctx
}
