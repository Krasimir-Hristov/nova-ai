"""FastAPI server for Nova AI backend."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Зареди .env файл
load_dotenv()

# Конфигурирай Gemini API
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Инициализирай модела
try:
    model = genai.GenerativeModel("gemini-2.0-flash")
except:
    model = genai.GenerativeModel("gemini-1.5-pro")

app = FastAPI()

# Разреши CORS за frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    """Model за chat съобщение."""
    message: str


@app.get("/")
def read_root():
    """Root endpoint that returns a greeting."""
    return {"Hello": "World"}


@app.post("/api/chat")
def chat(data: ChatMessage):
    """Chat endpoint that processes user messages using Gemini API."""
    try:
        # Генерирай отговор usando Gemini
        response = model.generate_content(data.message)
        
        return {
            "response": response.text,
            "status": "success"
        }
    except Exception as e:
        return {
            "response": f"Възникна грешка: {str(e)}",
            "status": "error"
        }

