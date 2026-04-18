"""Comprehensive logging infrastructure for Olcan Compass.

Provides structured logging with context, performance tracking,
and integration with Sentry for error tracking.

Usage:
    from app.core.logging import get_logger
    
    logger = get_logger(__name__)
    
    logger.info("User registered", extra={"user_id": str(user.id)})
    logger.warning("Rate limit approaching", extra={"ip": request.client.host})
    logger.error("Payment failed", exc_info=True, extra={"stripe_error": str(e)})
"""

import logging
import sys
import time
import json
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


# ============================================================
# Request Context (for correlation IDs)
# ============================================================

request_id_var: ContextVar[str] = ContextVar("request_id", default="")
user_id_var: ContextVar[Optional[str]] = ContextVar("user_id", default=None)


# ============================================================
# Custom JSON Formatter
# ============================================================

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for easy parsing and aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add request context
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id

        user_id = user_id_var.get()
        if user_id:
            log_data["user_id"] = user_id

        # Add exception info
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)

        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """Format logs with colors for development."""

    COLORS = {
        "DEBUG": "\033[36m",      # Cyan
        "INFO": "\033[32m",       # Green
        "WARNING": "\033[33m",    # Yellow
        "ERROR": "\033[31m",      # Red
        "CRITICAL": "\033[35m",   # Magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
        
        message = f"{color}[{timestamp}] {record.levelname:8s}{self.RESET} {record.name}: {record.getMessage()}"

        # Add request context
        request_id = request_id_var.get()
        if request_id:
            message += f" {self.COLORS.get('DEBUG', '')}[{request_id[:8]}]{self.RESET}"

        # Add exception
        if record.exc_info:
            message += f"\n{self.formatException(record.exc_info)}"

        return message


# ============================================================
# Logger Factory
# ============================================================

def get_logger(name: str, structured: bool = False) -> logging.Logger:
    """Get a logger with proper configuration.
    
    Args:
        name: Logger name (usually __name__)
        structured: Use JSON formatting (True for production)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        
        # Console handler
        handler = logging.StreamHandler(sys.stdout)
        
        if structured:
            handler.setFormatter(JSONFormatter())
        else:
            handler.setFormatter(ColoredFormatter())
        
        logger.addHandler(handler)
    
    return logger


# ============================================================
# Request Logging Middleware
# ============================================================

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests with timing and context."""

    async def dispatch(self, request: Request, call_next) -> Response:
        import uuid
        
        # Generate request ID
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)

        # Start timing
        start_time = time.time()

        # Get logger
        logger = get_logger("http")

        # Log request
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "extra_data": {
                    "method": request.method,
                    "path": request.url.path,
                    "query_params": dict(request.query_params),
                    "client_ip": request.client.host if request.client else None,
                    "user_agent": request.headers.get("user-agent"),
                }
            }
        )

        try:
            # Process request
            response = await call_next(request)

            # Calculate duration
            duration = time.time() - start_time

            # Log response
            log_level = "INFO"
            if response.status_code >= 500:
                log_level = "ERROR"
            elif response.status_code >= 400:
                log_level = "WARNING"

            getattr(logger, log_level.lower())(
                f"{request.method} {request.url.path} - {response.status_code}",
                extra={
                    "extra_data": {
                        "status_code": response.status_code,
                        "duration_ms": round(duration * 1000, 2),
                        "content_length": response.headers.get("content-length"),
                    }
                }
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time

            # Log error
            logger.error(
                f"{request.method} {request.url.path} - Exception",
                exc_info=True,
                extra={
                    "extra_data": {
                        "duration_ms": round(duration * 1000, 2),
                        "error": str(e),
                    }
                }
            )

            # Re-raise
            raise


# ============================================================
# Performance Tracking
# ============================================================

class PerformanceTimer:
    """Context manager for timing operations."""

    def __init__(self, logger: logging.Logger, operation: str):
        self.logger = logger
        self.operation = operation
        self.start_time = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        duration_ms = round(duration * 1000, 2)

        if exc_type:
            self.logger.error(
                f"{self.operation} failed after {duration_ms}ms",
                exc_info=(exc_type, exc_val, exc_tb),
            )
        else:
            self.logger.info(f"{self.operation} completed in {duration_ms}ms")

        return False


# ============================================================
# Audit Logging
# ============================================================

class AuditLogger:
    """Logger for audit trails (user actions, admin operations)."""

    def __init__(self):
        self.logger = get_logger("audit", structured=True)

    def log_action(
        self,
        action: str,
        user_id: str,
        resource_type: str,
        resource_id: str,
        details: Optional[dict] = None,
    ):
        """Log an audit event."""
        self.logger.info(
            f"Audit: {action}",
            extra={
                "extra_data": {
                    "event_type": "audit",
                    "action": action,
                    "user_id": user_id,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "details": details or {},
                }
            }
        )


# Global audit logger instance
audit_logger = AuditLogger()


# ============================================================
# Security Event Logging
# ============================================================

class SecurityLogger:
    """Logger for security events (auth failures, rate limits, etc.)."""

    def __init__(self):
        self.logger = get_logger("security", structured=True)

    def log_auth_failure(self, email: str, ip: str, reason: str):
        """Log authentication failure."""
        self.logger.warning(
            "Authentication failure",
            extra={
                "extra_data": {
                    "event_type": "auth_failure",
                    "email": email,
                    "ip": ip,
                    "reason": reason,
                }
            }
        )

    def log_rate_limit(self, ip: str, endpoint: str, limit: str):
        """Log rate limit exceeded."""
        self.logger.warning(
            "Rate limit exceeded",
            extra={
                "extra_data": {
                    "event_type": "rate_limit",
                    "ip": ip,
                    "endpoint": endpoint,
                    "limit": limit,
                }
            }
        )

    def log_entitlement_violation(self, user_id: str, feature: str, plan: str):
        """Log entitlement violation (user tried to access premium feature)."""
        self.logger.warning(
            "Entitlement violation",
            extra={
                "extra_data": {
                    "event_type": "entitlement_violation",
                    "user_id": user_id,
                    "feature": feature,
                    "plan": plan,
                }
            }
        )


# Global security logger instance
security_logger = SecurityLogger()


# ============================================================
# Database Query Logging
# ============================================================

class DatabaseQueryLogger:
    """Logger for database queries (development only)."""

    def __init__(self):
        self.logger = get_logger("database")

    def log_query(self, query: str, params: Optional[dict] = None, duration_ms: Optional[float] = None):
        """Log database query."""
        extra_data = {
            "query": query,
        }
        if params:
            extra_data["params"] = params
        if duration_ms:
            extra_data["duration_ms"] = duration_ms

        self.logger.debug("Database query", extra={"extra_data": extra_data})


# Global database logger instance
db_query_logger = DatabaseQueryLogger()


# ============================================================
# Logging Configuration
# ============================================================

def configure_logging(
    level: str = "INFO",
    structured: bool = False,
    enable_sql_logging: bool = False,
):
    """Configure global logging settings.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        structured: Use JSON formatting
        enable_sql_logging: Enable SQLAlchemy query logging
    """
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level))

    # Clear existing handlers
    root_logger.handlers.clear()

    # Add handler
    handler = logging.StreamHandler(sys.stdout)
    if structured:
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(ColoredFormatter())
    root_logger.addHandler(handler)

    # SQLAlchemy logging
    if enable_sql_logging:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
    else:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
