# GitHub Actions Setup

This repo includes a deployment workflow in [.github/workflows/deploy.yml](./.github/workflows/deploy.yml).

## Required GitHub secret

- `POSTGRES_ADMIN_PASSWORD`

## Azure authentication

Use one of these two options:

1. `AZURE_CREDENTIALS` secret
2. GitHub OIDC with:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_SUBSCRIPTION_ID`

You can store the OIDC values as repository variables or secrets.

## Required or recommended GitHub variables

- `ACR_NAME`
- `RESOURCE_GROUP`
- `CONTAINER_APP_ENVIRONMENT`
- `BACKEND_APP_NAME`
- `FRONTEND_APP_NAME`
- `POSTGRES_SERVER_NAME`
- `POSTGRES_ADMIN_USERNAME`
- `DATABASE_NAME`

## Recommended values for the current Azure setup

- `ACR_NAME=acrcloudshopabdou`
- `RESOURCE_GROUP=rg-cloudshop-dev`
- `CONTAINER_APP_ENVIRONMENT=cae-cloudshop-dev`
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

## Azure OIDC alternative

If you do not want to use `AZURE_CREDENTIALS`, configure a federated credential on your Azure app registration for this GitHub repository and set:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

## What the pipeline does

1. validates backend and frontend
2. builds production Docker images
3. pushes images to ACR
4. creates or updates `ca-backend`
5. discovers backend URL
6. rebuilds frontend with the backend URL injected
7. creates or updates `ca-frontend`
8. patches backend `CORS_ORIGINS` with the deployed frontend URL
