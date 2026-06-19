import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"
export default defineConfig({ plugins: [react()], resolve: { alias: { "@": path.resolve(__dirname, "./src") } }, test: { environment: "jsdom", exclude: ["e2e/**", "node_modules/**", "dist/**"], setupFiles: "./src/test/setup.ts", coverage: { provider: "v8", reporter: ["text", "html", "lcov"], include: ["src/{lib,services,contexts}/**/*.{ts,tsx}"], exclude: ["src/components/ui/**", "src/main.tsx", "src/services/mock-service.ts", "src/services/service-factory.ts", "src/services/contracts.ts"], thresholds: { lines: 60, branches: 25 } } } })
