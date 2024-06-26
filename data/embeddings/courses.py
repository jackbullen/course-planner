"""
DISCLAIMER: This script was never run. The code was copied from a Jupyter Notebook
            Additionally, since creating the embeddings, I moved the data around more..
            Hence the embedding field name on the Pydantic models. But this is how the
            embeddings were originally obtained.
"""

import os
import json
import pymongo
from pymongo import UpdateOne
from pprint import pprint
from models import CalendarCourse
from openai import AzureOpenAI
from dotenv import load_dotenv
load_dotenv()

# Load course data
with open('courses.json') as f:
    courses = json.load(f)


# Setup DB client and insert data
CONNECTION_STRING = os.getenv('CONNECTION_STRING')
db_client = pymongo.MongoClient(CONNECTION_STRING)
db = db_client["db"]
course_coll = db["courses"]

course_objects = [CalendarCourse(**data) for data in courses.values()]
course_coll.bulk_write([UpdateOne({"_id": obj.pid}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in course_objects])


# Setup AI client
EMBEDDINGS_DEPLOYMENT_NAME = os.getenv('EMBEDDINGS_DEPLOYMENT_NAME')
COMPLETIONS_DEPLOYMENT_NAME = os.getenv('COMPLETIONS_DEPLOYMENT_NAME')
AOAI_ENDPOINT = os.getenv('AOAI_ENDPOINT')
AOAI_KEY = os.getenv('AOAI_KEY')
AOAI_API_VERSION = os.getenv('AOAI_API_VERSION')
ai_client = AzureOpenAI(
    azure_endpoint = AOAI_ENDPOINT,
    api_version = AOAI_API_VERSION,
    api_key = AOAI_KEY)


# Setup AI client
EMBEDDINGS_DEPLOYMENT_NAME = os.getenv('EMBEDDINGS_DEPLOYMENT_NAME')
COMPLETIONS_DEPLOYMENT_NAME = os.getenv('COMPLETIONS_DEPLOYMENT_NAME')
AOAI_ENDPOINT = os.getenv('AOAI_ENDPOINT')
AOAI_KEY = os.getenv('AOAI_KEY')
AOAI_API_VERSION = os.getenv('AOAI_API_VERSION')
ai_client = AzureOpenAI(
    azure_endpoint = AOAI_ENDPOINT,
    api_version = AOAI_API_VERSION,
    api_key = AOAI_KEY)


# Functions to generate embeddings. Same functions across courses/degrees

def create_string_from_course(c):
    return c['name']+": "+c['description']

def generate_embeddings(text: str):
    '''
    Generate embeddings from string of text using the deployed Azure OpenAI API embeddings model.
    '''
    response = ai_client.embeddings.create(input=text, model=EMBEDDINGS_DEPLOYMENT_NAME)
    embeddings = response.data[0].embedding
    # time.sleep(0.5)
    return embeddings

def add_collection_content_vector_field(collection_name: str, keys: list):
    '''
    Vectorize each string made of subset of keys from doc and store in contentVector field.
    '''
    collection = db[collection_name]

    # Get all documents for the collection
    docs = []
    for doc in collection.find({}):
        docs.append(doc)

    # Compute embeddings and prepare bulk operations
    bulk_operations = []
    for doc in docs:
        if "contentVector" in doc:
            continue
        
        filtered_info = {k: v for k, v in doc.items() if k in keys}
        content = ', '.join([str(v) for v in filtered_info.values()])
        content_vector = generate_embeddings(content)       
        bulk_operations.append(pymongo.UpdateOne(
            {"_id": doc["_id"]},
            {"$set": {"contentVector": content_vector}},
            upsert=True
        ))

    # Bulk write UpdateOnes with added contentVector embedding
    collection.bulk_write(bulk_operations)


# # WARNING: This takes >40 MINUTES
# course_keys = ["code", "name", "description"]
# add_collection_content_vector_field("courses", course_keys)