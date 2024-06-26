"""
The Cosmongo class encapsulates a LangChain 
agent that can be used to answer questions about UVic
degrees, courses, and sections in Fall 24 and Spring 25
"""
import json
from typing import List
from langchain.schema.document import Document
from langchain.agents import Tool
from langchain.agents.agent_toolkits import create_conversational_retrieval_agent
from langchain.tools import StructuredTool
from langchain_core.messages import SystemMessage
import pymongo

from .utils import can_take, get_unsatisfied_course_reqs, num_units_completed
from .models import CompletedCourse

class Cosmongo:
    """
    Class for handling langchain conversational agent interactions
    """
    def __init__(
            self, 
            db, 
            llm,
            courses_retriever,
            degrees_retriever,
            username: str,
            session_id: str, 
            completed_courses: List[CompletedCourse]=None,
            messages: List[str]=None):            

        self.db = db
        self.courses_retriever = courses_retriever
        self.degrees_retriever = degrees_retriever

        system_message = SystemMessage(
            content = """Welcome to the Academic Advisor Assistant for the University of Victoria (UVic).
                         As an academic advisor assistant, you help with information about UVic's courses and degrees.
                         Ask questions about specific courses, degree programs, or general inquiries related to UVic.
                         Do not make up any courses, if you dont a course with tools, then say I cannot find that course.
                         Only reference the courses that are explicitly given to you as context.
                         Do not provide links.""")

        self.agent_executor = create_conversational_retrieval_agent(
            llm, 
            self._make_tools(), 
            system_message=system_message, 
            verbose=True, 
            handle_parsing_errors=True)

        self.username = username
        self.session_id = session_id
        self.completed_courses = [] if completed_courses is None else completed_courses
        self.messages = [] if messages is None else messages

    def run(self, prompt: str) -> str:
        """
        Run the AI agent.
        """
        result = self.agent_executor({"input": prompt})
        self.messages += [prompt, result["output"]]
        self._backup_chat()
        return result["output"]
    
    def _backup_chat(self):
        self.db.chat.bulk_write([pymongo.UpdateOne({"_id": self.session_id}, 
                                                   {"$set": {"messages": self.messages,
                                                             "username": self.username}}, 
                                                   upsert=True)])
        self.db.users.bulk_write([pymongo.UpdateOne({"username": self.username},
                                                    {"$addToSet": {"chatSessions": self.session_id}})])

    def _make_tools(self):
        courses_retriever_chain = self.courses_retriever | format_course_doc
        degrees_retriever_chain = self.degrees_retriever | format_degree_doc

        return [Tool(
                    name = "vector_search_degrees", 
                    func = degrees_retriever_chain.invoke,
                    description = "Find degrees similar to the question."),
                Tool(
                    name = "vector_search_courses", 
                    func = courses_retriever_chain.invoke,
                    description = "Find courses similar to question."),
                StructuredTool.from_function(
                    self._get_course_by_id, 
                    description="useful for finding information about a specific course when you have the subject and course number"),
                StructuredTool.from_function(
                    self._can_take, 
                    description="useful when the user asks if they satisty prerequisites for a course"),
                StructuredTool.from_function(
                    self._get_degree_by_title, 
                    description="useful when looking for information about a specific degree"),
                StructuredTool.from_function(
                    self._determine_course_offering, 
                    description="useful for finding if a course is offered and getting details about it's upcoming sections")]
    
    def _get_course_by_id(self, code: str) -> str:
        """
        Retrieves a course by it's course code, eg: MATH101
        """
        code = code.replace(' ', '').upper()
        doc = self.db.calendar_courses.find_one({"_id": code})  
        if doc:
            return json.dumps({'code': doc['_id'], 
                               'name': doc['name'], 
                               'description': doc['description']})
        else:
            return f"{code} does not exist in my database. Are you sure this is the correct course code."

    def _can_take(self, code: str) -> str:
        """
        Determines if the user satisfies the prerequisites for a course
        """
        if len(self.completed_courses) == 0:
            return "Unsure, the user has not uploaded their completed courses."
        
        code = code.replace(' ', '').upper()
        course = self.db.calendar_courses.find_one({"_id": code})
        if course is None:
            return f"{code} does not exist in my database. Are you sure this is the correct course code."

        units = num_units_completed(self.completed_courses)
        completed_course_codes = [x.code for x in self.completed_courses]
        if can_take(course, units, completed_course_codes):
            return "Yes, the prerequisites are satisfied"
        else:
            not_satisfied = get_unsatisfied_course_reqs(course['prerequisites'], units, completed_course_codes)
            return f"No, the prerequisites {not_satisfied} are not satisfied"


    def _get_degree_by_title(self, title: str) -> str:
        """
        Retrieves a degree by it's name, eg: Mathematics
        """
        doc = self.db.degrees.find_one({"title": title})
        if doc:
            return json.dump({'code': doc['_id'],
                              'title':title, 
                              'description': doc['description'],
                              'required course list': ', '.join(doc['requirementCourseList'])})
        else:
            return f"{title} does not exist in my database. Are you sure this is the program title."

    def _determine_course_offering(self, code: str) -> str:
        """
        Find if a course is offered
        """
        code = code.replace(' ', '').upper()
        doc = self.db.courses.find_one({"_id": code})

        if doc:
            sections = doc.get('sections')
            out_sec = []
            if sections:
                for sec in sections:
                    out_sec.append({'start': sec['start'],
                                    'end': sec['end'],
                                    'start_date': sec['startDate'],
                                    'days': sec['days'],
                                    'seq': sec['seq']})

            return json.dumps({"is_offered": "yes", 'sections': out_sec})
        else:
            return json.dumps({"is_offered": "no"})
    
    def __str__(self):
        return f"Cosmongo(id={self.session_id[:8]}, user={self.username}, messages={self.messages})"
    
    def __repr__(self):
        return self.__str__()


def filter_dict(di, keys):
    return {k: v for k, v in di.items() if k in keys}

def annotate_dict(di):
    return ", ".join([str(k) + ": " + str(v) for k, v in di.items()])


def format_course_doc(docs: List[Document]) -> str:
    """Format the course docs."""
    return ", ".join([annotate_dict(filter_dict(doc.metadata, ['_id', 'name', 'description']))
                    for doc in docs])

def format_degree_doc(docs: List[Document]) -> str:
    """Format the degree docs."""
    return ", ".join([annotate_dict(filter_dict(doc.metadata, ['title', 'description']))
                    for doc in docs])