export default function DetailSiswaLoading() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-grid">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ height: 24, width: 180, background: "var(--sand)", borderRadius: 6, marginBottom: 16 }} />
            <div style={{ height: 16, width: 280, background: "var(--sand)", borderRadius: 6, marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ height: 36, width: 120, background: "var(--sand)", borderRadius: 8 }} />
              <div style={{ height: 36, width: 120, background: "var(--sand)", borderRadius: 8 }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
