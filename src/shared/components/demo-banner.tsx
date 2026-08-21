const DEMO_PREFIX = "cci-protestos-demo/"

export function DemoBanner() {
  if (import.meta.env.VITE_USE_MOCKS?.toLowerCase() !== "true" && !import.meta.env.PROD) return null

  function resetDemo() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(DEMO_PREFIX) || key.startsWith("mock_"))
      .forEach((key) => localStorage.removeItem(key))
    window.location.assign("/")
  }

  return (
    <aside className="fixed bottom-3 right-3 z-[100] max-w-sm rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 shadow-lg">
      <p className="font-semibold">Demo de portafolio</p>
      <p className="mt-1">Datos ficticios guardados solo en este navegador.</p>
      <button type="button" onClick={resetDemo} className="mt-2 font-medium underline underline-offset-2">
        Restablecer datos demo
      </button>
    </aside>
  )
}
