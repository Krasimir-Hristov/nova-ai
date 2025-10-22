"""Routes package for Nova AI backend."""

from routes.models import router as models_router
from routes.chat import router as chat_router

__all__ = ["models_router", "chat_router"]
