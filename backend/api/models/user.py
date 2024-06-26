from typing import List, Optional
from pydantic import BaseModel, Field

from .completed_course import CompletedCourse
# from . import CompletedCourse

class User(BaseModel):
    """
    Logged in user model
    """
    id: int = Field(alias="_id")
    username: str
    password: str
    public: str
    name: str
    picture_url: Optional[str] = Field(alias="pictureUrl", default=None)
    chat_sessions: Optional[List[str]] = Field(alias="chatSessions", default=[])
    degree: Optional[str] = "Undeclared"
    degree_code: Optional[str] = Field(alias="degreeCode", default=None)
    specialization: Optional[str] = ""
    completed_courses: Optional[List[CompletedCourse]] = Field(alias="completedCourses", default=[])
    registered_sections: Optional[List[str]] = Field(alias="registeredSections", default=[])

    class Config:
        populate_by_name = True

    def to_frontend(self):
        user = self.model_dump(by_alias=True)
        del user['password'], user['public']
        return user