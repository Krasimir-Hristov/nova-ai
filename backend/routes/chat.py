"""Routes for chat endpoints."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.model_service import ModelService
from services.chat_service import ChatService
from models import ChatMessage

router = APIRouter(prefix="/api", tags=["chat"])

# Initialize services
model_service = ModelService()
chat_service = ChatService(model_service)

# Initialize default model
model_service.initialize_model()


@router.post("/chat/stream")
async def chat_stream(data: ChatMessage):
    """Streaming chat endpoint - returns response word by word."""
    
    async def generate():
        async for chunk in chat_service.stream_response(data.message, data.model):
            yield chunk
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
