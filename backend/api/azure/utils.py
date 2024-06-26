from langchain_community.vectorstores import AzureCosmosDBVectorSearch

def create_retriever(
    connection_string: str, 
    embedding_model,
    collection: str, 
    top_k: int = 3):
    vector_store =  AzureCosmosDBVectorSearch.from_connection_string(
        connection_string = connection_string,
        namespace = f"db.{collection}",
        embedding = embedding_model,
        index_name = "VectorSearchIndex",
        embedding_key = "embedding",
        text_key = "notes") # TODO: How to ask for more than one field here?
    return vector_store.as_retriever(search_kwargs={"k": top_k})

def generate_embedding(ai_client, text: str):
    response = ai_client.embeddings.create(input=text, model="text-embedding-ada-002")
    embeddings = response.data[0].embedding
    return embeddings

def vector_search(collection, embedded_query, num_results=3):
    """
    Perform a vector search on the specified collection by vectorizing
    the query and searching the vector index for the most similar documents.

    Returns a list of the top num_results most similar documents
    """
    pipeline = [
        {
            '$search': {
                "cosmosSearch": {
                    "vector": embedded_query,
                    "path": "embedding",
                    "k": num_results
                },
                "returnStoredSource": True }},
        {'$project': { 'similarityScore': { '$meta': 'searchScore' }, 'document' : '$$ROOT' } }
    ]
    results = collection.aggregate(pipeline)
    return results