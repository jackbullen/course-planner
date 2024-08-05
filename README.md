# Course Planner

## Goals

- Help students plan their upcoming academic semesters

- Learn about Azure cloud services including CosmosDB, Azure OpenAI, App Service, Container Apps, Document Intelligence, Azure Storage, and others

## What it does

- Provides a user friendly interface for searching university courses and degrees with vector similarity searches
- Academic transcript upload form to automatically extract completed courses
- Schedule planning that manages time and course conflicts with a weekly calendar view
- Langchain + ChatGPT bot with context data lookup
- User profiles to enable persistent chat sessions and list of completed courses.

## Local usage

1. Clone the repository
2. Setup the database (Will eventually remove use of CosmosDB because it is not required and expensive. Ideally run mongodb locally and set something up for vector searches alongside it. I think backend will start as long as it connects to some mongo server, but vector searches, which are the main part of the app, won't work without CosmosDB)
```
cd data
python3 ./init_db.py
```
3. Start the backend:
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
uvicorn api.app:app --reload --host 0.0.0.0
```
4. Start the frontend:
```bash
cd frontend
npm i
npm run dev
```

## How it was developed

1. Went through and customized this [Python developer guide](https://github.com/AzureCosmosDB/Azure-OpenAI-Python-Developer-Guide) for my use case
2. Integrated the codes from previous step into this [FastAPI app](https://github.com/AzureCosmosDB/Azure-OpenAI-Python-Developer-Guide/tree/main/Backend)
3. Refactored and simplified this [React app](https://github.com/AzureCosmosDB/Azure-OpenAI-Developer-Guide-Front-End)
4. Continued working on the server and client
5. Refactored (switched to using basic html elements and tailwindcss instead of FluentUI Stacks, ...) then integrated this [Azure Todo Lists app](https://github.com/azure-samples/todo-python-mongo-terraform/tree/main/)

## Challenges encountered

- Building and running docker containers is slow on my computer
- Understanding how to create Langchain agents that can use their tools
- Learning the MongoDB query syntax
- Working with the course and degree data and managing their embeddings
- Azure CLI does not work on my computer, but I was able to use it through the cloud shell.

## Accomplishments

- Creating an interactive user interface that allows vector similarity searches. I find this part of the application the most fun to use, and often found myself playing around with the searches rather than developing the app.
- Getting comfortable with the Azure portal. Through consistent efforts during this event I have become familiar with several Azure interfaces and processes.
- The progress with my skills in FastAPI and MongoDB queries. Both were a bit confusing to me at first, but after making some complex endpoints and queries, the simpler ones seem much more approachable.

## Learnings

- How to use CosmosDB for MongoDB vCore to support an AI RAG Chat application with vector indices and similarity searches
- Extracting tabular data using Azure AI Document Intelligence. Working with PDF BytesIO stream to process a multi-page document. Would like to explore this further since my solution requires some hand-crafted functions which I believe aren't necessary with some improvements.
- Deploying services to Azure with Bicep and Terraform from both the Azure CLI and VS Code.
- Designing an API with FastAPI. Separating routes from main app, app lifecycle, asynchronous functions, taking data through query parameters vs request body. Working with the Pydantic BaseModel class to support data validation for database and endpoints, BaseSettings.
- useMemo, useState, useContext in ReactJS. NodeJS.Timeout, tracking mouse events and adding event listeners.
- Langchain AgentExecutor class and how to create tools from Python functions. Also got exposure to some of the ecosystem of libraries surrounding Langchain.
- Creating an user account system with browser localStorage and token-based authentication (albeit an extremely insecure one, main issue is that there is no authorization or access-control. once a user is authenticated they have full access to the backend endpoints)

## What's next

1. Improving the authentication system.
2. Decouple from the current data source. The app is general, and could be applied to any situation where there is two models that have a many-to-many relationship (courses and degrees) and a third that has a many-to-many with the first (user takes several courses) and a one-to-many with the second (user takes one degree).
3. Testing and getting feedback

## Demos

### 1. Upload transcript 
After logging in the user can upload their transcript which then sends the formData to the server. The server finds the number of pages in the PDF and batch processes it using Azure AI Document Intelligence to extract tabular data.

After uploading their courses the user confirms the course extraction. Once they confirm pressing continue will save the courses into their profile.

![](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExazliNnlhZXN6dXYyaTR5NmU2c2ZuYmFrczB0MThxajI4anRibHNrdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PXX8SXAuVlWYShiHiT/giphy.gif)

### 2. Course search

The courses page uses the users courses to find featured courses. These courses have an upcoming section in Fall 2024 or Spring 2025, the user has satisfied all prerequisites for them, and they are a part of the users specified degree program.

Course sections can be registered which display to the right. Clicking on a section will unregister. Courses can also be filtered by Fall or Spring.

![](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGU2d3Yya3RzeDlkcTg1bnlmOG85NGY3aDhzZzR0MzYyMnl1aXVsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YFnugWHUiGwdmmvTZZ/giphy.gif)

### 3. Course vector embedding searches

The courses page also enables vector embedding similarity searches

![](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWVmNzV1ZHA1anVoaHh6MXVzY3NydXZ0OXhoZzFqc3lkbWs3NGY0ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DQo1RY5uLX1Ih7NB6G/giphy.gif)
![](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzk1dmw4N254ZnloZWNpdzRnOHdhaDhmemQ1ZWMzN2sycXUycTA5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2Q5cDiSkaOcyBspl01/giphy.gif)

After five seconds of inactivity in the input bar, the client will submit a request to the server to make the similarity search leveraging the Azure CosmosDB for MongoDB vCore vector embedding index cosmosSearch functionality.

### 4. Degree search

The degrees page has features similar to the courses page. Hovering over a course title will display the upcoming sections if there are any, making it easy and quick to see how the user can work towards completing their degree requirements this year.

![](https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExanQydTA2a2thMXloMXlrb2dlOHNrbXJsYzhueWh0dG1zaXZqd2JqZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GaSDABkyJTnGpcIAKf/giphy.gif)

### 5. Chatbot

![](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzFteXgwZXFhb3Y0bzA3bGFkeHJibHU0ZXFyN2pseTY3aXd1NWwzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/irSrnGyjbiekmOSr8x/giphy.gif)
![](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG51a3B6ajNvZHhhZDBlZjRrYzFmMTJ1MzllYW9uZm40c2tkZ3lkMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cE6yjbtS64v4QEe8gi/giphy.gif)

### 6. Profile

The profile page hosts a user image, their completed courses, and their schedule for the currently registered sections from the courses page.

![](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2FsZjBrZ3d6cDNtdnUwNXVzcnIwNmNlNGFrYzY0cGxocjB5ZTlwaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YgodwVeuEFB5BeuAC1/giphy.gif)

### 7. Mobile friendly

Across the site are mobile friendly designs for small screens

![](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnZ6dmhjYnFtNnJqem05M3dlMDd4NHcwOXhxMTRjN2QyNDQ3aHp2NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dISpfQwVT0xuTCuxod/giphy.gif)
