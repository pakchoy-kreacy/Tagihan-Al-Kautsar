"use client"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <>
      <div className="admin-overlay" onClick={onCancel} />
      <div className="admin-modal" style={{ maxWidth: 400 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#212121" }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#5f6f63", marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn ${danger ? "admin-btn-danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
