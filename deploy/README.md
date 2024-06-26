# Automated AI Application Resource Deployment

Scripts to deploy Azure services that support an AI application

- CosmosDB for MongoDB vCore vector database
- OpenAI chat completions and text embedding endpoints
- App services for Node client and Python server

## Steps

1. Login to Azure CLI

```bash
az auth login
az account list
az account set --subscription subscription-id
```

2. Deploy services

```bash
az group create --name rg-name --location eastus
az deployment group create --name dep-name --resource-group rg-name --template-file ./deploy.bicep --parameters ./deploy.parameters.json
```

3. Connect GitHub repositories to the App Services
