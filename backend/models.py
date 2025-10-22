"""Pydantic models for Nova AI backend."""

from pydantic import BaseModel


class ChatMessage(BaseModel):
    """Model for chat message request."""
    message: str
    company: str = "Google"
    model: str = "gemini-2.0-flash"


class ModelResponse(BaseModel):
    """Model for available models response."""
    current_company: str
    current_model: str
    models: dict


class SetModelRequest(BaseModel):
    """Model for set model request."""
    model: str


class ChatStreamResponse(BaseModel):
    """Model for chat stream response."""
    text: str | None = None
    done: bool = False
    error: str | None = None
