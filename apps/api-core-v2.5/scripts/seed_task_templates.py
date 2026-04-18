#!/usr/bin/env python3
"""
Seed Task Templates for Professional Journey Routes

This script creates predefined task templates for different immigration routes
(Canada Express Entry, Germany Job Seeker, Australia Skilled Worker, etc.)

Usage:
    python scripts/seed_task_templates.py
"""

import os
import sys
import httpx
from typing import List, Dict, Any

# ============================================================
# Configuration
# ============================================================

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
AUTH_TOKEN = os.getenv("AUTH_TOKEN", "")

if not AUTH_TOKEN:
    print("❌ Error: AUTH_TOKEN environment variable is required")
    print("Usage: AUTH_TOKEN=your_token python scripts/seed_task_templates.py")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json",
}

# ============================================================
# Task Templates
# ============================================================

TASK_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "canada_express_entry": {
        "name": "Canada Express Entry",
        "name_en": "Canada Express Entry",
        "estimated_weeks": 24,
        "description": "Complete pathway for Canada Express Entry immigration",
        "tasks": [
            {
                "title": "Language Test Preparation",
                "description": "Prepare for and complete IELTS/CELPIP language test",
                "category": "LANGUAGE",
                "priority": "CRITICAL",
                "estimated_hours": 120,
                "subtasks": [
                    "Book IELTS/CELPIP exam date",
                    "Complete 20+ practice tests",
                    "Achieve CLB 9+ scores in all sections",
                    "Receive official test results"
                ]
            },
            {
                "title": "Educational Credential Assessment (ECA)",
                "description": "Get your foreign education credentials assessed",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 40,
                "subtasks": [
                    "Choose designated organization (WES, ICAS, etc.)",
                    "Request transcripts from all institutions",
                    "Submit application and documents",
                    "Receive ECA report"
                ]
            },
            {
                "title": "Create Express Entry Profile",
                "description": "Submit your Express Entry profile to IRCC",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 8,
                "subtasks": [
                    "Gather all required documents",
                    "Calculate CRS score",
                    "Complete online profile",
                    "Submit profile and receive confirmation"
                ]
            },
            {
                "title": "Provincial Nomination Research",
                "description": "Research and apply for Provincial Nominee Programs",
                "category": "RESEARCH",
                "priority": "MEDIUM",
                "estimated_hours": 30,
                "subtasks": [
                    "Research eligible PNP streams",
                    "Compare requirements and benefits",
                    "Submit PNP applications",
                    "Receive nomination (if applicable)"
                ]
            },
            {
                "title": "Work Experience Documentation",
                "description": "Gather and organize work experience evidence",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 20,
                "subtasks": [
                    "Request reference letters from employers",
                    "Collect pay stubs and tax documents",
                    "Prepare employment contracts",
                    "Translate documents if necessary"
                ]
            },
            {
                "title": "Police Clearance Certificates",
                "description": "Obtain police certificates from all countries lived in",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 15,
                "subtasks": [
                    "Identify all required countries",
                    "Apply for police certificates",
                    "Track application status",
                    "Receive all certificates"
                ]
            },
            {
                "title": "Medical Examination",
                "description": "Complete immigration medical examination",
                "category": "HEALTH",
                "priority": "HIGH",
                "estimated_hours": 5,
                "subtasks": [
                    "Find panel physician",
                    "Book appointment",
                    "Complete medical exam",
                    "Receive medical results"
                ]
            },
            {
                "title": "Proof of Funds Preparation",
                "description": "Prepare financial documentation for proof of funds",
                "category": "FINANCIAL",
                "priority": "MEDIUM",
                "estimated_hours": 10,
                "subtasks": [
                    "Calculate required funds",
                    "Request bank statements",
                    "Prepare investment documentation",
                    "Obtain official bank letters"
                ]
            },
            {
                "title": "Receive Invitation to Apply (ITA)",
                "description": "Wait for and receive ITA from IRCC",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Monitor Express Entry draws",
                    "Check CRS score cutoffs",
                    "Receive ITA notification",
                    "Note 60-day deadline"
                ]
            },
            {
                "title": "Submit Permanent Residence Application",
                "description": "Complete and submit PR application within 60 days",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 40,
                "subtasks": [
                    "Review application checklist",
                    "Complete all forms",
                    "Upload all documents",
                    "Submit application and pay fees"
                ]
            },
            {
                "title": "Biometrics Appointment",
                "description": "Complete biometrics collection",
                "category": "MILESTONE",
                "priority": "HIGH",
                "estimated_hours": 3,
                "subtasks": [
                    "Receive biometrics instruction letter",
                    "Book appointment at VAC",
                    "Attend biometrics appointment",
                    "Receive biometrics confirmation"
                ]
            },
            {
                "title": "Receive Confirmation of Permanent Residence",
                "description": "Receive COPR and prepare for landing",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Receive passport request",
                    "Submit passport for visa stamping",
                    "Receive COPR and visa",
                    "Verify all information is correct"
                ]
            },
            {
                "title": "Prepare for Landing",
                "description": "Final preparations for moving to Canada",
                "category": "PLANNING",
                "priority": "MEDIUM",
                "estimated_hours": 30,
                "subtasks": [
                    "Book flights",
                    "Arrange initial accommodation",
                    "Prepare settlement funds",
                    "Research city and neighborhood"
                ]
            },
            {
                "title": "Land in Canada",
                "description": "Complete immigration process at port of entry",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Arrive at port of entry",
                    "Present COPR and documents",
                    "Complete immigration interview",
                    "Receive PR card confirmation"
                ]
            },
            {
                "title": "Settle in Canada",
                "description": "Complete initial settlement tasks",
                "category": "PLANNING",
                "priority": "HIGH",
                "estimated_hours": 40,
                "subtasks": [
                    "Apply for SIN (Social Insurance Number)",
                    "Open Canadian bank account",
                    "Apply for provincial health card",
                    "Register children in school (if applicable)"
                ]
            }
        ]
    },
    
    "germany_job_seeker": {
        "name": "Germany Job Seeker Visa",
        "name_en": "Germany Job Seeker Visa",
        "estimated_weeks": 20,
        "description": "Complete pathway for Germany Job Seeker Visa",
        "tasks": [
            {
                "title": "German Language Preparation",
                "description": "Learn German to at least A1/A2 level",
                "category": "LANGUAGE",
                "priority": "HIGH",
                "estimated_hours": 150,
                "subtasks": [
                    "Enroll in German language course",
                    "Complete A1 level",
                    "Complete A2 level",
                    "Obtain Goethe-Zertifikat"
                ]
            },
            {
                "title": "Degree Recognition Check",
                "description": "Verify your degree is recognized in Germany",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 20,
                "subtasks": [
                    "Check Anabin database",
                    "Contact ZAB if needed",
                    "Submit recognition application",
                    "Receive recognition statement"
                ]
            },
            {
                "title": "Prepare German-Style CV",
                "description": "Create Lebenslauf (German CV format)",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 10,
                "subtasks": [
                    "Research German CV standards",
                    "Prepare professional photo",
                    "Write CV in German/English",
                    "Create cover letter templates"
                ]
            },
            {
                "title": "Blocked Account Setup",
                "description": "Open Sperrkonto (blocked account) for proof of funds",
                "category": "FINANCIAL",
                "priority": "CRITICAL",
                "estimated_hours": 5,
                "subtasks": [
                    "Choose provider (Expatrio, Fintiba, etc.)",
                    "Complete online application",
                    "Transfer required funds (€11,208)",
                    "Receive blocked account confirmation"
                ]
            },
            {
                "title": "Health Insurance",
                "description": "Obtain German health insurance",
                "category": "HEALTH",
                "priority": "HIGH",
                "estimated_hours": 5,
                "subtasks": [
                    "Research insurance providers",
                    "Compare travel vs. public insurance",
                    "Purchase insurance policy",
                    "Receive insurance certificate"
                ]
            },
            {
                "title": "Visa Application",
                "description": "Apply for Job Seeker Visa at German embassy",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 15,
                "subtasks": [
                    "Book embassy appointment",
                    "Complete visa application form",
                    "Prepare all required documents",
                    "Attend visa interview"
                ]
            },
            {
                "title": "Accommodation Search",
                "description": "Find temporary accommodation in Germany",
                "category": "PLANNING",
                "priority": "MEDIUM",
                "estimated_hours": 20,
                "subtasks": [
                    "Research cities and neighborhoods",
                    "Search on ImmobilienScout24, WG-Gesucht",
                    "Book temporary accommodation (Airbnb/WG)",
                    "Sign rental contract"
                ]
            },
            {
                "title": "Job Search Preparation",
                "description": "Prepare for job search in Germany",
                "category": "PLANNING",
                "priority": "HIGH",
                "estimated_hours": 30,
                "subtasks": [
                    "Create LinkedIn/Xing profiles",
                    "Register on job portals (StepStone, Indeed)",
                    "Prepare interview answers",
                    "Research salary expectations"
                ]
            },
            {
                "title": "Relocate to Germany",
                "description": "Move to Germany and begin job search",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Book flights",
                    "Arrive in Germany",
                    "Register address (Anmeldung)",
                    "Activate blocked account"
                ]
            },
            {
                "title": "Secure Employment",
                "description": "Find and accept job offer",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Apply to multiple positions",
                    "Attend interviews",
                    "Receive job offer",
                    "Sign employment contract"
                ]
            },
            {
                "title": "Convert to Work Visa",
                "description": "Apply for EU Blue Card or work permit",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 10,
                "subtasks": [
                    "Book Ausländertermin (foreigners office)",
                    "Prepare required documents",
                    "Submit work visa application",
                    "Receive residence permit"
                ]
            }
        ]
    },
    
    "australia_skilled_worker": {
        "name": "Australia Skilled Worker Visa",
        "name_en": "Australia Skilled Worker Visa (Subclass 189/190)",
        "estimated_weeks": 28,
        "description": "Complete pathway for Australian Skilled Independent/Regional Visa",
        "tasks": [
            {
                "title": "Skills Assessment",
                "description": "Get your occupation assessed by relevant authority",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 60,
                "subtasks": [
                    "Identify assessing authority for occupation",
                    "Review assessment requirements",
                    "Prepare documentation",
                    "Submit skills assessment application"
                ]
            },
            {
                "title": "English Language Test",
                "description": "Complete IELTS/PTE/TOEFL with competitive scores",
                "category": "LANGUAGE",
                "priority": "CRITICAL",
                "estimated_hours": 80,
                "subtasks": [
                    "Choose test type (IELTS/PTE/TOEFL)",
                    "Book test date",
                    "Complete intensive preparation",
                    "Achieve competent/proficient/superior scores"
                ]
            },
            {
                "title": "Points Test Calculation",
                "description": "Calculate and maximize your points score",
                "category": "RESEARCH",
                "priority": "HIGH",
                "estimated_hours": 10,
                "subtasks": [
                    "Use points calculator",
                    "Identify areas for improvement",
                    "Claim maximum points",
                    "Document points evidence"
                ]
            },
            {
                "title": "Expression of Interest (EOI)",
                "description": "Submit EOI through SkillSelect",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 8,
                "subtasks": [
                    "Create ImmiAccount",
                    "Complete EOI form",
                    "Submit EOI",
                    "Wait for invitation"
                ]
            },
            {
                "title": "State Nomination (if 190 visa)",
                "description": "Apply for state/territory nomination",
                "category": "DOCUMENTATION",
                "priority": "HIGH",
                "estimated_hours": 20,
                "subtasks": [
                    "Research state requirements",
                    "Submit state nomination application",
                    "Provide additional documents",
                    "Receive nomination"
                ]
            },
            {
                "title": "Receive Invitation to Apply",
                "description": "Receive invitation from Department of Home Affairs",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Monitor SkillSelect",
                    "Receive invitation email",
                    "Note 60-day deadline",
                    "Begin visa application"
                ]
            },
            {
                "title": "Visa Application Submission",
                "description": "Complete and submit visa application",
                "category": "DOCUMENTATION",
                "priority": "CRITICAL",
                "estimated_hours": 30,
                "subtasks": [
                    "Gather all documents",
                    "Complete online application",
                    "Upload documents",
                    "Pay visa fee (AUD 4,640)"
                ]
            },
            {
                "title": "Health and Character Checks",
                "description": "Complete medical examinations and police checks",
                "category": "HEALTH",
                "priority": "HIGH",
                "estimated_hours": 15,
                "subtasks": [
                    "Book medical examination",
                    "Complete health checks",
                    "Obtain police certificates",
                    "Upload to ImmiAccount"
                ]
            },
            {
                "title": "Visa Grant",
                "description": "Receive permanent residence visa grant",
                "category": "MILESTONE",
                "priority": "CRITICAL",
                "estimated_hours": 0,
                "subtasks": [
                    "Wait for processing",
                    "Respond to any requests",
                    "Receive visa grant notification",
                    "Check visa conditions"
                ]
            },
            {
                "title": "Initial Entry to Australia",
                "description": "Make first entry to activate visa",
                "category": "MILESTONE",
                "priority": "HIGH",
                "estimated_hours": 0,
                "subtasks": [
                    "Book flights",
                    "Arrive in Australia",
                    "Clear immigration",
                    "Begin settlement process"
                ]
            }
        ]
    }
}


# ============================================================
# Seeding Functions
# ============================================================

async def seed_templates():
    """Seed all task templates into the system."""
    
    print("🚀 Starting Task Template Seeding...")
    print(f"📍 API URL: {API_BASE_URL}")
    print()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for template_key, template_data in TASK_TEMPLATES.items():
            print(f"\n{'='*60}")
            print(f"📋 Template: {template_data['name']}")
            print(f"{'='*60}")
            
            # Template metadata
            print(f"   Estimated weeks: {template_data['estimated_weeks']}")
            print(f"   Total tasks: {len(template_data['tasks'])}")
            
            # Create each task
            for i, task_data in enumerate(template_data['tasks'], 1):
                print(f"\n   [{i}/{len(template_data['tasks'])}] Creating: {task_data['title']}")
                
                try:
                    # Prepare request
                    request_data = {
                        "title": task_data['title'],
                        "description": task_data['description'],
                        "category": task_data['category'],
                        "priority": task_data['priority'],
                        "estimated_hours": task_data['estimated_hours'],
                        "subtasks": task_data.get('subtasks', []),
                        "is_template": True,
                        "template_key": template_key,
                    }
                    
                    # Send request
                    response = await client.post(
                        f"{API_BASE_URL}/api/tasks",
                        headers=HEADERS,
                        json=request_data
                    )
                    
                    if response.status_code in [200, 201]:
                        task_id = response.json().get('id', 'unknown')
                        print(f"   ✅ Created (ID: {task_id})")
                    else:
                        print(f"   ❌ Failed: {response.status_code}")
                        print(f"      {response.text}")
                        
                except Exception as e:
                    print(f"   ❌ Error: {str(e)}")
            
            print(f"\n   ✅ Template '{template_data['name']}' completed!")
    
    print(f"\n{'='*60}")
    print("🎉 Task Template Seeding Complete!")
    print(f"{'='*60}")
    print(f"\nTotal templates seeded: {len(TASK_TEMPLATES)}")
    print("You can now use these templates when users select their route.")


# ============================================================
# Main Execution
# ============================================================

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_templates())
