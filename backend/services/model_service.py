"""Service for managing AI models."""

import sys
import google.generativeai as genai
from config import AVAILABLE_MODELS, SYSTEM_PROMPT, GENERATION_CONFIG, GOOGLE_API_KEY


class ModelService:
    """Service for managing and initializing AI models."""
    
    def __init__(self):
        """Initialize the model service."""
        # Configure Gemini API
        genai.configure(api_key=GOOGLE_API_KEY)
        self.current_model = None
        self.current_model_name = None
    
    def get_available_models(self) -> dict:
        """Get all available models organized by company."""
        return AVAILABLE_MODELS
    
    def model_exists(self, model_name: str) -> bool:
        """Check if a model exists in available models."""
        for company_models in AVAILABLE_MODELS.values():
            if model_name in company_models:
                return True
        return False
    
    def get_available_model_names(self) -> list:
        """Get all available model names as a list."""
        return [
            model_name 
            for company in AVAILABLE_MODELS.values() 
            for model_name in company.keys()
        ]
    
    def initialize_model(self, model_name: str = "gemini-2.0-flash"):
        """Initialize a model with the given name."""
        if not self.model_exists(model_name):
            available = ', '.join(self.get_available_model_names())
            raise ValueError(
                f"Model '{model_name}' does not exist. Available models: {available}"
            )
        
        try:
            model = genai.GenerativeModel(
                model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config=GENERATION_CONFIG
            )
            self.current_model = model
            self.current_model_name = model_name
            print(
                f"[BACKEND LOG] Model {model_name} successfully initialized",
                file=sys.stdout,
                flush=True
            )
            return model
        except Exception as e:
            print(
                f"[BACKEND ERROR] Error initializing model {model_name}: {str(e)}",
                file=sys.stdout,
                flush=True
            )
            raise
    
    def set_model(self, model_name: str):
        """Set the current model."""
        if not self.model_exists(model_name):
            available = ', '.join(self.get_available_model_names())
            raise ValueError(
                f"Unknown model: {model_name}. Available models: {available}"
            )
        
        self.initialize_model(model_name)
    
    def get_current_model(self):
        """Get the current initialized model."""
        if self.current_model is None:
            self.initialize_model()
        return self.current_model
    
    def get_current_model_name(self) -> str:
        """Get the name of the current model."""
        return self.current_model_name or "gemini-2.0-flash"
