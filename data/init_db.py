"""
A script to initialize the Cosmos DB for MongoDB vCore database
"""

import os
import json
import pymongo
import certifi
from pymongo import UpdateOne, DeleteMany
from models import CalendarCourse, Degree, Course, Department, User
from dotenv import load_dotenv
load_dotenv()

# Load data
with open('data/courses.json') as f:
    courses = json.load(f)
with open('data/programs.json') as f:
    degrees = json.load(f)
with open('data/departments.json') as f:
    departments = json.load(f)
with open('data/sections.json') as f:
    sections = json.load(f)
with open('data/users.json', 'r') as f:
    users = json.load(f)

# Connect to cosmos database
CONNECTION_STRING = os.getenv("AZURE_COSMOS_CONNECTION_STRING")
db_client = pymongo.MongoClient(CONNECTION_STRING, tlsCAFile=certifi.where())

# Clear database
db_client.drop_database('db')
print("Database cleared")

db = db_client["db"]
cal_course_coll = db["calendar_courses"]
course_coll = db["courses"]
degree_coll = db["degrees"]
department_coll = db["departments"]
users_coll = db["users"]
user_courses_coll = db["user_courses"]

# Insert users, departments, calendar courses, degrees, and 2024/2025 courses and sections
users = [User(**data) for data in users]
users_coll.bulk_write([UpdateOne({"_id": obj.id}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in users])
print("Users inserted")
departments = [Department(**data) for data in departments.values()]
department_coll.bulk_write([UpdateOne({"_id": obj.code}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in departments])
print("Departments inserted")
calendar_course = [CalendarCourse(**data) for data in courses.values() if 'embedding' in data]
cal_course_coll.bulk_write([UpdateOne({"_id": obj.code}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in calendar_course])
cal_course_coll.create_index([("name", pymongo.ASCENDING)], unique=False)
print("Calendar courses inserted")
degrees = [Degree(**data) for data in degrees.values()]
degree_coll.bulk_write([UpdateOne({"_id": obj.code}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in degrees])
print("Degrees inserted")
courses_sections = [Course(**data) for data in sorted(sections.values(), key=lambda x: x['code'])]
course_coll.bulk_write([UpdateOne({"_id": obj.code}, {"$set": obj.model_dump(by_alias=True)}, upsert=True) 
                        for obj in courses_sections])
print("Courses sections inserted")

# Create Vector Indices on calendar courses and degrees collections
db.command({
  'createIndexes': 'calendar_courses',
  'indexes': [
    {
      'name': 'VectorSearchIndex',
      'key': {
        "embedding": "cosmosSearch"
      },
      'cosmosSearchOptions': {
        'kind': 'vector-ivf',  
        'numLists': 1,         
        'similarity': 'COS',   
        'dimensions': 1536
      }
    }
  ]
})
db.command({
  'createIndexes': 'degrees',
  'indexes': [
    {
      'name': 'VectorSearchIndex',
      'key': {
        "embedding": "cosmosSearch"
      },
      'cosmosSearchOptions': {
        'kind': 'vector-ivf',  # indexing algorithm
        'numLists': 1,         # number of inverted lists
        'similarity': 'COS',   # cosine similarity
        'dimensions': 1536,
      }
    }
  ]
})

print("Database initialized")