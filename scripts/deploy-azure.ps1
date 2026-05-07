param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,

    [string]$ResourceGroupName = "rg-cloudshop-dev",
    [string]$ContainerAppEnvironment = "cae-cloudshop-dev",
    [string]$AcrName = "acrcloudshopabdou",
    [string]$PostgresServerName = "psql-cloudshop-dev-frc",
    [string]$PostgresAdminUsername = "cloudshopadmin",

    [Parameter(Mandatory = $true)]
    [string]$PostgresAdminPassword,

    [string]$DatabaseName = "soumitaw",
    [string]$BackendAppName = "ca-backend",
    [string]$FrontendAppName = "ca-frontend",
    [string]$ImageTag = "latest",
    [ValidateSet("local", "acr")]
    [string]$BuildMode = "local"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$env:AZURE_CONFIG_DIR = Join-Path $repoRoot ".azure-config"

New-Item -ItemType Directory -Force -Path $env:AZURE_CONFIG_DIR | Out-Null

function Invoke-Az {
    param([string]$Command)
    Write-Host ">> $Command"
    $output = Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        throw ("Command failed with exit code {0}: {1}" -f $LASTEXITCODE, $Command)
    }
    return $output
}

function Test-ContainerAppExists {
    param(
        [string]$Name,
        [string]$ResourceGroup
    )

    $result = az containerapp list -g $ResourceGroup --query "[?name=='$Name'] | length(@)" -o tsv 2>$null
    return ($LASTEXITCODE -eq 0 -and "$result".Trim() -eq "1")
}

Invoke-Az "az account set --subscription `"$SubscriptionId`""

$acrLoginServer = (Invoke-Expression "az acr show -n $AcrName --query loginServer -o tsv").Trim()
$acrUsername = (Invoke-Expression "az acr credential show -n $AcrName --query username -o tsv").Trim()
$acrPassword = (Invoke-Expression "az acr credential show -n $AcrName --query passwords[0].value -o tsv").Trim()
$postgresHost = (Invoke-Expression "az postgres flexible-server show -g $ResourceGroupName -n $PostgresServerName --query fullyQualifiedDomainName -o tsv").Trim()

Invoke-Az "az postgres flexible-server db create -g $ResourceGroupName -s $PostgresServerName -d $DatabaseName"

$databaseUrl = "postgresql://${PostgresAdminUsername}:${PostgresAdminPassword}@${postgresHost}/${DatabaseName}?sslmode=require"

if ($BuildMode -eq "acr") {
    Invoke-Az "az acr build -r $AcrName -t soumitaw-backend:$ImageTag -f backend/Dockerfile.prod ."
} else {
    Invoke-Az "docker login $acrLoginServer --username $acrUsername --password $acrPassword"
    Invoke-Az "docker build -f backend/Dockerfile.prod -t $acrLoginServer/soumitaw-backend:$ImageTag backend"
    Invoke-Az "docker push $acrLoginServer/soumitaw-backend:$ImageTag"
}

$backendExists = Test-ContainerAppExists -Name $BackendAppName -ResourceGroup $ResourceGroupName

if (-not $backendExists) {
    Write-Host "Creating backend container app: $BackendAppName"
    Invoke-Az "az containerapp create -n $BackendAppName -g $ResourceGroupName --environment $ContainerAppEnvironment --image $acrLoginServer/soumitaw-backend:$ImageTag --ingress external --target-port 8000 --registry-server $acrLoginServer --registry-username $acrUsername --registry-password $acrPassword --secrets database-url=`"$databaseUrl`" --env-vars DATABASE_URL=secretref:database-url CORS_ORIGINS=https://placeholder.local ENVIRONMENT=production"
} else {
    Write-Host "Updating backend container app: $BackendAppName"
    Invoke-Az "az containerapp secret set -n $BackendAppName -g $ResourceGroupName --secrets database-url=`"$databaseUrl`""
    Invoke-Az "az containerapp registry set -n $BackendAppName -g $ResourceGroupName --server $acrLoginServer --username $acrUsername --password $acrPassword"
    Invoke-Az "az containerapp update -n $BackendAppName -g $ResourceGroupName --image $acrLoginServer/soumitaw-backend:$ImageTag --set-env-vars DATABASE_URL=secretref:database-url CORS_ORIGINS=https://placeholder.local ENVIRONMENT=production"
}

$backendUrl = ("https://" + (Invoke-Expression "az containerapp show -n $BackendAppName -g $ResourceGroupName --query properties.configuration.ingress.fqdn -o tsv").Trim())

if ($BuildMode -eq "acr") {
    Invoke-Az "az acr build -r $AcrName -t soumitaw-frontend:$ImageTag -f frontend/Dockerfile.prod --build-arg VITE_API_BASE_URL=$backendUrl ."
} else {
    Invoke-Az "docker build -f frontend/Dockerfile.prod --build-arg VITE_API_BASE_URL=$backendUrl -t $acrLoginServer/soumitaw-frontend:$ImageTag frontend"
    Invoke-Az "docker push $acrLoginServer/soumitaw-frontend:$ImageTag"
}

$frontendExists = Test-ContainerAppExists -Name $FrontendAppName -ResourceGroup $ResourceGroupName

if (-not $frontendExists) {
    Write-Host "Creating frontend container app: $FrontendAppName"
    Invoke-Az "az containerapp create -n $FrontendAppName -g $ResourceGroupName --environment $ContainerAppEnvironment --image $acrLoginServer/soumitaw-frontend:$ImageTag --ingress external --target-port 8080 --registry-server $acrLoginServer --registry-username $acrUsername --registry-password $acrPassword"
} else {
    Write-Host "Updating frontend container app: $FrontendAppName"
    Invoke-Az "az containerapp update -n $FrontendAppName -g $ResourceGroupName --image $acrLoginServer/soumitaw-frontend:$ImageTag"
    Invoke-Az "az containerapp registry set -n $FrontendAppName -g $ResourceGroupName --server $acrLoginServer --username $acrUsername --password $acrPassword"
}

$frontendUrl = ("https://" + (Invoke-Expression "az containerapp show -n $FrontendAppName -g $ResourceGroupName --query properties.configuration.ingress.fqdn -o tsv").Trim())

Invoke-Az "az containerapp secret set -n $BackendAppName -g $ResourceGroupName --secrets database-url=`"$databaseUrl`""
Invoke-Az "az containerapp update -n $BackendAppName -g $ResourceGroupName --set-env-vars DATABASE_URL=secretref:database-url CORS_ORIGINS=$frontendUrl ENVIRONMENT=production"

Write-Host ""
Write-Host "Backend URL : $backendUrl"
Write-Host "Frontend URL: $frontendUrl"
