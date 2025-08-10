# context_manager.py - Sistema de gestión de contexto conversacional
"""
Sistema avanzado de gestión de contexto para chat IA médico con soporte para:
- Múltiples usuarios concurrentes
- Caché de conversaciones activas
- Límites dinámicos de contexto
- Optimización de memoria
- Sesiones paralelas
"""

import asyncio
import json
import time
from typing import Dict, List, Optional, Tuple, Any
from uuid import UUID
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import hashlib

from models import ChatMessage, RolChatEnum, EspecialidadEnum


@dataclass
class ConversationContext:
    """Contexto de una conversación individual"""
    conversation_id: UUID
    user_id: str
    speciality: EspecialidadEnum
    messages: deque  # Buffer circular para eficiencia
    metadata: Dict[str, Any]
    last_activity: datetime
    token_count: int
    max_tokens: int = 4096  # Límite del modelo
    context_window: int = 3000  # Tokens para contexto (dejando espacio para respuesta)
    
    def __post_init__(self):
        if not isinstance(self.messages, deque):
            self.messages = deque(self.messages, maxlen=50)  # Límite de mensajes en memoria
    
    def add_message(self, message: ChatMessage) -> None:
        """Agregar mensaje y actualizar contadores"""
        self.messages.append(message)
        self.last_activity = datetime.now()
        self.token_count += self._estimate_tokens(message.content)
        self._trim_if_needed()
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimación aproximada de tokens (1 token ≈ 4 caracteres para español)"""
        return len(text) // 3
    
    def _trim_if_needed(self) -> None:
        """Recortar contexto si excede límites"""
        while self.token_count > self.context_window and len(self.messages) > 2:
            removed_msg = self.messages.popleft()
            self.token_count -= self._estimate_tokens(removed_msg.content)
    
    def get_context_messages(self) -> List[ChatMessage]:
        """Obtener mensajes para enviar al modelo IA"""
        # Si no hay mensajes, devolver solo el system prompt
        if not self.messages:
            system_prompt = self._generate_system_prompt()
            return [system_prompt]
        
        messages = list(self.messages)
        
        # Asegurar que tenemos el system prompt
        if messages[0].role != RolChatEnum.SYSTEM:
            # Agregar system prompt basado en especialidad
            system_prompt = self._generate_system_prompt()
            messages.insert(0, system_prompt)
        
        return messages
    
    def _generate_system_prompt(self) -> ChatMessage:
        """Generar prompt de sistema basado en especialidad"""
        prompts = {
            EspecialidadEnum.RADIOLOGIA: "Eres un radiólogo experto especializado en interpretación de imágenes médicas.",
            EspecialidadEnum.CARDIOLOGIA: "Eres un cardiólogo experto en diagnóstico y tratamiento cardiovascular.",
            EspecialidadEnum.NEUROLOGIA: "Eres un neurólogo experto en el sistema nervioso y trastornos neurológicos.",
            EspecialidadEnum.DERMATOLOGIA: "Eres un dermatólogo experto en enfermedades de la piel.",
            EspecialidadEnum.GINECOLOGIA: "Eres un ginecólogo experto en salud femenina y reproductiva.",
            EspecialidadEnum.GENERAL: "Eres un médico general experto en medicina clínica."
        }
        
        base_prompt = prompts.get(self.speciality, prompts[EspecialidadEnum.GENERAL])
        full_prompt = f"""{base_prompt}

INSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español
- Sé profesional, preciso y empático
- Proporciona información médica basada en evidencia
- Si la consulta está fuera de tu especialidad, refiérelo apropiadamente
- Siempre incluye la recomendación de consultar con un médico para evaluación presencial
- Mantén un tono médico profesional pero accesible
- No proporciones diagnósticos definitivos sin evaluación presencial
- Enfócate en educación y orientación médica

Recuerda: Eres un asistente médico IA diseñado para proporcionar orientación médica general, no para reemplazar la consulta médica profesional."""
        
        return ChatMessage(role=RolChatEnum.SYSTEM, content=full_prompt)


class ConversationCache:
    """Caché en memoria para conversaciones activas"""
    
    def __init__(self, max_size: int = 1000, ttl_minutes: int = 30):
        self.cache: Dict[UUID, ConversationContext] = {}
        self.user_conversations: Dict[str, List[UUID]] = defaultdict(list)
        self.max_size = max_size
        self.ttl = timedelta(minutes=ttl_minutes)
        self._access_times: Dict[UUID, datetime] = {}
        self._lock = asyncio.Lock()
    
    async def get(self, conversation_id: UUID) -> Optional[ConversationContext]:
        """Obtener conversación del caché"""
        async with self._lock:
            context = self.cache.get(conversation_id)
            if context and self._is_valid(context):
                self._access_times[conversation_id] = datetime.now()
                return context
            elif context:
                # Limpiar conversación expirada
                await self._remove(conversation_id)
            return None
    
    async def put(self, context: ConversationContext) -> None:
        """Almacenar conversación en caché"""
        async with self._lock:
            # Limpiar caché si está lleno
            if len(self.cache) >= self.max_size:
                await self._evict_oldest()
            
            self.cache[context.conversation_id] = context
            self.user_conversations[context.user_id].append(context.conversation_id)
            self._access_times[context.conversation_id] = datetime.now()
    
    async def update(self, conversation_id: UUID, context: ConversationContext) -> None:
        """Actualizar conversación existente"""
        async with self._lock:
            if conversation_id in self.cache:
                self.cache[conversation_id] = context
                self._access_times[conversation_id] = datetime.now()
    
    async def get_user_conversations(self, user_id: str) -> List[ConversationContext]:
        """Obtener todas las conversaciones activas de un usuario"""
        async with self._lock:
            conversations = []
            for conv_id in self.user_conversations.get(user_id, []):
                if conv_id in self.cache and self._is_valid(self.cache[conv_id]):
                    conversations.append(self.cache[conv_id])
            return conversations
    
    def _is_valid(self, context: ConversationContext) -> bool:
        """Verificar si el contexto sigue siendo válido"""
        return datetime.now() - context.last_activity < self.ttl
    
    async def _remove(self, conversation_id: UUID) -> None:
        """Remover conversación del caché"""
        if conversation_id in self.cache:
            context = self.cache[conversation_id]
            del self.cache[conversation_id]
            self.user_conversations[context.user_id].remove(conversation_id)
            if conversation_id in self._access_times:
                del self._access_times[conversation_id]
    
    async def _evict_oldest(self) -> None:
        """Eliminar la conversación menos usada recientemente"""
        if not self._access_times:
            return
        
        oldest_id = min(self._access_times.keys(), key=lambda x: self._access_times[x])
        await self._remove(oldest_id)
    
    async def cleanup_expired(self) -> None:
        """Limpieza periódica de conversaciones expiradas"""
        async with self._lock:
            expired_ids = [
                conv_id for conv_id, context in self.cache.items()
                if not self._is_valid(context)
            ]
            
            for conv_id in expired_ids:
                await self._remove(conv_id)


class ContextManager:
    """Gestor principal de contexto conversacional"""
    
    def __init__(self, supabase_client, cache_size: int = 1000, ttl_minutes: int = 30):
        self.supabase = supabase_client
        self.cache = ConversationCache(max_size=cache_size, ttl_minutes=ttl_minutes)
        self.session_locks: Dict[UUID, asyncio.Lock] = defaultdict(asyncio.Lock)
        
        # Iniciar tarea de limpieza solo si hay un event loop corriendo
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._periodic_cleanup())
        except RuntimeError:
            # No hay event loop corriendo, la limpieza se hará cuando se necesite
            pass
    
    async def get_conversation_context(
        self, 
        conversation_id: UUID, 
        user_id: str,
        speciality: EspecialidadEnum = EspecialidadEnum.GENERAL
    ) -> ConversationContext:
        """Obtener contexto de conversación (desde caché o BD)"""
        
        # Intentar obtener del caché primero
        context = await self.cache.get(conversation_id)
        if context:
            return context
        
        # Si no está en caché, cargar desde BD
        context = await self._load_from_database(conversation_id, user_id, speciality)
        
        # Almacenar en caché
        await self.cache.put(context)
        
        return context
    
    async def add_message_to_context(
        self, 
        conversation_id: UUID, 
        message: ChatMessage,
        user_id: str
    ) -> ConversationContext:
        """Agregar mensaje al contexto de conversación"""
        
        # Usar lock por conversación para evitar condiciones de carrera
        async with self.session_locks[conversation_id]:
            context = await self.cache.get(conversation_id)
            
            if not context:
                # Crear nuevo contexto si no existe
                context = ConversationContext(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    speciality=EspecialidadEnum.GENERAL,  # Se puede actualizar dinámicamente
                    messages=deque(),
                    metadata={},
                    last_activity=datetime.now(),
                    token_count=0
                )
            
            # Agregar mensaje
            context.add_message(message)
            
            # Actualizar caché
            await self.cache.update(conversation_id, context)
            
            # Persistir en BD de forma asíncrona (no bloquear)
            asyncio.create_task(self._persist_message(conversation_id, message))
            
            return context
    
    async def get_context_for_ai(
        self, 
        conversation_id: UUID,
        include_rag: bool = True,
        rag_query: Optional[str] = None
    ) -> List[ChatMessage]:
        """Obtener contexto optimizado para enviar al modelo IA"""
        
        context = await self.cache.get(conversation_id)
        if not context:
            # Si no hay contexto en caché, crear uno básico con system prompt
            print(f"⚠️ No hay contexto en caché para conversación {conversation_id}, creando contexto básico")
            basic_context = ConversationContext(
                conversation_id=conversation_id,
                user_id="default_user",
                speciality=EspecialidadEnum.GENERAL,
                messages=deque(),
                metadata={},
                last_activity=datetime.now(),
                token_count=0
            )
            messages = basic_context.get_context_messages()
        else:
            messages = context.get_context_messages()
        
        print(f"📝 Contexto preparado: {len(messages)} mensajes")
        
        # Agregar contexto RAG si es necesario
        if include_rag and rag_query:
            rag_context = await self._get_rag_context(rag_query)
            if rag_context and messages:
                # Insertar contexto RAG antes del último mensaje del usuario
                system_msg = messages[0]
                system_msg.content += f"\\n\\nCONTEXTO RELEVANTE:\\n{rag_context}"
        
        return messages
    
    async def get_user_active_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Obtener todas las sesiones activas de un usuario"""
        conversations = await self.cache.get_user_conversations(user_id)
        
        return [
            {
                "conversation_id": str(conv.conversation_id),
                "speciality": conv.speciality.value,
                "last_activity": conv.last_activity.isoformat(),
                "message_count": len(conv.messages),
                "token_count": conv.token_count
            }
            for conv in conversations
        ]
    
    async def _load_from_database(
        self, 
        conversation_id: UUID, 
        user_id: str,
        speciality: EspecialidadEnum
    ) -> ConversationContext:
        """Cargar conversación desde la base de datos"""
        
        try:
            # Obtener metadatos de la conversación
            conv_result = self.supabase.table('conversaciones_chat').select('*').eq(
                'id', str(conversation_id)
            ).execute()
            
            # Obtener mensajes
            msg_result = self.supabase.table('mensajes_chat').select('*').eq(
                'conversacion_id', str(conversation_id)
            ).order('timestamp_mensaje', desc=False).execute()
            
            messages = deque()
            total_tokens = 0
            
            for msg_data in msg_result.data or []:
                message = ChatMessage(
                    role=RolChatEnum(msg_data['rol']),
                    content=msg_data['contenido']
                )
                messages.append(message)
                total_tokens += len(msg_data['contenido']) // 3  # Estimación de tokens
            
            # Obtener especialidad de la conversación o usar la proporcionada
            conv_speciality = speciality
            if conv_result.data:
                conv_speciality = EspecialidadEnum(conv_result.data[0].get('especialidad', speciality.value))
            
            return ConversationContext(
                conversation_id=conversation_id,
                user_id=user_id,
                speciality=conv_speciality,
                messages=messages,
                metadata={},
                last_activity=datetime.now(),
                token_count=total_tokens
            )
            
        except Exception as e:
            print(f"Error cargando conversación desde BD: {e}")
            # Retornar contexto vacío en caso de error
            return ConversationContext(
                conversation_id=conversation_id,
                user_id=user_id,
                speciality=speciality,
                messages=deque(),
                metadata={},
                last_activity=datetime.now(),
                token_count=0
            )
    
    async def _persist_message(self, conversation_id: UUID, message: ChatMessage) -> None:
        """Persistir mensaje en base de datos de forma asíncrona"""
        try:
            self.supabase.table('mensajes_chat').insert({
                'conversacion_id': str(conversation_id),
                'rol': message.role.value,
                'contenido': message.content,
                'timestamp_mensaje': datetime.now().isoformat()
            }).execute()
        except Exception as e:
            print(f"Error persistiendo mensaje: {e}")
    
    async def _get_rag_context(self, query: str) -> Optional[str]:
        """Obtener contexto RAG relevante"""
        # Implementar integración con el servicio RAG existente
        # Este es un placeholder - se integrará con RAGSearchRequest
        return None
    
    async def _periodic_cleanup(self) -> None:
        """Limpieza periódica del caché"""
        while True:
            try:
                await asyncio.sleep(300)  # Cada 5 minutos
                await self.cache.cleanup_expired()
                
                # Limpiar locks huérfanos
                active_conversations = set(self.cache.cache.keys())
                orphaned_locks = set(self.session_locks.keys()) - active_conversations
                for lock_id in orphaned_locks:
                    del self.session_locks[lock_id]
                    
            except Exception as e:
                print(f"Error en limpieza periódica: {e}")


# Singleton global para el gestor de contexto
_context_manager: Optional[ContextManager] = None

def get_context_manager(supabase_client=None) -> ContextManager:
    """Obtener instancia singleton del gestor de contexto"""
    global _context_manager
    if _context_manager is None and supabase_client:
        _context_manager = ContextManager(supabase_client)
    return _context_manager
