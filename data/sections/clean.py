"""
"Clean" the section information.
"""

import os
import json
from pprint import pprint
from collections import defaultdict

with open('sections_raw.json', 'r') as f:
    sections_raw = json.loads(f.read())

def make_days_string(days):
    out = ""
    if days[0]:
        out+="M"
    if days[1]:
        out+="T"
    if days[2]:
        out+="W"
    if days[3]:
        out+="Th"
    if days[4]:
        out+="F"
    if days[5]:
        out+="Sa"
    if days[6]:
        out+="Su"
    return out

sections = {}
for raw in sections_raw:
    course_section = {
        'code': raw.get('subjectCourse'),
        'term': raw.get('term'),
    }

    # Get faculty 
    faculty = raw.get('faculty')
    if faculty:
        fs = []
        for f in faculty:
            fs.append({
            'id': f.get('bannerId'),
            'name': f.get('displayName'),
            'email': f.get('emailAddress'),
            'primary': f.get('primaryIndicator')
        })
        faculty = fs

    # Create meetings list or add to existing
    new_meeting = None
    mf = raw.get('meetingsFaculty')
    if mf:
        mf = mf[0] # ignore individual sections with multiple meeting times. very few of these...
        mt = mf.get('meetingTime')
        if mt and len(mt) > 0:
            new_meeting = {
                'crn': raw.get('courseReferenceNumber'),
                'f2f': raw.get('instructionalMethod'),
                'seq': raw.get('sequenceNumber'),
                'is_linked': raw.get('isSectionLinked'),
                'start': mt.get('beginTime'),
                'end': mt.get('endTime'),
                'building': mt.get('buildingDescription'),
                'building_number': mt.get('building'),
                'start_date': mt.get('startDate'),
                'end_date': mt.get('endDate'),
                'type': mt.get('meetingType'),
                'description': mt.get('meetingTypeDescription'),
                'monday': mt.get('monday'),
                'tuesday': mt.get('tuesday'),
                'wednesday': mt.get('wednesday'),
                'thursday': mt.get('thursday'),
                'friday': mt.get('friday'),
                'saturday': mt.get('saturday'),
                'sunday': mt.get('sunday'),
                'days': make_days_string((
                            mt.get('monday'), mt.get('tuesday'), mt.get('wednesday'), mt.get('thursday'), 
                            mt.get('friday'), mt.get('saturday'), mt.get('sunday'))),
                'faculty': faculty
            }
    existing = sections.get(course_section['code'])
    if existing and existing.get('meetings'):
        meetings = existing.get('meetings')
        meetings.append(new_meeting)
    else:
        meetings = [new_meeting]
    course_section['meetings'] = meetings

    sections[course_section['code']] = course_section

with open('sections_clean.json', 'w') as f:
    f.write(json.dumps(sections, indent=4))