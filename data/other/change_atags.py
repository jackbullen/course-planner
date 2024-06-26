"""
Script to replace HTML requirements with new a tags
"""

import json
import re

pattern = r'<a\s+href="([^"]+)"'

def replace_href(match):
    index = match.start()
    course_code_match = re.search(r'>[a-zA-Z]{3,4}\d{3}[A-Z]?', html[index:])
    
    if course_code_match:
        course_code = course_code_match.group(0)
        return f'<a href="/courses/{course_code[1:]}"'
    else:
        return match.group(0)

with open("programs.json", 'r') as f:
    degrees = json.load(f)

for degree in degrees.values():
    html = degree['html_requirements']
    if html:
        degree['html_requirements'] = html.replace(' target="_blank"', '')
        degree['html_requirements'] = re.sub(pattern, replace_href, html)

with open("programs.json", 'w') as f:
    f.write(json.dumps(degrees, indent=4))
    