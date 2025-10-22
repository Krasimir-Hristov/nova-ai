"""Routes for model management endpoints."""

from fastapi import APIRouter, HTTPException
from services_instance import model_service
from models import ModelResponse
from config import DEFAULT_COMPANY

router = APIRouter(prefix="/api", tags=["models"])


@router.get("/models", response_model=ModelResponse)
async def get_available_models():
    """Get list of available models and companies."""
    return {
        "current_company": DEFAULT_COMPANY,
        "current_model": model_service.get_current_model_name(),
        "models": model_service.get_available_models()
    }


@router.post("/set-model")
async def set_model(model_name: str):
    """Change the current model."""
    try:
        model_service.set_model(model_name)
        return {
            "status": "success",
            "current_model": model_service.get_current_model_name()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
