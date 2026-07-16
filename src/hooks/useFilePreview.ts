"use client"

import { useEffect, useState } from "react"

export function useFilePreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    if (!file) {
      queueMicrotask(() => {
        if (active) setPreview(null)
      })
      return () => {
        active = false
      }
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (active && typeof reader.result === "string") setPreview(reader.result)
    }
    reader.onerror = () => {
      if (active) setPreview(null)
    }
    reader.readAsDataURL(file)

    return () => {
      active = false
      if (reader.readyState === FileReader.LOADING) reader.abort()
    }
  }, [file])

  return preview
}
