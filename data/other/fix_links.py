"""
Put updated calendar links in courses.json
"""

import json

with open("courses.json", 'r') as f:
    courses = json.load(f)

for course in courses.values():
    if course['cal'] == 'grad':
        course['link'] = f"________________"
    else:
        course['link'] = f"________________"

with open("courses.json", 'w') as f:
    f.write(json.dumps(courses, indent=4))