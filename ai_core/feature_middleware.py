#!/usr/bin/env python3
"""
Creative Muse AI - Feature Flag Middleware
Middleware für Feature-Flag-basierte Zugriffskontrolle
"""

import logging
from typing import Callable, List
from fastapi import HTTPException, Depends, status
from functools import wraps

from auth_service import get_current_user, User
from feature_flags_service import get_feature_flags_service

logger = logging.getLogger(__name__)


def require_feature(flag_key: str, error_message: str = None):
    """
    Decorator für Endpoints, die ein bestimmtes Feature erfordern
    
    Args:
        flag_key: Der Feature-Flag-Schlüssel
        error_message: Benutzerdefinierte Fehlermeldung
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Current user aus kwargs extrahieren
            current_user = None
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentifizierung erforderlich"
                )
            
            # Feature-Flag prüfen
            feature_service = get_feature_flags_service()
            if not feature_service.is_feature_enabled(
                flag_key, 
                current_user.subscription_tier, 
                current_user.id
            ):
                message = error_message or f"Feature '{flag_key}' nicht verfügbar für Ihr Abonnement"
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=message
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_features(flag_keys: List[str], require_all: bool = True, 
                    error_message: str = None):
    """
    Decorator für Endpoints, die mehrere Features erfordern
    
    Args:
        flag_keys: Liste der Feature-Flag-Schlüssel
        require_all: True = alle Features erforderlich, False = mindestens eines
        error_message: Benutzerdefinierte Fehlermeldung
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Current user aus kwargs extrahieren
            current_user = None
            for key, value in kwargs.items():
                if isinstance(value, User):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentifizierung erforderlich"
                )
            
            # Feature-Flags prüfen
            feature_service = get_feature_flags_service()
            enabled_features = []
            
            for flag_key in flag_keys:
                if feature_service.is_feature_enabled(
                    flag_key, 
                    current_user.subscription_tier, 
                    current_user.id
                ):
                    enabled_features.append(flag_key)
            
            # Zugriffskontrolle
            if require_all:
                if len(enabled_features) != len(flag_keys):
                    missing = set(flag_keys) - set(enabled_features)
                    message = error_message or f"Features nicht verfügbar: {', '.join(missing)}"
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=message
                    )
            else:
                if not enabled_features:
                    message = error_message or f"Mindestens eines der Features erforderlich: {', '.join(flag_keys)}"
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=message
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def check_feature_access(current_user: User = Depends(get_current_user)):
    """
    Dependency für Feature-basierte Zugriffskontrolle
    Kann in FastAPI-Endpoints als Dependency verwendet werden
    """
    def _check_feature(flag_key: str) -> bool:
        feature_service = get_feature_flags_service()
        return feature_service.is_feature_enabled(
            flag_key, 
            current_user.subscription_tier, 
            current_user.id
        )
    
    # Füge Check-Funktion zum User-Objekt hinzu
    current_user.check_feature = _check_feature
    return current_user


def get_user_features(current_user: User = Depends(get_current_user)) -> dict:
    """
    Dependency die alle verfügbaren Features für den aktuellen Benutzer zurückgibt
    """
    feature_service = get_feature_flags_service()
    return feature_service.get_user_features(
        current_user.subscription_tier, 
        current_user.id
    )


class FeatureGate:
    """
    Klasse für komplexere Feature-Gate-Logik
    """
    
    def __init__(self, flag_key: str):
        self.flag_key = flag_key
    
    def is_enabled_for_user(self, user: User) -> bool:
        """Prüft ob Feature für Benutzer aktiviert ist"""
        feature_service = get_feature_flags_service()
        return feature_service.is_feature_enabled(
            self.flag_key, 
            user.subscription_tier, 
            user.id
        )
    
    def get_config(self) -> dict:
        """Holt Feature-Konfiguration"""
        feature_service = get_feature_flags_service()
        return feature_service.get_feature_config(self.flag_key)
    
    def require_access(self, user: User, error_message: str = None):
        """Wirft Exception wenn Feature nicht verfügbar"""
        if not self.is_enabled_for_user(user):
            message = error_message or f"Feature '{self.flag_key}' nicht verfügbar"
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=message
            )


# Vordefinierte Feature Gates für häufig verwendete Features
class FeatureGates:
    """Sammlung vordefinierter Feature Gates"""
    
    AI_MODEL_SELECTION = FeatureGate("ai_model_selection")
    ADVANCED_ANALYTICS = FeatureGate("advanced_analytics")
    BULK_IDEA_GENERATION = FeatureGate("bulk_idea_generation")
    EXPORT_FORMATS = FeatureGate("export_formats")
    API_ACCESS = FeatureGate("api_access")
    TEAM_COLLABORATION = FeatureGate("team_collaboration")
    CUSTOM_PROMPTS = FeatureGate("custom_prompts")
    PRIORITY_SUPPORT = FeatureGate("priority_support")


# Convenience-Decorators für häufig verwendete Features
def require_ai_model_selection(error_message: str = None):
    """Decorator für AI-Modell-Auswahl-Feature"""
    return require_feature(
        "ai_model_selection", 
        error_message or "AI-Modell-Auswahl nur für Pro/Enterprise verfügbar"
    )


def require_advanced_analytics(error_message: str = None):
    """Decorator für erweiterte Analytics"""
    return require_feature(
        "advanced_analytics", 
        error_message or "Erweiterte Analytics nur für Enterprise verfügbar"
    )


def require_bulk_generation(error_message: str = None):
    """Decorator für Bulk-Ideengenerierung"""
    return require_feature(
        "bulk_idea_generation", 
        error_message or "Bulk-Generierung nur für Pro/Enterprise verfügbar"
    )


def require_export_formats(error_message: str = None):
    """Decorator für Export-Funktionen"""
    return require_feature(
        "export_formats", 
        error_message or "Export-Funktionen nur für Creator/Pro/Enterprise verfügbar"
    )


def require_api_access(error_message: str = None):
    """Decorator für API-Zugriff"""
    return require_feature(
        "api_access", 
        error_message or "API-Zugriff nur für Enterprise verfügbar"
    )


def require_team_collaboration(error_message: str = None):
    """Decorator für Team-Funktionen"""
    return require_feature(
        "team_collaboration", 
        error_message or "Team-Funktionen nur für Pro/Enterprise verfügbar"
    )


def require_custom_prompts(error_message: str = None):
    """Decorator für benutzerdefinierte Prompts"""
    return require_feature(
        "custom_prompts", 
        error_message or "Benutzerdefinierte Prompts nur für Creator/Pro/Enterprise verfügbar"
    )