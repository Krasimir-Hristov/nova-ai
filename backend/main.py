"""FastAPI server for Nova AI backend."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import json
import sys

# Зареди .env файл
load_dotenv()

# Конфигурирай Gemini API
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Системен промпт за NOVA
SYSTEM_PROMPT = """Ти си NOVA - Personal Assistant. Ти си полезен, интелигентен AI асистент.
Отговаряй на български език. Когато отговаряш:
- Бъди кратък и ясен
- Помагай на потребителя по всяко съобщение
- Ако нямаш информация, кажи честно
- Бъди услужлив и любезен
- Можеш да използваш емоджи когато е уместно"""

# Налични модели организирани по компания
AVAILABLE_MODELS = {
    "Google": {
        "gemini-2.0-flash": {
            "name": "Gemini 2.0 Flash",
            "description": "Бързо и мощно",
        },
    },
}

# Текущо избрана компания и модел
current_company = "Google"
current_model_name = "gemini-2.0-flash"

def get_model(model_name: str = "gemini-2.0-flash"):
    """Върни модела с дадено име или хвърли грешка"""
    # Проверяваме дали моделът съществува
    model_exists = False
    for company_models in AVAILABLE_MODELS.values():
        if model_name in company_models:
            model_exists = True
            break
    
    if not model_exists:
        raise ValueError(f"Моделът '{model_name}' не съществува. Налични модели: {', '.join([m for company in AVAILABLE_MODELS.values() for m in company.keys()])}")
    
    model = genai.GenerativeModel(
        model_name,
        system_instruction=SYSTEM_PROMPT,
        generation_config={
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
        }
    )
    return model

# Инициализирай дефолтния модел
try:
    model = get_model(current_model_name)
    print(f"[BACKEND LOG] Модел {current_model_name} успешно инициализиран", file=sys.stdout, flush=True)

except Exception as e:
    print(f"[BACKEND ERROR] Грешка при инициализация на gemini-2.0-flash: {str(e)}", file=sys.stdout, flush=True)
    raise  # Преди инициализацията на приложението

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
    company: str = "Google"  # Опционално, дефолт е Google
    model: str = "gemini-2.0-flash"  # Опционално, дефолт е gemini-2.0-flash


@app.get("/")
def read_root():
    """Root endpoint that returns a greeting."""
    return {"Hello": "World"}


@app.get("/api/models")
def get_available_models():
    """Върни списък на налични модели и компании"""
    return {
        "current_company": current_company,
        "current_model": current_model_name,
        "models": AVAILABLE_MODELS
    }


@app.post("/api/set-model")
def set_model(model_name: str):
    """Смени текущо избран модел"""
    global current_model_name, model
    
    # Проверяваме дали моделът съществува
    model_exists = False
    for company_models in AVAILABLE_MODELS.values():
        if model_name in company_models:
            model_exists = True
            break
    
    if not model_exists:
        available = ', '.join([m for company in AVAILABLE_MODELS.values() for m in company.keys()])
        return {"error": f"Неизвестен модел: {model_name}. Налични модели: {available}"}
    
    try:
        model = get_model(model_name)
        current_model_name = model_name
        print(f"[BACKEND LOG] Модел променен на: {model_name}", file=sys.stdout, flush=True)
        return {"status": "success", "current_model": current_model_name}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/chat/stream")
async def chat_stream(data: ChatMessage):
    """Streaming chat endpoint - връща отговора буква по буква."""
    
    print(f"\n[BACKEND LOG] Получено съобщение: {data.message}", file=sys.stdout, flush=True)
    print(f"[BACKEND LOG] Избран модел: {data.model}", file=sys.stdout, flush=True)
    
    async def generate():
        try:
            # Вземи избрания модел или използвай дефолтния
            selected_model = get_model(data.model)
            
            # Използвай streaming за Gemini
            response = selected_model.generate_content(
                data.message,
                stream=True
            )
            
            chunk_count = 0
            sent_chunks = set()  # За проследяване на изпратени chunks
            
            for chunk in response:
                if chunk.text:
                    chunk_count += 1
                    # Генерираме уникален ID за всеки chunk
                    chunk_id = id(chunk)
                    
                    # Проверяваме дали този chunk вече е изпратен
                    if chunk_id not in sent_chunks:
                        sent_chunks.add(chunk_id)
                        
                        # Изпращаме като JSON за по-надежна сериализация
                        message = json.dumps({"text": chunk.text}, ensure_ascii=False)
                        print(f"[BACKEND LOG] Chunk #{chunk_count}: {message[:100]}...", file=sys.stdout, flush=True)
                        yield f"data: {message}\n\n"
                    else:
                        print(f"[BACKEND LOG] Дублиран chunk #{chunk_count} - ПРОПУСНАТ", file=sys.stdout, flush=True)
            
            print(f"[BACKEND LOG] Стрийма завършен. Всичко {chunk_count} chunks", file=sys.stdout, flush=True)
            # Сигнал за край
            yield "data: {\"done\": true}\n\n"
        except Exception as e:
            error_msg = json.dumps({"error": str(e)}, ensure_ascii=False)
            print(f"[BACKEND LOG] ГРЕШКА: {str(e)}", file=sys.stdout, flush=True)
            yield f"data: {error_msg}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

