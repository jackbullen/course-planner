param location string = 'eastus'

param name string = 'jb1${uniqueString(resourceGroup().id)}'

param openAiSku string = 'S0'

param mongoDbUserName string

@minLength(8)
@maxLength(256)
@secure()
param mongoDbPassword string




// CosmosDB for MongoDB vCore Cluster
// ----------------------------------
var mongovCoreSettings = {
  mongoClusterName: '${name}-cosmongo'
  mongoClusterLogin: mongoDbUserName
  mongoClusterPassword: mongoDbPassword
}

resource mongoCluster 'Microsoft.DocumentDB/mongoClusters@2023-03-01-preview' = {
  name: mongovCoreSettings.mongoClusterName
  location: location
  properties: {
    administratorLogin: mongovCoreSettings.mongoClusterLogin
    administratorLoginPassword: mongovCoreSettings.mongoClusterPassword
    serverVersion: '5.0'
    nodeGroupSpecs: [
      {
        kind: 'Shard'
        sku: 'M30'
        diskSizeGB: 128
        enableHa: false
        nodeCount: 1
      }
    ]
  }
}

resource mongoFirewallRulesAllowAll 'Microsoft.DocumentDB/mongoClusters/firewallRules@2023-03-01-preview' = {
  parent: mongoCluster
  name: 'allowAll'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}




// OpenAI chat completions and text embedding endpoints
// ----------------------------------------------------
var openAiSettings = {
  name: '${name}-openai'
  sku: openAiSku
  maxConversationTokens: '100'
  maxCompletionTokens: '500'
  completionsModel: {
    name: 'gpt-35-turbo'
    version: '0613'
    deployment: {
      name: 'gpt-35-turbo'
    }
    sku: {
      name: 'Standard'
      capacity: 1
    }
  }
  embeddingsModel: {
    name: 'text-embedding-ada-002'
    version: '2'
    deployment: {
      name: 'text-embedding-ada-002'
    }
    sku: {
      name: 'Standard'
      capacity: 120     
    }
  }
}

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openAiSettings.name
  location: location
  sku: {
    name: openAiSettings.sku    
  }
  kind: 'OpenAI'
  properties: {
    customSubDomainName: openAiSettings.name
    publicNetworkAccess: 'Enabled'
  }
}

resource openAiEmbeddingsModelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: openAiSettings.embeddingsModel.deployment.name  
  sku: {
    name: openAiSettings.embeddingsModel.sku.name
    capacity: openAiSettings.embeddingsModel.sku.capacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: openAiSettings.embeddingsModel.name
      version: openAiSettings.embeddingsModel.version
    }
  }
}

resource openAiCompletionsModelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: openAiSettings.completionsModel.deployment.name
  dependsOn: [
    openAiEmbeddingsModelDeployment
  ]
  sku: {
    name: openAiSettings.completionsModel.sku.name
    capacity: openAiSettings.completionsModel.sku.capacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: openAiSettings.completionsModel.name
      version: openAiSettings.completionsModel.version
    }    
  }
}




// App Service Plan
// ----------------
var appServiceSettings = {
  plan: {
    name: '${name}-asp'
    sku: 'P0v3'
  }
  client: {
    name: '${name}-client'
  }
  server: {
    name: '${name}-server'
  }  
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServiceSettings.plan.name
  location: location
  sku: {
    name: appServiceSettings.plan.sku
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}


// Node App service (client)
// -------------------------
resource appServiceClient 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceSettings.client.name
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'pm2 serve /home/site/wwwroot/dist --no-daemon --spa'
      alwaysOn: true
    }
  }
}

resource appServiceClientSettings 'Microsoft.Web/sites/config@2022-03-01' = {
  parent: appServiceClient
  name: 'appsettings'
  kind: 'string'
  properties: {
    RANDOM_ENV_VAR: 'this is an env variables',
    VITE_API_BASE_URL='POINT THIS TO THE BELOW APP SERVICE'
  }
}


// Python App service (server)
// ---------------------------
resource appServiceServer 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceSettings.server.name
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'python|3.12'
      appCommandLine: 'gunicorn -w 2 -k uvicorn.workers.UvicornWorker app:app'
      alwaysOn: true
    }
  }
}

resource appServiceServerSettings 'Microsoft.Web/sites/config@2022-03-01' = {
  parent: appServiceServer
  name: 'appsettings'
  kind: 'string'
  properties: [ 
    // I dont think this actually works, but you can add them similar to how the above appservice loads the env vars
  {
    "name": "AOAI_API_VERSION",
    "value": "2023-05-15",
    "slotSetting": false
  },
  {
    "name": "AOAI_ENDPOINT_CHAT",
    "value": "https://polite-ground-030dc3103.4.azurestaticapps.net/api/v1",
    "slotSetting": false
  },
  {
    "name": "AOAI_ENDPOINT_EMBEDDING",
    "value": "https://simple-demo.openai.azure.com/",
    "slotSetting": false
  },
  {
    "name": "AOAI_KEY_CHAT",
    "value": "90278f62-d294-4b60-a73b-e2cb4f70406f",
    "slotSetting": false
  },
  {
    "name": "AOAI_KEY_EMBEDDING",
    "value": "1c8615ccedc04335a4853d83dea893e1",
    "slotSetting": false
  },
  {
    "name": "AZURE_COSMOS_CONNECTION_STRING",
    "value": "mongodb+srv://cosmosClusterAdmin:mypassword987^@jb1.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000",
    "slotSetting": false
  },
  {
    "name": "AZURE_COSMOS_DATABASE_NAME",
    "value": "db",
    "slotSetting": false
  },
  {
    "name": "COMPLETIONS_DEPLOYMENT_NAME",
    "value": "gpt-4",
    "slotSetting": false
  },
  {
    "name": "EMBEDDINGS_DEPLOYMENT_NAME",
    "value": "text-embedding-ada-002",
    "slotSetting": false
  },
  {
    "name": "SCM_DO_BUILD_DURING_DEPLOYMENT",
    "value": "1",
    "slotSetting": false
  }]
  
}
