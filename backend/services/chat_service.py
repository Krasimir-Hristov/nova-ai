"""Service for handling chat operations."""

import json
import sys
from services.model_service import ModelService


class ChatService:
    """Service for handling chat streaming and responses."""
    
    def __init__(self, model_service: ModelService):
        """Initialize the chat service with a model service."""
        self.model_service = model_service
    
    async def stream_response(self, message: str, model_name: str = "gemini-2.0-flash"):
        """
        Stream a response from the AI model.
        
        Args:
            message: User message
            model_name: Model to use for response
            
        Yields:
            JSON formatted SSE data
        """
        print(
            f"\n[BACKEND LOG] Received message: {message}",
            file=sys.stdout,
            flush=True
        )
        print(
            f"[BACKEND LOG] Selected model: {model_name}",
            file=sys.stdout,
            flush=True
        )
        
        try:
            # Get the selected model
            model = self.model_service.get_current_model()
            
            # Generate response with streaming
            response = model.generate_content(
                message,
                stream=True
            )
            
            chunk_count = 0
            sent_chunks = set()
            
            for chunk in response:
                if chunk.text:
                    chunk_count += 1
                    chunk_id = id(chunk)
                    
                    # Check if chunk was already sent
                    if chunk_id not in sent_chunks:
                        sent_chunks.add(chunk_id)
                        
                        # Send as JSON
                        message_data = json.dumps(
                            {"text": chunk.text},
                            ensure_ascii=False
                        )
                        print(
                            f"[BACKEND LOG] Chunk #{chunk_count}: {message_data[:100]}...",
                            file=sys.stdout,
                            flush=True
                        )
                        yield f"data: {message_data}\n\n"
                    else:
                        print(
                            f"[BACKEND LOG] Duplicate chunk #{chunk_count} - SKIPPED",
                            file=sys.stdout,
                            flush=True
                        )
            
            print(
                f"[BACKEND LOG] Stream finished. Total {chunk_count} chunks",
                file=sys.stdout,
                flush=True
            )
            # Signal completion
            yield "data: {\"done\": true}\n\n"
            
        except Exception as e:
            error_msg = json.dumps(
                {"error": str(e)},
                ensure_ascii=False
            )
            print(
                f"[BACKEND LOG] ERROR: {str(e)}",
                file=sys.stdout,
                flush=True
            )
            yield f"data: {error_msg}\n\n"
