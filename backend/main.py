"""FastAPI server for Nova AI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    """Chat endpoint that processes user messages."""
    user_message = data.message.lower()
    
    # Прости разговори за демонстрация
    responses = {
        "привет": "Привет! Как мога да ти помогна?",
        "привет nova": "Здравей! Аз съм NOVA, твоя AI асистент. Как мога да ти помогна?",
        "як се казваш": "Аз съм NOVA - Nova Open Virtual Assistant. Радвам се да те срещам!",
        "какво правиш": "Аз съм AI асистент, готова да отговоря на всякакви въпроси и да помогна с различни задачи.",
        "довиждане": "До скоро! Успех ти желая! 👋",
        "спасибо": "Много радо! Ако трябва още нещо, просто ми кажи! 😊",
    }
    
    # Поиск на отговор
    for key, response in responses.items():
        if key in user_message:
            return {"response": response}
    
    # Default отговор
    return {"response": f"Интересна мисъл! Ще трябва да мисля повече за това: '{data.message}'"}

