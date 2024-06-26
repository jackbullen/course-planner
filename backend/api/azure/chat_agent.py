"""
Utils for simple RAG pattern
These functions are no longer used after switching to langchain agent.
"""

def calendar_course_to_string(doc):
    """
    Convert a CalendarCourse to a string for passing to LLM
    """
    return doc['_id'] + ": " + doc['name'] + "\n" + doc['description']

def degree_to_string(doc):
    """
    Convert a Degree to a string for passing to LLM
    """
    return doc['_id'] + ": " + doc['title'] + "\n" + doc['cred'] + "\n" + doc['description']


system_prompt = """
You are a helpful assistant.
You are given a prompt and context and you provide more information using your general knowledge about these courses and topics.
Only reference courses that have been explicitly provided to you as context.
"""

def rag_with_vector_search(ai_client, augmented_question: str, previous_messages: list =[]):
    """
    Get Chat Completion using augmented prompt
    """
    messages = [{"role": "system", "content": system_prompt}]
    for i, message in enumerate(previous_messages):
        if i%2 == 0:
            messages.append({"role": "user", "content": message})
        else:
            messages.append({"role": "assistant", "content": message})
    messages.append({"role": "user", "content": augmented_question})

    completion = ai_client.chat.completions.create(messages=messages, model="gpt-4", temperature=0.42)
    return completion.choices[0].message.content