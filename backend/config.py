"""Configuration module for Nova AI backend."""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Google Gemini API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# System prompt for NOVA
SYSTEM_PROMPT = """Ти си NOVA - Personal Assistant. Ти си полезен, интелигентен AI асистент.
Отговаряй на български език. Когато отговаряш:
- Бъди кратък и ясен
- Помагай на потребителя по всяко съобщение
- Ако нямаш информация, кажи честно
- Бъди услужлив и любезен
- Можеш да използваш емоджи когато е уместно"""

# Available models organized by company
AVAILABLE_MODELS = {
    "Google": {
        "gemini-2.0-flash": {
            "name": "Gemini 2.0 Flash",
            "description": "Бързо и мощно",
        },
    },
}

# Default model
DEFAULT_COMPANY = "Google"
DEFAULT_MODEL = "gemini-2.0-flash"

# Generation config
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
}

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
