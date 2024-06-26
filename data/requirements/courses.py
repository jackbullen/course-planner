"""
SOURCE: https://github.com/VikeLabs/uvic-course-scraper

Script to parse HTML requirements
Assumes the courses are already saved 
in data/temp_courses.json with html_requirements

Some testing is included in comments at the bottom
"""

import re
import json
from pprint import pprint
from bs4 import BeautifulSoup
from typing import List, Union, Dict

# Define types
CoursePrereq = Dict[str, str]
NestedPreCoRequisites = Dict[str, Union[str, int, bool]]
KualiCourseItem = Dict[str, Union[str, None]]
KualiCourseItemParsed = Dict[str, Union[str, None, List[Union[NestedPreCoRequisites, CoursePrereq, str]]]]

def parse_pre_co_reqs(pre_co_reqs: str) -> List[Union[NestedPreCoRequisites, CoursePrereq, str]]:
    if pre_co_reqs is None:
        return []
    
    reqs = []

    quantity_regex = re.compile(r'(Complete|(?P<coreq>Completed or concurrently enrolled in)) *(?P<quantity>all|\d+)* (of|(?P<units>units from))')
    earn_minimum_regex = re.compile(r'Earn(ed)? a minimum (?P<unit>grade|GPA) of (?P<min>[^ ]+) (in (?P<quantity>\d+))?')
    course_regex = re.compile(r'(?P<subject>\w{2,4})(?P<code>\d{3}\w?)')

    soup = BeautifulSoup(pre_co_reqs, 'html.parser')

    # Iterate through each unordered list in the HTML
    ul_elements = soup.select('ul')
    if ul_elements:
        for item in ul_elements[0].children:
            if item.name == 'li' or item.name == 'div':
                quantity_match = quantity_regex.search(item.text)
                earn_min_match = earn_minimum_regex.search(item.text)

                # If the current target has nested information
                if item.ul:
                    nested_req = {}

                    # If the nested requisites require a certain quantity
                    # i.e. "Complete X of the following:"
                    if quantity_regex.search(item.text) and quantity_match:
                        if quantity_match.group('quantity') == 'all':
                            nested_req['quantity'] = 'ALL'
                        else:
                            nested_req['quantity'] = int(quantity_match.group('quantity')) if quantity_match.group('quantity') else None
                        if quantity_match.group('coreq'):
                            nested_req['coreq'] = True
                        if quantity_match.group('units'):
                            nested_req['units'] = True
                    # Else if the nested requisites require a minimum
                    # i.e. "Earned a minimum GPA of X in Y"
                    elif earn_minimum_regex.search(item.text) and earn_min_match:
                        if earn_min_match.group('quantity'):
                            nested_req['quantity'] = int(earn_min_match.group('quantity'))
                        else:
                            nested_req['quantity'] = 'ALL'
                        # add grade or gpa values to nested_req object
                        nested_req[earn_min_match.group('unit').lower()] = earn_min_match.group('min')
                    else:
                        nested_req['unparsed'] = item.text
                    nested_req['reqList'] = parse_pre_co_reqs(str(item.ul))
                    reqs.append(nested_req)
                else:
                    # If it finds a UVic course as the req
                    if item.a:
                        course_match = course_regex.search(item.a.text)
                        if course_match:
                            reqs.append(course_match.group('subject') + course_match.group('code'))
                    else:
                        reqs.append(item.text.strip())

    return reqs


# with open("courses.json", 'r') as f:
#     courses = json.loads(f.read())

# for code, course in courses.items():
#     html_prereq = course['html_prerequisites']
#     if html_prereq is None:
#         continue
#     try:
#         prereq = parse_pre_co_reqs(html_prereq)
#         course['prerequisites'] = prereq
#     except Exception as e:
#         print(code, e)

# with open("courses.json", 'w') as f:
#     f.write(json.dumps(courses, indent=4))
### AFter running the extensive testing below i declare the prereqs are working ;) let's right them (code above) in and replace my ***** ones




# with open("course_prerequisites.json", 'r') as f:
#     course_prereqs = json.loads(f.read())


### TEST SPECIFIC COURSE
# code = 'ECON383'
# html_prereq = courses[code]['html_prerequisites']
# pprint(html_prereq)
# pprint(parse_pre_co_reqs(html_prereq))
# pprint(course_prereqs[code]['preAndCorequisites'])
# print(courses[code]['pid'])
###


### CHECK THIS PREREQ AGAINST VIKE LABS PREREQS
# ct = 0
# for code in courses:
#     if code == 'AHVS310G':
#         true_prereq = course_prereqs['AHVS310F'].get('preAndCorequisites')
#     else:
#         true_course = course_prereqs.get(code)
#     if true_course is None:
#         continue
#     true_prereq = true_course.get('preAndCorequisites')
#     if true_prereq is None:
#         continue
    
#     try:
#         html_prereq = courses[code].get('html_prerequisites')
#         prereq = parse_pre_co_reqs(html_prereq)

#     except Exception as e:
#         pprint(html_prereq)
#         print(e)
#         print(code)
#         break

#     # if prereq != true_prereq:
#     #     ct += 1
#     #     print(code, courses[code]['pid'])
# print(ct, "out of", len(courses), "do not agree")
###


##### SOME CODE TO INCLUDE A FIELD THAT HAS ALL OF THE PREREQ COURSES AS A LIST.

# def is_course_req(req):
#     """Return True or False if the requirement is a course requirement and not a higher order requirement"""
#     if type(req) != dict:
#         return False
#     req_list = req.get('reqList')
#     if req_list is None or type(req_list) != list or len(req_list) == 0 or type(req_list[0]) != str:
#         return False
#     return len(re.findall(r"[a-zA-Z]{2,4}\d{3}", req_list[0])) != 0

# with open("courses.json", 'r') as f:
#     courses = json.loads(f.read())

# def get_prerequisite_courses(req):
#     if is_course_req(req):
#         return req['reqList']
#     if type(req) == list:
#         cs = []
#         for x in req:
#             cs += get_prerequisite_courses(x)
#         return cs
#     if type(req) == str:
#         return []
#     return get_prerequisite_courses(req['reqList'])
    

# for course in courses.values():
#     prereq = course.get('prerequisites')
#     if prereq is None:
#         course['prerequisite_course_list'] = None
#     else:
#         course['prerequisite_course_list'] = get_prerequisite_courses(prereq)

# with open('courses.json', 'w') as f:
#     f.write(json.dumps(courses, indent=4))