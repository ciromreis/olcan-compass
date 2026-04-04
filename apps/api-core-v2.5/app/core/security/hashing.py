"""
PII Hashing Module - Security and Privacy

Este módulo fornece funções para hash de informações pessoalmente identificáveis (PII)
para uso em credenciais públicas de verificação.
"""

import hashlib
import uuid
from typing import Union


def hash_user_identifier(user_id: Union[str, uuid.UUID]) -> str:
    """
    Gera um hash SHA-256 de um identificador de usuário.
    
    Este hash é usado em credenciais públicas para verificação sem expor
    informações pessoalmente identificáveis (PII).
    
    Args:
        user_id: UUID do usuário (string ou objeto UUID)
        
    Returns:
        Hash SHA-256 em formato hexadecimal (64 caracteres)
        
    Example:
        >>> hash_user_identifier("550e8400-e29b-41d4-a716-446655440000")
        'a1b2c3d4e5f6...'
    """
    # Converter UUID para string se necessário
    if isinstance(user_id, uuid.UUID):
        user_id_str = str(user_id)
    else:
        user_id_str = str(user_id)
    
    # Gerar hash SHA-256
    hash_object = hashlib.sha256(user_id_str.encode('utf-8'))
    return hash_object.hexdigest()


def hash_verification_data(
    user_id: Union[str, uuid.UUID],
    credential_type: str,
    score_value: int,
    issued_at: str
) -> str:
    """
    Gera um hash de verificação único para uma credencial.
    
    Combina múltiplos campos para criar um hash único que pode ser usado
    como identificador público da credencial.
    
    Args:
        user_id: UUID do usuário
        credential_type: Tipo da credencial ('readiness', 'milestone', etc.)
        score_value: Valor do score (0-100)
        issued_at: Timestamp de emissão (ISO format string)
        
    Returns:
        Hash SHA-256 em formato hexadecimal
    """
    # Converter UUID para string se necessário
    if isinstance(user_id, uuid.UUID):
        user_id_str = str(user_id)
    else:
        user_id_str = str(user_id)
    
    # Combinar todos os campos
    combined = f"{user_id_str}:{credential_type}:{score_value}:{issued_at}"
    
    # Gerar hash SHA-256
    hash_object = hashlib.sha256(combined.encode('utf-8'))
    return hash_object.hexdigest()


def hash_sensitive_field(value: str, salt: str = "") -> str:
    """
    Gera um hash de um campo sensível com salt opcional.
    
    Args:
        value: Valor a ser hasheado
        salt: Salt opcional para adicionar ao hash
        
    Returns:
        Hash SHA-256 em formato hexadecimal
    """
    combined = f"{value}:{salt}" if salt else value
    hash_object = hashlib.sha256(combined.encode('utf-8'))
    return hash_object.hexdigest()


def verify_hash(value: str, hash_to_verify: str, salt: str = "") -> bool:
    """
    Verifica se um valor corresponde a um hash.
    
    Args:
        value: Valor original
        hash_to_verify: Hash para comparar
        salt: Salt usado no hash original
        
    Returns:
        True se o hash corresponder, False caso contrário
    """
    computed_hash = hash_sensitive_field(value, salt)
    return computed_hash == hash_to_verify
