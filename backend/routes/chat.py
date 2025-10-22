"""Routes for chat endpoints."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services_instance import chat_service, model_service
from models import ChatMessage

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat/stream")
async def chat_stream(data: ChatMessage):
    """Streaming chat endpoint - returns response word by word."""
    
    # Set the model if different from current
    if data.model != model_service.get_current_model_name():
        model_service.set_model(data.model)
    
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
