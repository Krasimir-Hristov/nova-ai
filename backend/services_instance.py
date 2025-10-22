"""Global services instance for shared state across routes."""

from services.model_service import ModelService
from services.chat_service import ChatService
from services.memory_service import ConversationMemoryManager

# Initialize services globally
model_service = ModelService()
memory_manager = ConversationMemoryManager()
chat_service = ChatService(model_service, memory_manager)

# Initialize default model
model_service.initialize_model()
