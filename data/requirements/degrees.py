"""
SOURCE: https://github.com/VikeLabs/uvic-course-scraper

Script to parse HTML requirements
Assumes the degrees are already saved 
in data/temp_programs.json with html_requirements

Some testing is included in comments at the bottom
"""

import re
import json
from pprint import pprint
from bs4 import BeautifulSoup



def parse_pre_co_reqs(pre_co_reqs: str):
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
                        nested_req['unparsed'] = item.text # TODO: Improve this
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

def parse_degree_reqs(deg_reqs):
    split_reqs = deg_reqs.split('grouping-label')[1:]
    reqs = {}
    for req in split_reqs:
        info = BeautifulSoup(req, 'html.parser').find_all('span')[0].text
        reqs[info] = parse_pre_co_reqs(req)

    return reqs



# Add parsed requirements
with open("../data/temp_programs.json", 'r') as f:
    degrees = json.load(f)

for code, degree in degrees.items():

    html_req = degree.get('html_requirements')
    if html_req is not None:
        degree['requirements'] = parse_degree_reqs(html_req)

    degree_specs = degree.get('specializations')
    if degree_specs is not None:
        for spec in degree_specs:
            spec_html_requirements = spec.get('html_requirements')
            if spec_html_requirements:
                spec['requirements'] = parse_degree_reqs(spec_html_requirements)



# Save updated programs.json
with open("../data/temp_programs.json", 'w') as f:
    f.write(json.dumps(degrees, indent=4))



### Testing
### -------

# deg = degrees["BFA-THFM"]
# req = deg['html_requirements']
# pprint(req)
# pprint(parse_degree_reqs(req))
# print(deg['pid'])
###


### Get the course requirement list
# def is_course_req(req):
#     """Return True or False if the requirement is a course requirement and not a higher order requirement"""
#     if type(req) != dict:
#         return False
#     req_list = req.get('reqList')
#     if req_list is None or type(req_list) != list or len(req_list) == 0 or type(req_list[0]) != str:
#         return False
#     return len(re.findall(r"[a-zA-Z]{2,4}\d{3}", req_list[0])) != 0

# with open("programs.json", 'r') as f:
#     degrees = json.loads(f.read())

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
    
# for degree in degrees.values():
#     req = degree.get('requirements')
#     if req is None:
#         degree['requirement_course_list'] = None
#     else:
#         rs = []
#         for r in req.values():
#             t = get_prerequisite_courses(r)
#             t = [x for x in t if type(x) == str and len(x) < 10]
#             rs.extend(t)
#         degree['requirement_course_list'] = rs

# # pprint(degrees['BSC-CASC']['prerequisite_course_list'])

# with open('programs.json', 'w') as f:
#     f.write(json.dumps(degrees, indent=4))
###