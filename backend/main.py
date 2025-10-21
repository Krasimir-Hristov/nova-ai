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

# Инициализирай модела
try:
    model = genai.GenerativeModel(
        "gemini-2.0-flash",
        generation_config={
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
        }
    )
    print("[BACKEND LOG] Модел gemini-2.0-flash успешно инициализиран", file=sys.stdout, flush=True)
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


@app.get("/")
def read_root():
    """Root endpoint that returns a greeting."""
    return {"Hello": "World"}



@app.post("/api/chat/stream")
async def chat_stream(data: ChatMessage):
    """Streaming chat endpoint - връща отговора буква по буква."""
    
    print(f"\n[BACKEND LOG] Получено съобщение: {data.message}", file=sys.stdout, flush=True)
    
    async def generate():
        try:
            # Използвай streaming за Gemini
            response = model.generate_content(
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

