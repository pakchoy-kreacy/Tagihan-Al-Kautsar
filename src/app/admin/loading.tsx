export default function AdminLoading() {
  return (
    <div className="admin-page">
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 28, width: 200, background: "var(--sand)", borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 16, width: 320, background: "var(--sand)", borderRadius: 6 }} />
      </div>
      <div className="admin-section">
        <div style={{ height: 40, background: "var(--sand)", borderRadius: 8, marginBottom: 12 }} />
        <div style={{ height: 40, background: "var(--sand)", borderRadius: 8, marginBottom: 12 }} />
        <div style={{ height: 40, background: "var(--sand)", borderRadius: 8 }} />
      </div>
    </div>
  )
}
