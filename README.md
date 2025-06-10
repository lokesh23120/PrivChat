PrivChat – PII Detection & Paraphrasing App
PrivChat is a privacy-focused web app that allows users to input text, analyze it for PII (Personally Identifiable Information), and receive paraphrased LLM responses while visually highlighting sensitive entities like names, locations, emails, and phone numbers.

Features
PII Detection:** Identifies entities like PERSON, ORG, LOCATION, EMAIL, PHONE, etc.
Entity Highlighting:** Highlights sensitive data in color-coded formats.
LLM Integration:** Paraphrases user input using a local LLM backend.
Multi-Chat Space:** Switch between two input/output contexts easily.
Sanitized Output:** Clearly shows detected PII for inspection.
Responsive UI:** Clean and user-friendly interface.

Tech Stack
Frontend:** HTML, CSS, JavaScript
Backend:** FastAPI, spaCy (NER), Uvicorn
Model:** Local LLM model (via Ollama or custom API)
Styling:** Custom styles with modern UI

command: uvicorn main:app --reload
