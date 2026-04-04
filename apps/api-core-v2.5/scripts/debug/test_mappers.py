import asyncio
from sqlalchemy.orm import configure_mappers
from app.db.models.user import User
from app.db.models.narrative import Narrative
from app.db.models.application import Opportunity
from app.db.models.route import Route
from app.db.models.interview import InterviewSession

def check():
    try:
        configure_mappers()
        print("Mappers configured successfully!")
    except Exception as e:
        print(f"Error: {e}")

check()
