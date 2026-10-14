# Azure deployment plan

## Author

Pulkit Singla — 2310991342 — Computer Science

## Architecture

- GitHub repository with the source code and workflow configuration.
- GitHub Actions CI/CD pipeline for linting, type checking, tests, and production builds.
- Azure Static Web Apps hosts the Vite production bundle over HTTPS.
- Browser-only state and localStorage keep the application lightweight and serverless.

## Deployment procedure

### Prerequisites

- A GitHub repository with the app committed and pushed.
- A Microsoft Azure subscription (free tier is sufficient).
- Permission to create or manage Azure Static Web Apps.

### Creating the Azure resource

1. Open the Azure portal and create a new **Static Web App**.
2. Choose the **Free** plan.
3. Connect the GitHub repository (`pulkitsingla16/Cerevyn-Chitkara-2310991342-PS09`).
4. Select the branch to deploy (e.g., `main`).
5. Set the **app location** to `/` and the **output location** to `dist`.

### Build settings

Use the default Vite build settings:
- Build command: `npm run build`
- Output location: `dist`
- App location: `/`

### Deployment flow

1. Push to the deployment branch.
2. GitHub Actions runs the CI workflow (lint, typecheck, test, build).
3. Azure Static Web Apps picks up the build artifact from `dist/`.
4. Confirm the site is accessible via the generated HTTPS URL.

### Rollback

Use the Azure portal or GitHub Actions history to redeploy a prior working build. Static Web Apps supports quick redeployment after a failed build or a bad release.

## Security

- No credentials or secrets are stored in source code.
- Any required deployment secrets live in GitHub Actions encrypted secrets or Azure-managed identity settings.
- HTTPS is enabled automatically by Azure Static Web Apps.
- The app does not collect personal information beyond anonymous browser-local session history.
- Dependency versions should be reviewed regularly and updated as needed.
- A `.env.example` file documents configuration without exposing real values.

## Monitoring

- Review GitHub Actions build logs for CI failures.
- Check Azure Static Web Apps deployment logs for runtime or routing issues.
- Use browser-level error handling and any privacy-preserving logging that is appropriate for the project.

## Cost management

Azure Static Web Apps **Free** tier is sufficient for this project:
- 100 GB bandwidth per month
- 2 custom domains
- No database or compute costs

The project is a static site with no backend. There are no ongoing compute costs.

## Storage and identity assumptions

- **No database** — all game state is client-side.
- **No authentication** — the game is anonymous.
- **No secrets** — the only Azure secret is the deployment token, stored as a GitHub Actions secret.

## Limitations

Browser localStorage is specific to a single browser and device. It is user-editable and is not synchronized across devices or shared sessions. This is acceptable for anonymous local session history but should not be treated as a secure or shared storage layer.
