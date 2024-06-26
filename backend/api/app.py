from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pymongo

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

import certifi
from contextlib import asynccontextmanager

from .azure.utils import create_retriever
from .routes import router
from .settings import Settings
from .models.completed_course import CompletedCourse
from .cosmongo import Cosmongo

settings = Settings()

@asynccontextmanager
async def lifespan(app):
    app.secret = settings.SECRET_KEY
                    
    # Setup CosmosDB client
    db_client = pymongo.MongoClient(settings.AZURE_COSMOS_CONNECTION_STRING,
                                    tlsCAFile=certifi.where())
    app.db = db_client.db

    doc_client = DocumentIntelligenceClient(
        endpoint=settings.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT, 
        credential=AzureKeyCredential(settings.AZURE_DOCUMENT_INTELLIGENCE_KEY))
    app.doc_client = doc_client
    
    app.ai_client = AzureOpenAI(
        azure_endpoint = settings.AOAI_ENDPOINT_EMBEDDING,
        api_key = settings.AOAI_KEY_EMBEDDING,
        api_version = settings.AOAI_API_VERSION)

    llm = AzureChatOpenAI(
        temperature = 0,
        openai_api_version = settings.AOAI_API_VERSION,
        azure_endpoint = settings.AOAI_ENDPOINT_CHAT,
        openai_api_key = settings.AOAI_KEY_CHAT,         
        azure_deployment = settings.COMPLETIONS_DEPLOYMENT_NAME)
    app.llm = llm

    # Setup Azure Vector Store retrievers
    embedding_model = AzureOpenAIEmbeddings(
        openai_api_version = settings.AOAI_API_VERSION,
        azure_endpoint = settings.AOAI_ENDPOINT_EMBEDDING,
        openai_api_key = settings.AOAI_KEY_EMBEDDING,   
        azure_deployment = settings.EMBEDDINGS_DEPLOYMENT_NAME,
        chunk_size=10)

    courses_retriever = create_retriever(
        settings.AZURE_COSMOS_CONNECTION_STRING, 
        embedding_model,
        'calendar_courses', 
        top_k=3)
    app.courses_retriever = courses_retriever

    degrees_retriever = create_retriever(
        settings.AZURE_COSMOS_CONNECTION_STRING, 
        embedding_model,
        'degrees', 
        top_k=3)
    app.degrees_retriever = degrees_retriever

    # Retrieve Agent Pool from CosmosDB
    # Note: This is not scalable. 
    #       Instead it would be better to only load in agents 
    #       when the sessions are requests
    agent_pool = list(app.db.chat.find({}))
    if len(agent_pool) == 0:
        agent_pool = {}
    users = list(app.db.users.find({}))

    app.agent_pool = {chat['_id']: Cosmongo(db_client.db,
                                            llm,
                                            courses_retriever,
                                            degrees_retriever,
                                            username=chat['username'],
                                            session_id=chat['_id'], 
                                            completed_courses=[CompletedCourse(**x) for x in user['completedCourses']],
                                            messages=chat['messages'])
                      for chat in agent_pool
                      for user in users
                      if chat['username'] == user['username']}
    
    yield 

    # On shutdown, store the agent states and session ids in CosmosDB
    # Cosmongo backing up chats on every run call. No longer needed
    # if len(app.agent_pool) > 0:
    #     app.db.chat.bulk_write([pymongo.UpdateOne({"_id": id}, 
    #                                               {"$set": {"messages": agent.messages,
    #                                                         "username": agent.username}}, 
    #                                               upsert=True) 
    #                             for id, agent in app.agent_pool.items()])
    #     app.db.users.bulk_write([pymongo.UpdateOne({"username": agent.username},
    #                                                {"$add": {"chatSessions": agent.session_id}})
    #                             for agent in app.agent_pool.values()])

app = FastAPI(
    title="Course Planner",
    description="My submission for Microsoft AI learning hackathon",
    version="1.0.0",
    docs_url="/", 
    lifespan=lifespan)

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])