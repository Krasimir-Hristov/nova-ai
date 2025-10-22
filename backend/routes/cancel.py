"""Routes for stream cancellation."""

from fastapi import APIRouter
from services_instance import chat_service

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/cancel-stream")
async def cancel_stream():
    """Cancel the current streaming response."""
    chat_service.cancel_current_stream()
    return {"status": "cancelled"}
