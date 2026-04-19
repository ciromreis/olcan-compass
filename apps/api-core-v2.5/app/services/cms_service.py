"""
CMS Service for Enhanced Document Forge System

Handles structured user input collection, form validation,
and auto-population of document content.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.models.enhanced_forge import CMSFormData
from app.schemas.enhanced_forge import CMSFormDataCreate, CMSFormDataUpdate


class CMSService:
    """Service for CMS form data management and validation"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.form_schemas = self._load_form_schemas()
    
    def _load_form_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Load form schemas for validation and structure"""
        
        return {
            "personal_information": {
                "version": "1.0",
                "sections": {
                    "basic_info": {
                        "fields": {
                            "full_name": {"type": "text", "required": True, "max_length": 100},
                            "email": {"type": "email", "required": True},
                            "phone": {"type": "phone", "required": False},
                            "date_of_birth": {"type": "date", "required": False},
                            "nationality": {"type": "text", "required": False, "max_length": 50},
                            "passport_number": {"type": "text", "required": False, "max_length": 20}
                        }
                    },
                    "address": {
                        "fields": {
                            "street_address": {"type": "text", "required": False, "max_length": 200},
                            "city": {"type": "text", "required": False, "max_length": 100},
                            "state_province": {"type": "text", "required": False, "max_length": 100},
                            "postal_code": {"type": "text", "required": False, "max_length": 20},
                            "country": {"type": "text", "required": False, "max_length": 50}
                        }
                    }
                }
            },
            "education_history": {
                "version": "1.0",
                "sections": {
                    "degrees": {
                        "fields": {
                            "degree_type": {"type": "select", "required": True, "options": ["Bachelor", "Master", "PhD", "Diploma", "Certificate"]},
                            "field_of_study": {"type": "text", "required": True, "max_length": 100},
                            "institution_name": {"type": "text", "required": True, "max_length": 200},
                            "institution_country": {"type": "text", "required": True, "max_length": 50},
                            "start_date": {"type": "date", "required": True},
                            "end_date": {"type": "date", "required": False},
                            "gpa": {"type": "number", "required": False, "min": 0, "max": 4.0},
                            "honors": {"type": "text", "required": False, "max_length": 100},
                            "thesis_title": {"type": "text", "required": False, "max_length": 200},
                            "relevant_coursework": {"type": "textarea", "required": False, "max_length": 500}
                        }
                    }
                }
            },
            "work_experience": {
                "version": "1.0",
                "sections": {
                    "positions": {
                        "fields": {
                            "job_title": {"type": "text", "required": True, "max_length": 100},
                            "company_name": {"type": "text", "required": True, "max_length": 200},
                            "company_industry": {"type": "text", "required": False, "max_length": 100},
                            "employment_type": {"type": "select", "required": True, "options": ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]},
                            "start_date": {"type": "date", "required": True},
                            "end_date": {"type": "date", "required": False},
                            "is_current": {"type": "boolean", "required": False},
                            "location": {"type": "text", "required": False, "max_length": 100},
                            "responsibilities": {"type": "textarea", "required": True, "max_length": 1000},
                            "achievements": {"type": "textarea", "required": False, "max_length": 1000},
                            "skills_used": {"type": "tags", "required": False},
                            "salary_range": {"type": "text", "required": False, "max_length": 50}
                        }
                    }
                }
            },
            "skills_certifications": {
                "version": "1.0",
                "sections": {
                    "technical_skills": {
                        "fields": {
                            "programming_languages": {"type": "tags", "required": False},
                            "frameworks": {"type": "tags", "required": False},
                            "tools_software": {"type": "tags", "required": False},
                            "databases": {"type": "tags", "required": False},
                            "cloud_platforms": {"type": "tags", "required": False}
                        }
                    },
                    "soft_skills": {
                        "fields": {
                            "leadership": {"type": "textarea", "required": False, "max_length": 300},
                            "communication": {"type": "textarea", "required": False, "max_length": 300},
                            "problem_solving": {"type": "textarea", "required": False, "max_length": 300},
                            "teamwork": {"type": "textarea", "required": False, "max_length": 300}
                        }
                    },
                    "certifications": {
                        "fields": {
                            "certification_name": {"type": "text", "required": True, "max_length": 200},
                            "issuing_organization": {"type": "text", "required": True, "max_length": 200},
                            "issue_date": {"type": "date", "required": True},
                            "expiry_date": {"type": "date", "required": False},
                            "credential_id": {"type": "text", "required": False, "max_length": 100},
                            "verification_url": {"type": "url", "required": False}
                        }
                    }
                }
            },
            "achievements_publications": {
                "version": "1.0",
                "sections": {
                    "achievements": {
                        "fields": {
                            "achievement_title": {"type": "text", "required": True, "max_length": 200},
                            "achievement_type": {"type": "select", "required": True, "options": ["Award", "Recognition", "Competition", "Grant", "Scholarship", "Other"]},
                            "issuing_organization": {"type": "text", "required": True, "max_length": 200},
                            "date_received": {"type": "date", "required": True},
                            "description": {"type": "textarea", "required": False, "max_length": 500},
                            "monetary_value": {"type": "text", "required": False, "max_length": 50}
                        }
                    },
                    "publications": {
                        "fields": {
                            "publication_title": {"type": "text", "required": True, "max_length": 300},
                            "publication_type": {"type": "select", "required": True, "options": ["Journal Article", "Conference Paper", "Book Chapter", "Book", "Patent", "Other"]},
                            "journal_conference": {"type": "text", "required": False, "max_length": 200},
                            "publication_date": {"type": "date", "required": True},
                            "authors": {"type": "text", "required": True, "max_length": 500},
                            "doi_url": {"type": "url", "required": False},
                            "abstract": {"type": "textarea", "required": False, "max_length": 1000}
                        }
                    }
                }
            },
            "languages": {
                "version": "1.0",
                "sections": {
                    "language_proficiency": {
                        "fields": {
                            "language": {"type": "text", "required": True, "max_length": 50},
                            "proficiency_level": {"type": "select", "required": True, "options": ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]},
                            "speaking": {"type": "select", "required": False, "options": ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]},
                            "writing": {"type": "select", "required": False, "options": ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]},
                            "reading": {"type": "select", "required": False, "options": ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]},
                            "listening": {"type": "select", "required": False, "options": ["Native", "Fluent", "Advanced", "Intermediate", "Basic"]},
                            "test_scores": {"type": "text", "required": False, "max_length": 200},
                            "test_date": {"type": "date", "required": False}
                        }
                    }
                }
            },
            "references": {
                "version": "1.0",
                "sections": {
                    "professional_references": {
                        "fields": {
                            "reference_name": {"type": "text", "required": True, "max_length": 100},
                            "reference_title": {"type": "text", "required": True, "max_length": 100},
                            "company_organization": {"type": "text", "required": True, "max_length": 200},
                            "relationship": {"type": "text", "required": True, "max_length": 100},
                            "email": {"type": "email", "required": True},
                            "phone": {"type": "phone", "required": False},
                            "years_known": {"type": "number", "required": False, "min": 0, "max": 50},
                            "permission_granted": {"type": "boolean", "required": True}
                        }
                    }
                }
            }
        }
    
    async def save_form_data(self, user_id: str, form_data: CMSFormDataCreate) -> CMSFormData:
        """Save or update form data with validation"""
        
        # Validate form data
        validation_errors = self._validate_form_data(form_data)
        
        # Check if form data already exists
        result = await self.db.execute(
            select(CMSFormData).where(
                and_(
                    CMSFormData.user_id == user_id,
                    CMSFormData.form_type == form_data.form_type,
                    CMSFormData.section_name == form_data.section_name
                )
            )
        )
        existing_form = result.scalar_one_or_none()
        
        if existing_form:
            # Update existing form
            existing_form.field_data = form_data.field_data
            existing_form.form_version = form_data.form_version
            existing_form.completion_percentage = self._calculate_completion_percentage(form_data)
            existing_form.is_validated = len(validation_errors) == 0
            existing_form.validation_errors = validation_errors
            existing_form.last_auto_save = datetime.utcnow()
            existing_form.updated_at = datetime.utcnow()
            
            await self.db.commit()
            return existing_form
        else:
            # Create new form
            cms_form = CMSFormData(
                user_id=user_id,
                form_type=form_data.form_type,
                form_version=form_data.form_version,
                section_name=form_data.section_name,
                field_data=form_data.field_data,
                completion_percentage=self._calculate_completion_percentage(form_data),
                is_validated=len(validation_errors) == 0,
                validation_errors=validation_errors,
                last_auto_save=datetime.utcnow()
            )
            
            self.db.add(cms_form)
            await self.db.commit()
            return cms_form
    
    async def get_user_profile_data(self, user_id: str) -> Dict[str, Any]:
        """Get consolidated user profile data from all forms"""
        
        result = await self.db.execute(
            select(CMSFormData).where(CMSFormData.user_id == user_id)
        )
        forms = result.scalars().all()
        
        profile_data = {}
        
        for form in forms:
            if form.form_type not in profile_data:
                profile_data[form.form_type] = {}
            
            profile_data[form.form_type][form.section_name] = {
                "data": form.field_data,
                "completion_percentage": form.completion_percentage,
                "is_validated": form.is_validated,
                "last_updated": form.updated_at.isoformat()
            }
        
        return profile_data
    
    async def get_missing_data_for_document_type(self, user_id: str, document_type: str) -> List[Dict[str, Any]]:
        """Identify missing data needed for a specific document type"""
        
        # Get user's current data
        profile_data = await self.get_user_profile_data(user_id)
        
        # Define required data for different document types
        document_requirements = {
            "resume": [
                {"form_type": "personal_information", "section": "basic_info", "fields": ["full_name", "email", "phone"]},
                {"form_type": "work_experience", "section": "positions", "fields": ["job_title", "company_name", "responsibilities"]},
                {"form_type": "education_history", "section": "degrees", "fields": ["degree_type", "field_of_study", "institution_name"]},
                {"form_type": "skills_certifications", "section": "technical_skills", "fields": ["programming_languages"]}
            ],
            "cover_letter": [
                {"form_type": "personal_information", "section": "basic_info", "fields": ["full_name", "email"]},
                {"form_type": "work_experience", "section": "positions", "fields": ["job_title", "achievements"]},
                {"form_type": "skills_certifications", "section": "soft_skills", "fields": ["leadership", "communication"]}
            ],
            "personal_statement": [
                {"form_type": "personal_information", "section": "basic_info", "fields": ["full_name"]},
                {"form_type": "education_history", "section": "degrees", "fields": ["field_of_study", "thesis_title"]},
                {"form_type": "achievements_publications", "section": "achievements", "fields": ["achievement_title"]},
                {"form_type": "work_experience", "section": "positions", "fields": ["achievements"]}
            ]
        }
        
        requirements = document_requirements.get(document_type, [])
        missing_data = []
        
        for requirement in requirements:
            form_type = requirement["form_type"]
            section = requirement["section"]
            required_fields = requirement["fields"]
            
            # Check if user has this form data
            if form_type not in profile_data or section not in profile_data[form_type]:
                missing_data.append({
                    "form_type": form_type,
                    "section": section,
                    "missing_fields": required_fields,
                    "reason": "Section not completed"
                })
                continue
            
            # Check individual fields
            user_data = profile_data[form_type][section]["data"]
            missing_fields = []
            
            for field in required_fields:
                if field not in user_data or not user_data[field]:
                    missing_fields.append(field)
            
            if missing_fields:
                missing_data.append({
                    "form_type": form_type,
                    "section": section,
                    "missing_fields": missing_fields,
                    "reason": "Required fields not completed"
                })
        
        return missing_data
    
    async def auto_populate_document_content(self, user_id: str, document_type: str, 
                                           template_content: str) -> Tuple[str, List[str]]:
        """Auto-populate document content using user profile data"""
        
        profile_data = await self.get_user_profile_data(user_id)
        populated_content = template_content
        used_data_sources = []
        
        # Define content population mappings
        population_mappings = {
            "{{full_name}}": ("personal_information", "basic_info", "full_name"),
            "{{email}}": ("personal_information", "basic_info", "email"),
            "{{phone}}": ("personal_information", "basic_info", "phone"),
            "{{current_position}}": ("work_experience", "positions", "job_title"),
            "{{current_company}}": ("work_experience", "positions", "company_name"),
            "{{latest_degree}}": ("education_history", "degrees", "degree_type"),
            "{{field_of_study}}": ("education_history", "degrees", "field_of_study"),
            "{{university}}": ("education_history", "degrees", "institution_name"),
            "{{technical_skills}}": ("skills_certifications", "technical_skills", "programming_languages"),
            "{{leadership_experience}}": ("skills_certifications", "soft_skills", "leadership"),
            "{{achievements}}": ("achievements_publications", "achievements", "achievement_title")
        }
        
        for placeholder, (form_type, section, field) in population_mappings.items():
            if placeholder in populated_content:
                value = self._extract_field_value(profile_data, form_type, section, field)
                if value:
                    populated_content = populated_content.replace(placeholder, str(value))
                    used_data_sources.append(f"{form_type}.{section}.{field}")
                else:
                    # Keep placeholder if no data available
                    populated_content = populated_content.replace(placeholder, f"[{field.replace('_', ' ').title()}]")
        
        return populated_content, used_data_sources
    
    def _validate_form_data(self, form_data: CMSFormDataCreate) -> List[Dict[str, Any]]:
        """Validate form data against schema"""
        
        errors = []
        
        # Get form schema
        schema = self.form_schemas.get(form_data.form_type)
        if not schema:
            errors.append({
                "field": "form_type",
                "error": f"Unknown form type: {form_data.form_type}"
            })
            return errors
        
        # Get section schema
        section_schema = schema["sections"].get(form_data.section_name)
        if not section_schema:
            errors.append({
                "field": "section_name",
                "error": f"Unknown section: {form_data.section_name}"
            })
            return errors
        
        # Validate fields
        for field_name, field_config in section_schema["fields"].items():
            value = form_data.field_data.get(field_name)
            
            # Check required fields
            if field_config.get("required", False) and not value:
                errors.append({
                    "field": field_name,
                    "error": "This field is required"
                })
                continue
            
            if value is None:
                continue
            
            # Validate field type and constraints
            field_errors = self._validate_field(field_name, value, field_config)
            errors.extend(field_errors)
        
        return errors
    
    def _validate_field(self, field_name: str, value: Any, field_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate individual field"""
        
        errors = []
        field_type = field_config.get("type", "text")
        
        # Type validation
        if field_type == "email" and value:
            if "@" not in str(value) or "." not in str(value):
                errors.append({
                    "field": field_name,
                    "error": "Invalid email format"
                })
        
        elif field_type == "number" and value is not None:
            try:
                num_value = float(value)
                if "min" in field_config and num_value < field_config["min"]:
                    errors.append({
                        "field": field_name,
                        "error": f"Value must be at least {field_config['min']}"
                    })
                if "max" in field_config and num_value > field_config["max"]:
                    errors.append({
                        "field": field_name,
                        "error": f"Value must be at most {field_config['max']}"
                    })
            except (ValueError, TypeError):
                errors.append({
                    "field": field_name,
                    "error": "Invalid number format"
                })
        
        elif field_type in ["text", "textarea"] and value:
            if "max_length" in field_config and len(str(value)) > field_config["max_length"]:
                errors.append({
                    "field": field_name,
                    "error": f"Text must be at most {field_config['max_length']} characters"
                })
        
        elif field_type == "select" and value:
            options = field_config.get("options", [])
            if value not in options:
                errors.append({
                    "field": field_name,
                    "error": f"Value must be one of: {', '.join(options)}"
                })
        
        return errors
    
    def _calculate_completion_percentage(self, form_data: CMSFormDataCreate) -> int:
        """Calculate completion percentage for form data"""
        
        schema = self.form_schemas.get(form_data.form_type)
        if not schema:
            return 0
        
        section_schema = schema["sections"].get(form_data.section_name)
        if not section_schema:
            return 0
        
        total_fields = len(section_schema["fields"])
        completed_fields = 0
        
        for field_name, field_config in section_schema["fields"].items():
            value = form_data.field_data.get(field_name)
            
            # Count field as completed if it has a value or is not required
            if value or not field_config.get("required", False):
                completed_fields += 1
        
        return int((completed_fields / total_fields) * 100) if total_fields > 0 else 0
    
    def _extract_field_value(self, profile_data: Dict[str, Any], form_type: str, 
                           section: str, field: str) -> Optional[Any]:
        """Extract field value from profile data"""
        
        try:
            return profile_data[form_type][section]["data"][field]
        except KeyError:
            return None
    
    async def get_form_schema(self, form_type: str) -> Optional[Dict[str, Any]]:
        """Get form schema for frontend form generation"""
        
        return self.form_schemas.get(form_type)
    
    async def get_all_form_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Get all available form schemas"""
        
        return self.form_schemas
    
    async def export_user_profile(self, user_id: str, format: str = "json") -> Dict[str, Any]:
        """Export complete user profile data"""
        
        profile_data = await self.get_user_profile_data(user_id)
        
        if format == "json":
            return {
                "user_id": user_id,
                "export_date": datetime.utcnow().isoformat(),
                "profile_data": profile_data,
                "completion_summary": self._calculate_profile_completion_summary(profile_data)
            }
        
        # Could add other formats like CSV, XML, etc.
        return profile_data
    
    def _calculate_profile_completion_summary(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall profile completion summary"""
        
        total_sections = 0
        completed_sections = 0
        total_completion = 0
        
        for form_type, sections in profile_data.items():
            for section_name, section_data in sections.items():
                total_sections += 1
                completion_pct = section_data.get("completion_percentage", 0)
                total_completion += completion_pct
                
                if completion_pct >= 80:  # Consider 80%+ as completed
                    completed_sections += 1
        
        return {
            "total_sections": total_sections,
            "completed_sections": completed_sections,
            "overall_completion_percentage": int(total_completion / total_sections) if total_sections > 0 else 0,
            "completion_rate": (completed_sections / total_sections * 100) if total_sections > 0 else 0
        }