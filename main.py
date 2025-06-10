from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import requests
import json

app = FastAPI()

# Allow all origins and methods (CORS setup for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy NER model
nlp = spacy.load("en_core_web_sm")

# Pydantic model for request body
class Prompt(BaseModel):
    prompt: str

@app.post("/process")
async def process_text(prompt_data: Prompt):
    prompt = prompt_data.prompt
    print(f"Received prompt: {prompt}")

    # Extract named entities
    doc = nlp(prompt)
    entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    print("Named Entities:", entities)

    # Call Ollama LLM API
    try:
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": f"Paraphrase this: {prompt}"
            },
            stream=True  # Enable streaming
        )
        ollama_response.raise_for_status()

        llm_response = ""
        for line in ollama_response.iter_lines():
            if line:
                print(f"Received line: {line}")
                data = json.loads(line)
                if "response" in data:  # ✅ FIXED HERE
                    llm_response += data["response"]

        llm_response = llm_response.strip()
        print("Complete LLM response:", llm_response)

    except Exception as e:
        llm_response = f"Error contacting LLM: {e}"
        print("LLM Error:", e)

    return {
        "entities": entities,
        "llm_response": llm_response
    }













# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import spacy
# from fastapi.responses import JSONResponse

# app = FastAPI()

# # Allow frontend requests
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Change * to your frontend's domain for production
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # nlp = spacy.load("en_core_web_sm")
# # pip install spacy-transformers
# # python -m spacy download en_core_web_trf

# nlp = spacy.load("en_core_web_trf")


# class Prompt(BaseModel):
#     prompt: str

# @app.post("/process")
# async def process_text(prompt_data: Prompt):
#     prompt = prompt_data.prompt
#     print(f"Received prompt: {prompt}")

#     doc = nlp(prompt)
#     entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
#     print("Named Entities:", entities)

#     try:
#         # Simulated LLM response
#         llm_response = f"This is a paraphrased version of: \"{prompt}\""
#     except Exception as e:
#         llm_response = f"Error contacting LLM: {str(e)}"
#         print("LLM Error:", e)

#     return JSONResponse(content={
#         "entities": entities,
#         "llm_response": llm_response
#     })
