# GitHub Actions Setup

This repo includes a deployment workflow in [.github/workflows/deploy.yml](./.github/workflows/deploy.yml).

## Required GitHub secret

- `AZURE_CREDENTIALS`
- `POSTGRES_ADMIN_PASSWORD`

## Required or recommended GitHub variables

- `ACR_NAME`
- `RESOURCE_GROUP`
- `BACKEND_APP_NAME`
- `FRONTEND_APP_NAME`
- `POSTGRES_SERVER_NAME`
- `POSTGRES_ADMIN_USERNAME`
- `DATABASE_NAME`

## Recommended values for the current Azure setup

- `ACR_NAME=acrcloudshopabdou`
- `RESOURCE_GROUP=rg-cloudshop-dev`
- `BACKEND_APP_NAME=ca-backend`
- `FRONTEND_APP_NAME=ca-frontend`
- `POSTGRES_SERVER_NAME=psql-cloudshop-dev-frc`
- `POSTGRES_ADMIN_USERNAME=cloudshopadmin`
- `DATABASE_NAME=soumitaw`

## Azure credentials secret

Use a service principal JSON for `AZURE_CREDENTIALS`, compatible with `azure/login@v2`.

Example shape:

```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}
```

## What the pipeline does

1. validates backend and frontend
2. builds production Docker images
3. pushes images to ACR
4. updates `ca-backend`
5. discovers backend URL
6. rebuilds frontend with the backend URL injected
7. updates `ca-frontend`
8. patches backend `CORS_ORIGINS` with the deployed frontend URL
