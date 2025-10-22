"""Configuration module for Nova AI backend."""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Google Gemini API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

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
        # Gemini 2.5 Series - Latest & Most Powerful
        "gemini-2.5-pro": {
            "name": "Gemini 2.5 Pro",
            "description": "Most powerful Gemini (1M tokens)",
        },
        "gemini-2.5-flash": {
            "name": "Gemini 2.5 Flash",
            "description": "Fast multimodal (1M tokens)",
        },
        "gemini-2.5-flash-lite": {
            "name": "Gemini 2.5 Flash-Lite",
            "description": "Lightweight and efficient",
        },
        
        # Gemini 2.0 Series
        "gemini-2.0-flash": {
            "name": "Gemini 2.0 Flash",
            "description": "Fast and versatile",
        },
        "gemini-2.0-flash-lite": {
            "name": "Gemini 2.0 Flash-Lite",
            "description": "Compact version",
        },
        "gemini-2.0-flash-thinking-exp": {
            "name": "Gemini 2.0 Flash Thinking",
            "description": "Reasoning experimental",
        },
        
        # Gemini Special Models
        "gemini-2.5-computer-use-preview-10-2025": {
            "name": "Gemini 2.5 Computer Use",
            "description": "Computer interaction preview",
        },
        "learnlm-2.0-flash-experimental": {
            "name": "LearnLM 2.0 Flash",
            "description": "Learning-focused model",
        },
        
        # Latest Aliases (auto-update to newest)
        "gemini-pro-latest": {
            "name": "Gemini Pro (Latest)",
            "description": "Latest Pro version",
        },
        "gemini-flash-latest": {
            "name": "Gemini Flash (Latest)",
            "description": "Latest Flash version",
        },
    },
    "OpenAI": {
        # GPT-5 Series - Latest & Most Powerful
        "gpt-5-pro": {
            "name": "GPT-5 Pro",
            "description": "Most powerful model",
        },
        "gpt-5": {
            "name": "GPT-5",
            "description": "Latest flagship model",
        },
        "gpt-5-mini": {
            "name": "GPT-5 Mini",
            "description": "Compact GPT-5 version",
        },
        
        # o-series - Reasoning Models
        "o3": {
            "name": "o3",
            "description": "Advanced reasoning (newest)",
        },
        "o1-pro": {
            "name": "o1 Pro",
            "description": "Pro reasoning model",
        },
        "o1": {
            "name": "o1",
            "description": "Reasoning model",
        },
        "o3-mini": {
            "name": "o3 Mini",
            "description": "Compact reasoning",
        },
        "o1-mini": {
            "name": "o1 Mini",
            "description": "Light reasoning model",
        },
        
        # GPT-4.1 Series
        "gpt-4.1": {
            "name": "GPT-4.1",
            "description": "Enhanced GPT-4",
        },
        "gpt-4.1-mini": {
            "name": "GPT-4.1 Mini",
            "description": "Compact GPT-4.1",
        },
        
        # GPT-4o Series
        "chatgpt-4o-latest": {
            "name": "ChatGPT-4o (Latest)",
            "description": "Latest ChatGPT version",
        },
        "gpt-4o": {
            "name": "GPT-4o",
            "description": "Multimodal model",
        },
        "gpt-4o-mini": {
            "name": "GPT-4o Mini",
            "description": "Fast and cost-effective",
        },
        
        # GPT-4 Turbo
        "gpt-4-turbo": {
            "name": "GPT-4 Turbo",
            "description": "Fast and powerful",
        },
        
        # GPT-3.5
        "gpt-3.5-turbo": {
            "name": "GPT-3.5 Turbo",
            "description": "Efficient and fast",
        },
    },
}

# Default model
DEFAULT_COMPANY = "Google"
DEFAULT_MODEL = "gemini-2.5-pro"

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
