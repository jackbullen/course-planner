"""
Get the meeting time information for course sections in Fall 2024 and Spring 2025
"""

import json
import requests

offsets = list(range(0, 3001, 500))
springheaders = {'Cookie': '__________'}
fallheaders = {'Cookie': '____________'}
headers = [fallheaders, springheaders]
sections = []
for header in headers:
    for offset in offsets:
        url = f"____________"
        req = requests.get(url, headers=header)
        partial = json.loads(req.content)
        sections.extend(partial['data'])

with open('sections_raw.json', 'w') as f:
    f.write(json.dumps(sections)) 