"""
Bring in generic course information like prerequisites, title, etc.
"""
import json

with open("sections_clean.json", "r") as f:
    sections = json.loads(f.read())
with open("../data/courses.json", "r") as f:
    courses = json.loads(f.read())

ct = 0
for code, section in sections.items():
    if code in courses:
        section['pid'] = courses[code]['pid']
        section['cal'] = courses[code]['cal']
        section['name'] = courses[code]['name']
        section['hours'] = courses[code]['hours']
        section['notes'] = courses[code]['notes']
        section['description'] = courses[code]['description']
        section['prerequisites'] = courses[code]['prerequisites']
        section['year'] = courses[code]['year']
        section['link'] = courses[code]['link']
        section['credits'] = courses[code]['credits']['credits']['min']
        section['requirement_course_list'] = courses[code]['requirement_course_list']
    else:
        section['pid'] = None
        section['cal'] = None
        section['name'] = None
        section['hours'] = None
        section['notes'] = None
        section['description'] = None
        section['prerequisites'] = None
        section['year'] = None
        section['link'] = None
        section['credits'] = None
        section['prerequisite_course_list'] = None

for sec in sections.values():
    sec['sections'] = [x for x in sec['sections'] if x] 

with open('sections.json', 'w') as f:
    f.write(json.dumps(sections, indent=4))