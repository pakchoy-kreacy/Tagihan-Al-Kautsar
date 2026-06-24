export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <style>{`
        @keyframes logoSpin {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes barGrow {
          0% { width: 0%; }
          60% { width: 80%; }
          100% { width: 96%; }
        }
      `}</style>
      <div className="loading-logo-text" style={{ animation: "logoSpin 1.2s ease-in-out infinite" }}>
        MI
      </div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" />
      </div>
    </div>
  )
}
