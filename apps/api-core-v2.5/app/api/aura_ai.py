"""
Aura AI Chat API
Provides conversational AI companion interface
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.core.auth import get_current_user
from app.core.rate_limit import limiter
from app.db.models import User


router = APIRouter(prefix="/aura", tags=["aura-ai"])


class ChatRequest(BaseModel):
    """Chat message from user"""
    message: str


class ChatResponse(BaseModel):
    """AI response with context"""
    message: str
    context: Optional[dict] = None


def generate_contextual_response(message: str, user: User) -> str:
    """
    Generate contextual AI response based on user message
    
    TODO: Integrate with Vertex AI Gemini for production
    For now, using rule-based responses
    
    Args:
        message: User's message
        user: Current user
        
    Returns:
        AI-generated response
    """
    lower = message.lower()
    
    # Route/Journey related
    if any(word in lower for word in ["rota", "route", "marco", "milestone", "bloqueio", "blocked"]):
        return (
            "Vejo que você está interessado em sua rota. Recomendo revisar seus marcos "
            "bloqueados na seção 'My Route'. Posso ajudar com algum marco específico?"
        )
    
    # Document/Forge related
    if any(word in lower for word in ["documento", "cv", "carta", "motivação", "forge"]):
        return (
            "Para trabalhar em seus documentos, acesse o Forge. Lá você pode criar CVs, "
            "cartas de motivação e outros artefatos com suporte de IA para polimento."
        )
    
    # Interview related
    if any(word in lower for word in ["entrevista", "interview", "prática", "practice"]):
        return (
            "Que tal praticar uma entrevista simulada? Vá para a seção 'Interviews' e "
            "inicie uma nova sessão. Vou analisar suas respostas e dar feedback detalhado."
        )
    
    # Product/Commerce related
    if any(word in lower for word in ["produto", "curso", "mentoria", "comprar", "buy"]):
        return (
            "Temos vários produtos e serviços que podem ajudar sua jornada. Confira o "
            "Marketplace para ver ofertas alinhadas ao seu perfil."
        )
    
    # Deadline/Task related
    if any(word in lower for word in ["prazo", "deadline", "tarefa", "task", "fazer", "do"]):
        return (
            "Você pode ver todas as suas tarefas e prazos no dashboard 'Today'. "
            "Priorizo as ações mais urgentes para você focar no que importa."
        )
    
    # Application related
    if any(word in lower for word in ["candidatura", "application", "universidade", "university"]):
        return (
            "Para gerenciar suas candidaturas, acesse a seção 'Execution'. Lá você pode "
            "acompanhar prazos, documentos necessários e status de cada aplicação."
        )
    
    # Sprint/Readiness related
    if any(word in lower for word in ["sprint", "prontidão", "readiness", "preparação"]):
        return (
            "Os sprints ajudam você a melhorar sua prontidão em diferentes dimensões. "
            "Acesse 'My Route' para ver seus sprints ativos e tarefas pendentes."
        )
    
    # Help/General
    if any(word in lower for word in ["ajuda", "help", "como", "how", "o que", "what"]):
        return (
            "Estou aqui para ajudar com sua jornada de internacionalização! Posso orientar "
            "sobre:\n\n"
            "• Rotas e marcos\n"
            "• Documentos e narrativa\n"
            "• Entrevistas e preparação\n"
            "• Candidaturas e prazos\n"
            "• Produtos e serviços\n\n"
            "O que você gostaria de explorar?"
        )
    
    # Greeting
    if any(word in lower for word in ["oi", "olá", "hello", "hi", "bom dia", "boa tarde", "boa noite"]):
        return (
            f"Olá! Sou sua Aura, seu companheiro de jornada de internacionalização. "
            f"Como posso ajudar você hoje?"
        )
    
    # Default response
    return (
        "Entendo. Estou aqui para ajudar com sua jornada de internacionalização. "
        "Posso orientar sobre rotas, documentos, entrevistas, candidaturas, produtos e muito mais. "
        "O que você gostaria de explorar?"
    )


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def aura_chat(
    http_request: Request,
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """
    Send a message to Aura AI companion
    
    Returns AI-generated response with contextual recommendations
    
    TODO: Integrate with Vertex AI Gemini for production
    TODO: Fetch user's journey context for better recommendations
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Generate contextual response
    response_text = generate_contextual_response(request.message, current_user)
    
    # TODO: Fetch journey context from journey service
    context = {
        "user_id": current_user.id,
        "user_name": current_user.full_name or current_user.email,
    }
    
    return ChatResponse(
        message=response_text,
        context=context,
    )


@router.get("/suggestions")
async def get_aura_suggestions(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db),
):
    """
    Get AI-generated suggestions for the user
    
    Returns contextual suggestions based on journey state
    
    TODO: Implement journey-aware suggestions
    """
    # Placeholder suggestions
    suggestions = [
        "Revisar marcos bloqueados na sua rota",
        "Completar documento de CV no Forge",
        "Praticar entrevista simulada",
        "Verificar prazos de candidaturas",
    ]
    
    return {"suggestions": suggestions}
