"use client"

import { NavBar } from "@/components/NavBar"

export default function Loading() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <div className="app-grid">
          <section className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 80, height: 32 }} />
              <div className="skeleton" style={{ width: 60, height: 32, borderRadius: 999 }} />
            </div>
            <div className="skeleton" style={{ width: "100%", height: 44, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ width: 80, height: 32, borderRadius: 999 }} />)}
            </div>
          </section>
          {[1,2,3].map(i => (
            <section key={i} className="card">
              <div className="skeleton" style={{ width: "60%", height: 20, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "40%", height: 16, marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
