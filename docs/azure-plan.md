# Cloud Deployment Plan & Architecture

## Author

Pulkit Singla — 2310991342 — Computer Science  
Institution: Chitkara University  
Repository: https://github.com/pulkitsingla16/Cerevyn-Chitkara-2310991342-PS09  

## Architecture Overview

MemoryMatch utilizes a dual-cloud hosting strategy:

1. **Primary Frontend CDN (GitHub Pages):**
   - Live URL: https://pulkitsingla16.github.io/Cerevyn-Chitkara-2310991342-PS09/
   - Serves the compiled React 19 + TypeScript Vite bundle.
   - 100% uptime with no CPU minute restrictions, completely free of charge.
   - Operates in self-contained mode using browser `localStorage` for private history and local analytics.

2. **Cloud Telemetry Backend (Azure App Service):**
   - Live URL: https://cerevyn-memorymatch-2310991342-ajfmebfjcchrbhdx.indiasouthcentral-01.azurewebsites.net
   - Node.js 22 LTS container deployed in the student-permitted `indiasouthcentral` region under the Free F1 Tier ($0.00/month).
   - Runs pre-bundled ES module (`dist-server/server.js`) for sub-second native Node boot times.
   - Provides RESTful APIs for global telemetry (`/api/game/analytics`) and health checks (`/api/health`).

## GitHub Actions CI/CD Pipelines

The repository maintains three automated workflows:

1. **`ci.yml` (Continuous Integration):**
   - Triggers on every push and pull request to `main`.
   - Runs `npm ci`, ESLint, TypeScript typecheck, the full 27-test Vitest suite, and production bundling.
2. **`deploy-pages.yml` (GitHub Pages Deployment):**
   - Automatically builds and publishes the production `dist/` directory to the `gh-pages` branch upon verified CI success.
3. **`main_cerevyn-memorymatch-2310991342.yml` (Azure Deployment):**
   - Triggers on push and on a scheduled morning cron (`30 0 * * *`) following the daily 00:00 UTC Azure Free F1 quota reset.
   - Deploys the application artifact to Azure Web App via OIDC authentication.

## Security & Privacy Controls

- **Zero IP Collection:** Neither client nor server collects or stores IP addresses or personal identifiers.
- **Private Browser Storage:** Individual game history is stored strictly in the visitor's local browser storage.
- **Restricted Server Operations:** Clearing global server history is restricted (`x-admin-key`), ensuring no public visitor can erase shared analytics.
- **Validated Payloads:** All game session submissions are strictly validated for allowed difficulty levels and sensible numeric ranges.
