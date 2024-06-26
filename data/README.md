# Data

Data and scripts to support my Microsoft AI Learning Hackathon project.

## Initialize CosmosDB

The main script in this repo is `init_db.py`. This script initializes the Cosmos DB for MongoDB vCore database. 

Pymongo library is used to connect to the database. `bulk_write`, `DeleteMany`, and `UpdateOne` are used to delete and write data. After writing the data it creates the vector indices on the courses and degrees collections.

The initialized collections include

- calendar_courses: calendar courses. course embeddings are here
- courses: courses for this fall and spring. includes sections
- degrees: degree embeddings are here along with requirements, etc.
- departments: not used in the app atm.
- users: sample users to demonstrate different student situations

## Data Collection

Data is stored in the data dir and the scripts are organized into dirs based on a task. For each task dir there is a script for courses and degrees (programs).

### Tasks

1. **Initial Data**

The following tasks assume that there is already `programs.json` and `courses.json` in the data dir that contain the course/degree codes and pids. The scripts fill in the remaining data, most of it coming from kuali.

2. **Kuali**

Titles, descriptions, html requirements/prereqs are collected from uvic.kuali using the scripts in kuali dir.

3. **Requirements**

The HTML requirements/prerequisites are parsed using an approach found in [VikeLabs: UVicCourseScraper](https://github.com/VikeLabs/uvic-course-scraper). The approach was rewritten in Python and a couple modifications were made to handle degrees. This is in the requirements dir.

4. **Embeddings**

Embeddings are computed using the OpenAI text embedding model text-embedding-ada-002. These embeddings map text strings into a high dimensional space to capture semantics for comparisons. The model is deployed from Azure OpenAI Studio with an Azure OpenAI service. Scripts for calling the endpoints and adding embeddings are in the embeddings dir. In here it shows how the embeddings were made: for degrees it makes a string from code, name, and cred fields, and for courses it uses the code, name, and description.

# Disclaimer

**Double check any information you get from the app**, and best to speak with an academic advisor for making long-term plans. Course, section, and degree information may be outdated as the university can update this at any time.

- [University Advising Links](https://www.uvic.ca/students/undergraduate/academic-advising/index.php)