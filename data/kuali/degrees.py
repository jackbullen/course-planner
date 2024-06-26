"""
Script to get degree data from Kuali
Assumes the degrees are already saved 
in data/programs.json with codes, cal and pid
"""

import json
import requests
from bs4 import BeautifulSoup

with open('../data/programs.json', 'r') as f:
    programs = json.load(f)



# Get title, description, program notes, and html requirements
base_url = "______________"

for code, curr_degree in programs.items():
    # del degree['embedding']

    response = requests.get(f"{base_url}/{curr_degree['pid']}")
    degree = response.json()

    if type(degree) is list:
        continue

    if curr_degree['cal'] == 'undergrad':
        link = f"______________"
    else:
        link = f"______________"
    
    program_notes = degree.get("programNotes")
    if program_notes:
        program_notes = BeautifulSoup(program_notes, 'html.parser').text

    description = degree.get("description")
    if description:
        description = BeautifulSoup(description, 'html.parser').text

    degree_specs = []
    specializations = degree.get("specializations")
    if specializations:
        for spec in specializations:
            description = spec.get("description")
            if description:
                description = BeautifulSoup(description, 'html.parser').text

            degree_specs.append({
                "html_requirements": spec.get("requirements"),
                "spec_notes": spec.get("concentrationProgramNotes"), # probably want to get bs4.text
                "description": description,
                "pid": spec.get("pid"),
                "degree": spec.get("inheritedFrom"),
                "title": spec.get("title")
            })
    else:
        degree_specs = None

    inherited_description = degree.get('inheritedDescription')
    if inherited_description:
        inherited_description = BeautifulSoup(inherited_description, 'html.parser').text

    programs[code].update({
        'code': code,
        'link': link,
        'description': description,
        'program_notes': program_notes,
        'title': degree.get('title'),
        'html_requirements': degree.get('programRequirements'),
        'graduation_requirements': degree.get('graduation_requirements'),
        'html_inherited_course_list': degree.get('inheritedCourseList'),
        'inherited_description': inherited_description,
        'specializations': degree_specs
    })



# Save the updated data
with open("../data/temp_programs.json", "w") as f:
    json.dump(programs, f, indent=4)
