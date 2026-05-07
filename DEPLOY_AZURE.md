# Azure Deployment

This repo can be deployed against the existing CloudShop Azure baseline in `C:\Users\abdou\AZURE\cloudshop\cloudshop-infra`.

## What this repo now includes

- Production backend image: [backend/Dockerfile.prod](./backend/Dockerfile.prod)
- Production frontend image: [frontend/Dockerfile.prod](./frontend/Dockerfile.prod)
- Backend database bootstrap on startup: [backend/app/bootstrap.py](./backend/app/bootstrap.py)
- Azure deployment script: [scripts/deploy-azure.ps1](./scripts/deploy-azure.ps1)

## Expected existing Azure resources

- Resource group: `rg-cloudshop-dev`
- Container Apps environment: `cae-cloudshop-dev`
- ACR: `acrcloudshopabdou`
- PostgreSQL Flexible Server: `psql-cloudshop-dev-frc`

These values come from the current Terraform state in `cloudshop-infra`.

## Deploy

Run from the repo root:

```powershell
pwsh ./scripts/deploy-azure.ps1 `
  -SubscriptionId "<your-subscription-id>" `
  -PostgresAdminPassword "<your-postgres-admin-password>" `
  -ImageTag "v1"
```

The script:

1. selects the Azure subscription
2. ensures the `soumitaw` PostgreSQL database exists
3. builds and pushes backend and frontend images with `az acr build`
4. creates or updates `ca-backend` and `ca-frontend`
5. patches backend `CORS_ORIGINS` to the deployed frontend URL

## Important note about Azure CLI

In this environment, Azure CLI session files under `C:\Users\abdou\.azure` are not writable from the sandbox. The script uses a local writable config directory:

```powershell
$env:AZURE_CONFIG_DIR = ".azure-config"
```

If you are not already logged in inside that config directory, run:

```powershell
$env:AZURE_CONFIG_DIR = ".azure-config"
az login
az account set --subscription "<your-subscription-id>"
```
