import random
import json

with open("courses.json", 'r') as f:
    courses = json.load(f)

with open("programs.json", 'r') as f:
    degrees = json.load(f)

with open("sections.json") as f:
    sections = json.load(f)

d_keys = random.sample(sorted(degrees),20)
s_keys = random.sample(sorted(sections), 50)

out_degrees = {}
out_courses = {}
out_sections = {}

for code in d_keys:
    out_degrees[code] = degrees[code]

for code in s_keys:
    out_courses[code] = courses[code]
    out_sections[code] = sections[code]

with open("samples/degrees.json", 'w') as f:
    f.write(json.dumps(out_degrees))
with open("samples/courses.json", 'w') as f:
    f.write(json.dumps(out_courses))
with open("samples/sections.json", 'w') as f:
    f.write(json.dumps(out_sections))
