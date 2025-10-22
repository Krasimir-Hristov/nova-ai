"""Service for handling chat operations."""

import json
import sys
from services.model_service import ModelService
from services.memory_service import ConversationMemoryManager


class ChatService:
    """Service for handling chat operations."""
    
    def __init__(self, model_service: ModelService, memory_manager: ConversationMemoryManager):
        """Initialize the chat service with a model service and memory manager."""
        self.model_service = model_service
        self.memory_manager = memory_manager
        self.cancel_requested = False  # Flag for stream cancellation
    
    def cancel_current_stream(self):
        """Signal to cancel the current streaming response."""
        self.cancel_requested = True
        print(
            "[BACKEND LOG] Stream cancellation requested",
            file=sys.stdout,
            flush=True
        )
    
    async def stream_response(
        self, 
        message: str, 
        model_name: str = "gemini-2.5-pro",
        session_id: str = "default"
    ):
        """
        Stream a response from the AI model with conversation memory.
        
        Args:
            message: User message
            model_name: Model to use for response
            session_id: Session identifier for conversation history
            
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
        print(
            f"[BACKEND LOG] Session ID: {session_id}",
            file=sys.stdout,
            flush=True
        )
        
        # Add user message to history
        self.memory_manager.add_message(session_id, "user", message)
        
        try:
            model_type = self.model_service.current_model_type
            
            if model_type == "google":
                async for chunk in self._stream_google(message, model_name, session_id):
                    yield chunk
            elif model_type == "openai":
                async for chunk in self._stream_openai(message, model_name, session_id):
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
    
    async def _stream_google(self, message: str, model_name: str, session_id: str):
        """Stream response from Google Gemini with conversation history."""
        # Get the selected model
        model = self.model_service.get_current_model()
        
        # Get conversation history
        history = self.memory_manager.get_history(session_id)
        
        # Build history context for Gemini
        history_context = ""
        if history:
            for msg in history[:-1]:  # Exclude the last message (current user message)
                if msg.type == "human":
                    history_context += f"User: {msg.content}\n"
                elif msg.type == "ai":
                    history_context += f"Assistant: {msg.content}\n"
        
        # Create full prompt with history
        full_prompt = history_context + f"User: {message}\n"
        
        print(
            f"[BACKEND LOG] Using history context with {len(history)} messages",
            file=sys.stdout,
            flush=True
        )
        
        # Generate response with streaming
        response = model.generate_content(
            full_prompt,
            stream=True
        )
        
        chunk_count = 0
        sent_chunks = set()
        full_response = ""
        
        for chunk in response:
            # CHECK CANCELLATION FIRST
            if self.cancel_requested:
                print(
                    "[BACKEND LOG] Google stream cancelled during generation",
                    file=sys.stdout,
                    flush=True
                )
                yield "data: {\"done\": true, \"cancelled\": true}\n\n"
                return
            
            if chunk.text:
                chunk_count += 1
                chunk_id = id(chunk)
                
                # Check if chunk was already sent
                if chunk_id not in sent_chunks:
                    sent_chunks.add(chunk_id)
                    full_response += chunk.text
                    
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
        
        # Add assistant response to history
        if full_response and not self.cancel_requested:
            self.memory_manager.add_message(session_id, "assistant", full_response)
        
        print(
            f"[BACKEND LOG] Stream finished. Total {chunk_count} chunks",
            file=sys.stdout,
            flush=True
        )
        # Signal completion
        yield "data: {\"done\": true}\n\n"
    
    async def _stream_openai(self, message: str, model_name: str, session_id: str):
        """Stream response from OpenAI with conversation history."""
        from config import SYSTEM_PROMPT
        
        client = self.model_service.openai_client
        
        # Get conversation history
        history = self.memory_manager.get_history(session_id)
        
        # Build messages array with history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add history (excluding the last user message we just added)
        for msg in history[:-1]:
            if msg.type == "human":
                messages.append({"role": "user", "content": msg.content})
            elif msg.type == "ai":
                messages.append({"role": "assistant", "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        print(
            f"[BACKEND LOG] Using history with {len(history)} messages",
            file=sys.stdout,
            flush=True
        )
        
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            stream=True,
            temperature=0.7,
        )
        
        chunk_count = 0
        full_response = ""
        
        for chunk in response:
            # CHECK CANCELLATION FIRST
            if self.cancel_requested:
                print(
                    "[BACKEND LOG] OpenAI stream cancelled during generation",
                    file=sys.stdout,
                    flush=True
                )
                yield "data: {\"done\": true, \"cancelled\": true}\n\n"
                return
            
            # OpenAI streams chunks with delta.content that can be None
            content = chunk.choices[0].delta.content if chunk.choices[0].delta else None
            
            if content:
                chunk_count += 1
                full_response += content
                
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
        
        # Add assistant response to history
        if full_response and not self.cancel_requested:
            self.memory_manager.add_message(session_id, "assistant", full_response)
        
        print(
            f"[BACKEND LOG] OpenAI Stream finished. Total {chunk_count} chunks",
            file=sys.stdout,
            flush=True
        )
        # Signal completion
        yield "data: {\"done\": true}\n\n"
