"""
            Code is not clean.
DISCLAIMER  Much of it was written late at night,
----------  once it did what it's supposed to do, 
            it wasn't looked at again... @units..
"""

from typing import List, Tuple
from functools import wraps

from fastapi import HTTPException
import jwt
import re

from .models import CompletedCourse, User


# MongoDB Aggregation Query Utility
# ---------------------------------
# Originally used this, but eventually got better at mongo queries and this was kinda pointless

SearchParam = Tuple[str, str] # eg: ('name', 'differential equations')

def create_pipeline(skip=0, limit=0, matches: List[SearchParam] = []):
    """Returns pipeline to match list of regexes then skip and limit"""
    pipeline = []
    for attr, value in matches:
        if value:
            pipeline.append(
                {'$match': {
                    attr: {
                        '$regex': value,
                        '$options': 'i'
                    }
                }}
            )
    pipeline += [{'$skip': skip}, 
                 {'$limit': limit}]
    return pipeline


# Authentication Decorator
# ------------------------

def token(func):
    """
    Auth decorator for routes
        Prevents endpoint requests that do not carry a
        token that matches some users encoded public key
    """
    @wraps(func)
    async def decorator(*args, **kwargs):
        try:
            request = kwargs['request']
            auth_token = request.headers.get('x-access-token')
            if not auth_token:
                raise HTTPException(status_code=401, detail="Unauthorized")
            decoded_token = jwt.decode(auth_token, request.app.secret, algorithms="HS256")
            user = request.app.db.users.find_one({'public': decoded_token['public']})

            if not user:
                raise HTTPException(status_code=401, detail="User not found")
        except jwt.ExpiredSignatureError: # Token expiration not implemented
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        request.state.user = User(**user)
        return await func(*args, **kwargs)

    return decorator


# Course Planning Utility Functions
# ---------------------------------

def num_units_completed(completed_courses: List[CompletedCourse]):
    """Returns the number of units completed"""
    return sum([float(c.credits) for c in completed_courses])

def year_standing(units: float) -> int:
    if units < 12:
        return 1
    elif units < 26.5:
        return 2
    elif units < 41.5:
        return 3
    else:
        return 4

def is_course_req(req):
    """Return True or False if the requirement is a course requirement and not a higher order requirement"""
    if type(req) != dict:
        return False
    req_list = req.get('reqList')
    if req_list is None or type(req_list) != list or len(req_list) == 0 or type(req_list[0]) != str:
        return False
    return len(re.findall(r"[a-zA-Z]{2,4}\d{3}", req_list[0])) != 0

def minimum_year_satisfied(units, rule):
    """Return True or False if the student satisfies a rule like minimum third-year"""
    if units < 12 and ('second' in rule or 'third' in rule or 'fourth' in rule or 'fifth' in rule):
        return False
    elif units < 26.5 and ('third' in rule or 'fourth' in rule or 'fifth' in rule):
        return False
    elif units < 41.5 and ('fourth' in rule or 'fifth' in rule):
        return False
    elif units > 42 and 'fifth' in rule:
        return False
    return True

def is_req_satisfied(req, units, completed_course_codes):
    """Return True or False if the requirement is satisfied given completed courses"""
    if type(req) == str: # min year standing, could be other, may need to look into this...
        return minimum_year_satisfied(units, req)
    
    if type(req) == list:
        return all(is_req_satisfied(r, units, completed_course_codes) for r in req)

    qty = req.get('quantity')
    reqlist = req.get('reqList')

    if is_course_req(req): 
        if qty == "ALL":
            if not all(code in completed_course_codes for code in req['reqList']):
                return False
        elif type(qty) == int:
            ct = 0
            for i in range(len(reqlist)):
                code = reqlist[i]
                if code in completed_course_codes:
                    ct += 1
            if ct < qty:
                return False
        elif qty is None:
            # print("course req, qty is none")
            # pprint(req)
            return False
        
    else: # higher order prereqs
        if qty == "ALL":
            return all(is_req_satisfied(x, units, completed_course_codes) for x in reqlist)
        elif type(qty) == int:
            ct = 0
            for i in range(len(reqlist)):
                if is_req_satisfied(reqlist[i], units, completed_course_codes):
                    ct += 1
            if ct < qty:
                return False
        elif qty is None:
            # print("upper req, qty is none")
            # print(req)
            return False
    
    return True

def can_take(course, units, completed_course_codes):
    """Return True or False if all requirements are satisfied for course given completed courses"""
    prereqs = course.get('prerequisites')
    if not prereqs:
        return True
    return all(is_req_satisfied(prereq, units, completed_course_codes) for prereq in prereqs)

def get_unsatisfied_course_reqs(req, units, completed_course_codes):
    new = []
    if is_course_req(req):
        if not is_req_satisfied(req, units, completed_course_codes):
            return [req]
    elif type(req) == list:
        for r in req:
            if not is_req_satisfied(req, units, completed_course_codes):
                new += get_unsatisfied_course_reqs(r, units, completed_course_codes)
    elif type(req) == str: # other reqs... dont bother with them here
        pass
    else:
        if not is_req_satisfied(req, units, completed_course_codes):
            new += get_unsatisfied_course_reqs(req['reqList'], units, completed_course_codes)
    return new

def get_course_reqs_left(requirements, units, completed_course_codes):
    """Return a dictionary of the course requirements left. Keys are year and values are a list of course reqs."""
    reqs_left = {}

    if requirements is None:
        return {}
    
    # Get unsatisfied reqs
    for info, req in requirements.items():
        reqs_left[info] = get_unsatisfied_course_reqs(req, units, completed_course_codes)

    # Modify based on what's needed to be taken
    for info, reqs in reqs_left.items():
        for req in reqs:
            qty = req.get('quantity')
            if qty is None: # Unfortunately there are some unparsed requirements.
                continue
            if qty == 'ALL':
                req['reqList'] = [code for code in req['reqList'] if code not in completed_course_codes]

            elif type(qty) == int:
                ct = 0
                new_codes = []
                for code in req['reqList']:
                    if code in completed_course_codes:
                        ct += 1
                    else:
                        new_codes.append(code)
                req['quantity'] = qty - ct
                req['reqList'] = new_codes
            else:
                raise Exception

    reqs_left = {k:v for k,v in reqs_left.items() if v!=[]}
    return reqs_left

def get_courses_left(requirements, units, completed_course_codes):
    course_reqs_left = get_course_reqs_left(requirements, units, completed_course_codes)
    course_reqs = []
    for reqs in course_reqs_left.values():
        for req in reqs:
            course_reqs.append(req)
    course_codes = []
    for req in course_reqs:
        if any(type(x) == dict for x in req['reqList']):
            continue
        course_codes += req['reqList']
    
    return course_codes

def get_useful_courses(db, requirements, units, completed_course_codes):
    """Returns a triplet containing courses left in degree which (potential_courses, missing_prereq, not_offered)"""
    courses_left = get_courses_left(requirements, units, completed_course_codes)
    courses = db.courses.aggregate([{'$match': {'_id': {'$in': courses_left}}}])
    potential_courses = [x['_id'] for x in courses if can_take(x, units, completed_course_codes)]
    missing_prereq = [x['_id'] for x in courses if x not in potential_courses]
    not_offered = [code for code in courses_left if code not in potential_courses]
    return (potential_courses, missing_prereq, not_offered)


# Translations

def get_completion(
        client,
        prompt: str,
        system_message: str = "You are a helpful assistant.",
        model: str = "gpt-4-turbo",
        temperature: float = 0.3
        ) -> str:
    response = client.chat.completions.create(
        model=model,
        temperature=temperature,
        top_p=1,
        messages=[{"role": "system", "content": system_message},
                  {"role": "user", "content": prompt}])
    return response.choices[0].message.content

def translate(client, prompt, language):
    translation = get_completion(
        client,
        prompt=f"Translate this text from English into {language}.\nText: {prompt}",
        system_message=f"You are a translation assistant that translates from English into {language}",
        model="gpt-4")
    return translation

def as_actor(client, prompt, actor):
    translation = get_completion(
        client,
        prompt=f"Rewrite this text as if you were {actor}.\nText: {prompt}",
        system_message=f"You are a translation assistant that rewrites English texts in the prose of {actor}",
        temperature=0.9,
        model="gpt-4")
    return translation
