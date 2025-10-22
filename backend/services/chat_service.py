"""Service for handling chat operations."""

import json
import sys
from services.model_service import ModelService


class ChatService:
    """Service for handling chat operations."""
    
    def __init__(self, model_service: ModelService):
        """Initialize the chat service with a model service."""
        self.model_service = model_service
        self.cancel_requested = False  # Flag for stream cancellation
    
    def cancel_current_stream(self):
        """Signal to cancel the current streaming response."""
        self.cancel_requested = True
        print(
            "[BACKEND LOG] Stream cancellation requested",
            file=sys.stdout,
            flush=True
        )
    
    async def stream_response(self, message: str, model_name: str = "gemini-2.0-flash"):
        """
        Stream a response from the AI model.
        
        Args:
            message: User message
            model_name: Model to use for response
            
        Yields:
            JSON formatted SSE data
        """
        # Reset cancellation flag for new stream
        self.cancel_requested = False
        
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
            model_type = self.model_service.current_model_type
            
            if model_type == "google":
                for chunk in self._stream_google(message, model_name):
                    yield chunk
            elif model_type == "openai":
                for chunk in self._stream_openai(message, model_name):
                    yield chunk
            else:
                raise ValueError(f"Unknown model type: {model_type}")
                
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
    
    def _stream_google(self, message: str, model_name: str):
        """Stream response from Google Gemini."""
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
            # CHECK CANCELLATION FIRST
            if self.cancel_requested:
                print(
                    "[BACKEND LOG] Google stream cancelled during generation",
                    file=sys.stdout,
                    flush=True
                )
                yield "data: {\"done\": true, \"cancelled\": true}\n\n"
                break
            
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
    
    def _stream_openai(self, message: str, model_name: str):
        """Stream response from OpenAI."""
        from config import SYSTEM_PROMPT
        
        client = self.model_service.openai_client
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            stream=True,
            temperature=0.7,
        )
        
        chunk_count = 0
        
        for chunk in response:
            # CHECK CANCELLATION FIRST
            if self.cancel_requested:
                print(
                    "[BACKEND LOG] OpenAI stream cancelled during generation",
                    file=sys.stdout,
                    flush=True
                )
                yield "data: {\"done\": true, \"cancelled\": true}\n\n"
                break
            
            # OpenAI streams chunks with delta.content that can be None
            content = chunk.choices[0].delta.content if chunk.choices[0].delta else None
            
            if content:
                chunk_count += 1
                
                # Send as JSON - OpenAI doesn't duplicate like Gemini, no deduplication needed
                message_data = json.dumps(
                    {"text": content},
                    ensure_ascii=False
                )
                print(
                    f"[BACKEND LOG] OpenAI Chunk #{chunk_count}: {message_data[:100]}...",
                    file=sys.stdout,
                    flush=True
                )
                yield f"data: {message_data}\n\n"
        
        print(
            f"[BACKEND LOG] OpenAI Stream finished. Total {chunk_count} chunks",
            file=sys.stdout,
            flush=True
        )
        # Signal completion
        yield "data: {\"done\": true}\n\n"
