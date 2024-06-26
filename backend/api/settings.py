import os
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Any, List, Dict, Union, Optional
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Initialize KeyVault
        if self.AZURE_KEY_VAULT_ENDPOINT:
            credential = DefaultAzureCredential()
            keyvault_client = SecretClient(self.AZURE_KEY_VAULT_ENDPOINT, credential)
            for secret in keyvault_client.list_properties_of_secrets():
                setattr(
                    self,
                    secret.name.replace("-", "_").upper(),
                    keyvault_client.get_secret(secret.name).value)             

    SECRET_KEY: str = ""

    # CosmosDB
    AZURE_COSMOS_CONNECTION_STRING: str = ""
    AZURE_COSMOS_DATABASE_NAME: str = ""

    # OpenAI 
    AOAI_ENDPOINT_EMBEDDING: str = ""
    AOAI_KEY_EMBEDDING: str = ""
    AOAI_ENDPOINT_CHAT: str = ""
    AOAI_KEY_CHAT: str = ""
    AOAI_API_VERSION: str = ""
    EMBEDDINGS_DEPLOYMENT_NAME: str = ""
    COMPLETIONS_DEPLOYMENT_NAME: str = ""

    # Document Intelligence
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: str = ""
    AZURE_DOCUMENT_INTELLIGENCE_KEY: str = ""

    # App Insights
    AZURE_KEY_VAULT_ENDPOINT: Optional[str] = None
    APPLICATIONINSIGHTS_CONNECTION_STRING: Optional[str] = None
    APPLICATIONINSIGHTS_ROLENAME: str = "API"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"