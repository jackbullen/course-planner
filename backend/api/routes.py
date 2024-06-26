from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Body, Request, UploadFile
from pymongo import UpdateOne
import jwt
from werkzeug.security import check_password_hash

from .azure.documents import process_transcript
from .azure.utils import generate_embedding, vector_search
from .models import (
    CompletedCourse, 
    Department, 
    Degree, CalendarCourse,
    Section, Course,
    Chat,
    User)
from .utils import *
from .cosmongo import Cosmongo

router = APIRouter(prefix="")

@router.post("/login")
async def login(request: Request, 
                username: str, 
                password: str # should be encrypted
                ) -> User | dict:
    user = request.app.db.users.find_one({'username': username})

    if not user:
        return {"message": "Incorrect username or password"}
    
    user = User(**user)
    if check_password_hash(user.password, password):
        token = jwt.encode({'public': user.public}, request.app.secret, algorithm="HS256")
        return {**user.to_frontend(), 'token': token} # See message in App.tsx in mslh-client
    
    return {"message": "Incorrect username or password"}


# School Endpoints
# ----------------

@router.get("/calendar-course")
@token
async def get_course(request: Request,
                     code: str
                     ) -> CalendarCourse:
    course = request.app.db.calendar_courses.find_one({'_id': code})
    del course['embedding']
    return course

@router.get("/calendar-courses")
async def get_calendar_courses(request: Request,
                      name: Optional[str] = None,
                      description: Optional[str] = None,
                      skip: int = 0,
                      limit: int = 10,
                      ) -> List[CalendarCourse]:
    pipeline = create_pipeline(skip, limit, [('name', name),
                                             ('description', description)])
    return request.app.db.calendar_courses.aggregate(pipeline)

@router.get("/degrees")
@token
async def get_degrees(request: Request,
                      query: Optional[str] = "",
                      type: str = "title",
                      skip: int = 0,
                      limit: int = 10
                      ) -> List[Degree]:
    # TODO: Degree vector embedding search!
    if type == "code":
        type = "_id"
    degrees = request.app.db.degrees.find({type: {'$regex': query, '$options': 'i'}},
                                          {'embedding': 0})
    return degrees

@router.get("/courses")
@token
async def get_sections(request: Request,
                      query: Optional[str] = "",
                      type: str = "name",
                      skip: int = 0, 
                      limit: int = 10,
                      fall: int = 1,
                      spring: int = 1
                      ) -> List[Course]:
    if query==None:
        query=""

    if type == "Vector Embedding":
        embedded_query = generate_embedding(request.app.ai_client, query)
        search_results = vector_search(request.app.db.calendar_courses, embedded_query, 100)
        search_results = {x['document']['_id']: x['similarityScore'] for x in search_results}
        codes = list(search_results.keys())
        query = [{'$match': {'_id': {'$in': codes}}},
                 {'$addFields': {'order': {'$indexOfArray': [codes, '$_id']}}},
                 {'$sort': {'order': 1}}]
        matched_sections = request.app.db.courses.aggregate(query)
        return [{**x, 'similarity': search_results[x['_id']]} for x in matched_sections]
    elif type == "code":
        type = "_id"
    # This should be simplified..
    # Basically just get fall or spring courses
    pipeline_and_match = [{type: {'$options': 'i', '$regex': query}}]
    term_match = []
    if fall == 1 and spring == 1:
        term_match = []
    elif fall == 0 and spring == 1:
        term_match = [{'$and': [{'fall': 0}, {'spring': 1}]},
                      {'$and': [{'fall': 1}, {'spring': 1}]}]
    elif fall == 1 and spring == 0:
        term_match = [{'$and': [{'fall': 1}, {'spring': 0}]},
                      {'$and': [{'fall': 1}, {'spring': 1}]}]
    else:
        pipeline_and_match += [{'fall': 0}, {'spring': 0}]
    if len(term_match) != 0:
        pipeline_and_match.append({'$or': term_match})

    pipeline = [{'$match': {'$and': pipeline_and_match}},
                {'$skip': skip},
                {'$limit': limit}]
    return request.app.db.courses.aggregate(pipeline)

@router.get("/departments")
@token
async def get_departments(request: Request
                          ) -> List[Department]:
    return list(request.app.db.departments.find({}))

@router.post("/user/upload-transcript")
@token
async def handle_transcript(request: Request, 
                            file: UploadFile
                            ) -> Dict[str, Any]:
    """Returns completed courses from the transcript PDF file"""
    try:
        user = request.state.user
        courses = None#get_preset_user_courses(user.username)
        markdown = "sample markdown"
        if courses is None:
            pdf_bytes = await file.read()
            markdown, courses = process_transcript(request.app.doc_client, pdf_bytes)
        courses = [CompletedCourse(**x).model_dump(by_alias=True) for x in courses]
        return {"markdown": markdown, "courses": courses}
    except:
        return {"error": "there was err"}

@router.post("/user/analytics")
@token
async def get_user_analytics(request: Request,
                             degree_code: str = Body(...),
                             specialization: Optional[str] = Body(default=""), # probably better way, but this works
                             completed_courses: List[CompletedCourse] = Body(...)
                             ) -> Dict[str, Any]:
    """Provides analytics on a users degree progress"""

    # Get the degree requirements and completed course codes
    degree = request.app.db.degrees.find_one({'_id': degree_code})
    requirements = degree.get('requirements')
    if specialization != "":# for degrees with specialization, add the specialization reqs
        for spec in degree.get('specializations'):
            if spec.get('title') == specialization:
                spec_requirements = spec.get('requirements')
                if spec_requirements:
                    requirements.update(spec_requirements)
                break
    completed_course_codes = [x.code for x in completed_courses]

    # Get analytics
    units = num_units_completed(completed_courses)
    year = year_standing(units)
    # TODO: Improve requirements_left to not just outer most req
    requirements_left = get_course_reqs_left(requirements, units, completed_course_codes) 
    courses_left = get_courses_left(requirements, units, completed_course_codes)
    potential_courses, missing_prereq, not_offered = get_useful_courses(request.app.db, 
                                                                        requirements, units,
                                                                        completed_course_codes)
    potential_courses = request.app.db.courses.find({'_id': {'$in': potential_courses}})

    # Make response
    return {'units': units,                            # Number of units completed
            'standingYear': year,                      # Current year standing
            'coursesLeft': courses_left,               # Courses left in their degree (excluding electives and some other outlier cases)
            'upcomingCourses': potential_courses,      # Upcoming courses in their degree that they do     satisfy reqs for
            'missingPrereq': missing_prereq,           # Upcoming courses in their degree that they do not satisfy reqs for
            'notOffered': not_offered,                 # Courses in their degree that are not offered in fall or spring
            'requirementsLeft': requirements_left}     # The degree requirements still to complete

@router.get("/user/get-courses")
@token
async def get_user_courses(request: Request) -> List[CompletedCourse]:
    """Get a list of user courses to CosmosDB"""
    return request.state.user.completed_courses

@router.get("/user/get-chat-sessions")
@token
async def get_user_chat_sessions(request: Request) -> List[str]:
    user = request.state.user
    return user.chat_sessions

@router.post("/user/upload-courses")
@token
async def upload_user_courses(request: Request,                             # when one body, itll go as a single item
                                                                            # embed=True makes it an object
                              user_courses: List[CompletedCourse] = Body(..., embed=True)):
    """Uploads a list of user courses to CosmosDB"""
    user_id = request.state.user.id
    user_courses = [x.model_dump(by_alias=True) for x in user_courses]
    request.app.db.users.bulk_write([UpdateOne({"_id": user_id}, 
                                               {"$set": {"completedCourses": user_courses}})])
    return {'message': 'created'}

@router.get("/user/get-registered-sections")
@token
async def get_registered_user_sections(request: Request) -> List[Section]:
    crns = request.state.user.registered_sections
    courses = list(request.app.db.courses.find({"sections._id": {"$in": crns}},
                                               {"sections.$": 1}))
    return [Section(**x['sections'][0]) for x in courses]

@router.post("/user/register-section")
@token
async def register_user_section(request: Request, crn: str):
    request.app.db.users.bulk_write([UpdateOne({"_id": request.state.user.id},
                                               {"$addToSet": {"registeredSections": crn}})])

@router.post("/user/unregister-section")
@token
async def unregister_user_section(request: Request, crn: str):
    request.app.db.users.bulk_write([UpdateOne({"_id": request.state.user.id},
                                               {"$pull": {"registeredSections": crn}})])


# AI Endpoints
# ------------

@router.post("/ai/vector-search")
@token
async def ai_vector_search(request: Request, 
                     query: str
                     ) -> List[Course]:
    db = request.app.db
    ai_client = request.app.ai_client
    
    embedded_query = generate_embedding(ai_client, query)
    search_results = vector_search(db.calendar_courses, embedded_query, 7)

    codes = [res['document']['_id'] for res in search_results]
    course_results = request.app.db.courses.find({"_id": {"$in": codes}})
    return list(course_results) 

@router.post("/ai/chat")
@token
async def ai_chat(request: Request, chat: Chat):
    agent_pool = request.app.agent_pool
    user = request.state.user

    if chat.session_id not in agent_pool:
        agent_pool[chat.session_id] = Cosmongo(request.app.db,
                                               request.app.llm,
                                               request.app.courses_retriever,
                                               request.app.degrees_retriever,
                                               username=user.username,
                                               session_id=chat.session_id,
                                               completed_courses=user.completed_courses)
    return {"message": agent_pool[chat.session_id].run(chat.prompt)}

@router.get("/ai/chat/messages")
@token
async def ai_chat(request: Request, session_id: str):
    if session_id not in request.app.agent_pool:
        return []
    return request.app.agent_pool[session_id].messages
