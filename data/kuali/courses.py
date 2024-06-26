import re
import sys
import json
import requests
from bs4 import BeautifulSoup
from collections import defaultdict

with open('courses.json', 'r') as f:
    courses = json.load(f)



for id, curr_course in courses.items():
    response = requests.get(f"______________/{curr_course['pid']}")
    course = response.json()
    if course == []:
        continue

    prereq =  course.get('preAndCorequisites') 
    if not prereq:
        prereq = course.get('preOrCorequisites')

    # Get the year of the course
    match = re.search(r'\d+', id)
    if match:
        year = int(match.group()[0])
    else:# Year is unknown because no numbers in course code
        year = -1 

    if curr_course['cal'] == 'grad':
        link = f"______________"
    else:
        link = f"______________"

    notes = course.get('supplementalNotes')
    if notes:
        notes = BeautifulSoup(course.get('supplementalNotes')).text
    description = course.get('description')
    if description:
        description = BeautifulSoup(course.get('description')).text

    courses[id].update({
        'code': id,
        'notes': notes,
        'description': description,
        'credits': course.get('credits'),
        'year': year,
        'link': link ,
        'cross_listed': course.get('crossListedCourses'),
        'hours': course.get('hoursCatalogText'),
        'html_notes': course.get('supplementalNotes'),
        'html_description': course.get('description'),
        'html_prerequisites': prereq
    })



with open("temp_courses.json", "w") as f:
    json.dump(courses, f, indent=4)