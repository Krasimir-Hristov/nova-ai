"""Service for managing conversation memory and history."""

from typing import Dict, List
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


class ConversationMemoryManager:
    """Manages conversation memory for different sessions."""
    
    def __init__(self):
        """Initialize the memory manager with empty session storage."""
        self._sessions: Dict[str, List[BaseMessage]] = {}
    
    def get_or_create_session(self, session_id: str) -> List[BaseMessage]:
        """
        Get existing session memory or create new one.
        
        Args:
            session_id: Unique identifier for the conversation session
            
        Returns:
            List of messages for the session
        """
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        return self._sessions[session_id]
    
    def add_message(self, session_id: str, role: str, content: str):
        """
        Add a message to session history.
        
        Args:
            session_id: Session identifier
            role: Message role ('user' or 'assistant')
            content: Message content
        """
        messages = self.get_or_create_session(session_id)
        
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    
    def get_history(self, session_id: str) -> List[BaseMessage]:
        """
        Get conversation history for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            List of messages in the conversation
        """
        return self.get_or_create_session(session_id)
    
    def get_history_as_string(self, session_id: str) -> str:
        """
        Get conversation history as a formatted string.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Formatted conversation history
        """
        messages = self.get_history(session_id)
        history_text = ""
        
        for msg in messages:
            if isinstance(msg, HumanMessage):
                history_text += f"Human: {msg.content}\n"
            elif isinstance(msg, AIMessage):
                history_text += f"Assistant: {msg.content}\n"
        
        return history_text.strip()
    
    def clear_session(self, session_id: str):
        """
        Clear a session's memory.
        
        Args:
            session_id: Session identifier
        """
        if session_id in self._sessions:
            self._sessions[session_id].clear()
    
    def delete_session(self, session_id: str):
        """
        Delete a session completely.
        
        Args:
            session_id: Session identifier
        """
        if session_id in self._sessions:
            del self._sessions[session_id]
    
    def get_session_count(self) -> int:
        """Get the number of active sessions."""
        return len(self._sessions)
