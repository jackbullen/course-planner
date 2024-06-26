import os
from io import BytesIO
# from azure.core.credentials import AzureKeyCredential
# from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import ContentFormat

# endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
# key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")

# doc_client = DocumentIntelligenceClient(
#         endpoint=endpoint, 
#         credential=AzureKeyCredential(key))

def count_pages(file):    
    """Return the number of pages in a PDF file"""
    import re
    regex_page_count = re.compile(r"/Type\s*/Page([^s]|$)", re.MULTILINE|re.DOTALL)
    contents = file.read()
    page_occurences = regex_page_count.findall(str(contents))
    return len(page_occurences)   
 
def extract_tables(result):
    """Extract table contents from Azure Document Intelligence result"""
    tables = []
    for table in result.tables:
        curr_table, curr_row = [], []
        curr_row_idx = 0
        for cell in table.cells:
            if curr_row_idx != cell.row_index:
                # add the current row into current table and reset current row
                curr_row_idx = cell.row_index
                curr_table.append(curr_row)
                curr_row = []
            curr_row.append(cell.content)
        # add the final row to the current table
        curr_table.append(curr_row)
        # add the current table to tables list
        tables.append(curr_table)
    return tables

def process_page_range(doc_client, file, page_range):
    """Return the tables and markdown content for the page range in file"""
    poller = doc_client.begin_analyze_document(
        model_id="prebuilt-layout", 
        analyze_request=file,
        content_type="application/octet-stream", 
        pages=page_range,
        output_content_format=ContentFormat.MARKDOWN)
    result = poller.result()
    tables = extract_tables(result)
    return tables, result.content

def get_course_details(row):
    """Returned cleaned course information or None if no credits were earned
        course = (code  , name       , grade, grade point, awarded units)
        sample = (CSC110, Programming, 91%  , 9          , 1.50         )
    """
    if any(x == "Dropped" for x in row):
        return None
    if len(row[0].split(' ')) == 1: # subject and course number are split
        if row[7] == "0.00" or row[7] == "":
            return None
        course = (row[0]+' '+row[1], row[3], row[5], row[6], row[7])
    else:
        if row[6] == "0.00" or row[6] == "":
            return None
        course = (row[0], row[2], row[4], row[5], row[6])

    return course

case1 = ['Course', 'Section', 'Description', 'Unit Value', 'Grade/ Status', 'Grade Point', 
         'Awarded\nUnits', 'Note', 'Comparative Mean / Size'] # regular
case2 = ['Course', 'Section', 'Description', 'Unit Value', 'Grade/ Status', 'Grade Point', 
         'Awarded Note Units', 'Comparative Mean / Size'] # Awarded Note Units
case3 = ['Course', '', 'Section', 'Description', 'Unit Value', 'Grade/ Status', 'Grade Point', 
         'Awarded Note Units', 'Comparative Mean / Size'] # Extra column before section
case4 = ['Course', 'Section', 'Description', 'Unit Value', 'Grade/ Status', 'Grade Point', 
         'Awarded\nUnits', 'Note', 'Comparative\nMean', '/ Size'] # Comparative Mean, Size
def extract_courses(tables): 
    """Return a list of cleaned course information from tables taken from doc intel result"""
    courses = []
    for table in tables:
        if table[0] not in [case1, case2, case3, case4]:
            continue
        for row in table[1:]:
            course = get_course_details(row)
            if course:
                courses.append(course)
    return list(map(lambda x: {
                    'code': x[0].replace(' ', ''), 
                    'title': x[1],
                    'grade': int(x[2].split(' ')[0].strip('%')),
                    'grade_letter': x[2].split(' ')[1],
                    'grade_point': int(x[3]),
                    'credits': float(x[4])}, 
                courses))

def process_transcript(doc_client, pdf_bytes):
    """Returns list of completed university courses"""
    pdf = BytesIO(pdf_bytes)
    num_pages = count_pages(pdf)

    page_ranges = [f'{i}-{i+1}' for i in range(1, num_pages, 2)]
    if num_pages % 2 == 1:
        page_ranges.append(str(num_pages))

    tables = []
    markdown = ""
    for page_range in page_ranges:
        pdf.seek(0)
        ts, md = process_page_range(doc_client, pdf, page_range)
        tables.extend(ts)
        markdown += "\n"+md
    markdown = '\n'.join(filter(lambda x: x.startswith('|'), markdown.split('\n')))
    return markdown, extract_courses(tables)