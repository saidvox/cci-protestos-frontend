import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/shared/components/ui/tooltip"
import { AuthProvider } from "@/features/auth/auth-context"
import { AppRoutes } from "@/app/routes/app-routes"
import { DemoBanner } from "@/shared/components/demo-banner"
import "@/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
          <DemoBanner />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>
)
