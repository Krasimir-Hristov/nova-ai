"""Global services instance for shared state across routes."""

from services.model_service import ModelService
from services.chat_service import ChatService

# Initialize services globally
model_service = ModelService()
chat_service = ChatService(model_service)

# Initialize default model
model_service.initialize_model()
