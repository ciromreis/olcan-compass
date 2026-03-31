#!/usr/bin/env python3
"""
Test JWT token decoding
"""

from jose import jwt
import os

# Same settings as in auth_service.py
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production-minimum-32-chars")
ALGORITHM = "HS256"

# Token from login response
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJleHAiOjE3NzQ0ODczMzksInR5cGUiOiJhY2Nlc3MifQ.YkI62BUBdJ8XmdjyOyBkYLqDWfpaWSE4TaBu85dVv1A"

try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("✅ Token decoded successfully!")
    print(f"Payload: {payload}")
    print(f"User ID: {payload.get('sub')}")
    print(f"Username: {payload.get('username')}")
    print(f"Type: {payload.get('type')}")
    print(f"Expiry: {payload.get('exp')}")
except Exception as e:
    print(f"❌ Token decode failed: {e}")
