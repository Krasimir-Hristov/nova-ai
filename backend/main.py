"""FastAPI server for Nova AI backend."""

import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from routes import models_router, chat_router, cancel_router

# Initialize FastAPI app
app = FastAPI(
    title="Nova AI Backend",
    description="FastAPI backend for Nova AI chatbot",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(models_router)
app.include_router(chat_router)
app.include_router(cancel_router)


@app.get("/")
async def read_root():
    """Root endpoint that returns a greeting."""
    return {"message": "Nova AI Backend is running"}


@app.on_event("startup")
async def startup_event():
    """Log startup message."""
    print(
        "[BACKEND LOG] Nova AI Backend started successfully",
        file=sys.stdout,
        flush=True
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

