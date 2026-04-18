"""Seed script for 12 archetype configurations

This script populates the archetype_configs table with deep metadata
for all 12 professional archetypes in the Olcan Matrix.

Usage:
    python scripts/seed_archetype_configs.py
"""

import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker
from app.db.models.psychology import ArchetypeConfig, ProfessionalArchetype


# 12 Archetype Configurations with Deep Metadata
ARCHETYPE_CONFIGS = [
    {
        "archetype": ProfessionalArchetype.INDIVIDUAL_SOVEREIGNTY,
        "name_en": "Individual Sovereignty",
        "name_pt": "Soberania Individual",
        "name_es": "Soberanía Individual",
        "description_en": "Professionals seeking jurisdictions that respect individual and financial sovereignty",
        "description_pt": "Profissionais que buscam jurisdições que respeitem sua soberania individual e financeira",
        "description_es": "Profesionales que buscan jurisdicciones que respeten su soberanía individual y financiera",
        "primary_motivator": "Autonomy and Geopolitical Freedom",
        "primary_fear": "Loss of freedom and autonomy",
        "evolution_path": "Local Operator → International Sovereign Strategist",
        "preferred_route_types": ["job_relocation", "digital_nomad", "investor_visa"],
        "route_weights": {
            "employment": 0.8,
            "education": 0.3,
            "entrepreneurship": 0.9,
            "investment": 0.9,
            "family": 0.5
        },
        "narrative_voice": {
            "tone": "assertive",
            "focus": "autonomy_and_freedom",
            "keywords": ["independent", "sovereign", "self-directed", "autonomous"],
            "avoid": ["team player", "corporate ladder", "traditional path"],
            "sentence_style": "direct_and_confident",
            "achievement_framing": "impact_and_autonomy"
        },
        "companion_traits": {
            "personality": "rebellious_mentor",
            "communication_style": "direct_and_challenging",
            "encouragement_type": "freedom_focused",
            "evolution_triggers": ["visa_obtained", "remote_job_secured", "tax_optimization"],
            "visual_theme": "phoenix",
            "abilities": ["visa_navigator", "remote_work_optimizer", "tax_strategist"]
        },
        "interview_focus_areas": ["autonomy_questions", "remote_work_setup", "timezone_flexibility", "independent_projects"],
        "service_preferences": {
            "career_coaching": 0.6,
            "visa_consulting": 0.9,
            "tax_optimization": 0.9,
            "language_training": 0.4,
            "interview_prep": 0.7
        },
        "typical_risk_tolerance": "high",
        "decision_speed": "fast",
        "content_themes": ["freedom", "sovereignty", "location_independence", "financial_autonomy"],
        "success_metrics": ["visa_obtained", "remote_income", "tax_optimization", "location_freedom"],
        "preferred_quest_types": ["visa_preparation", "remote_job_search", "tax_optimization", "digital_nomad_setup"],
        "achievement_priorities": ["visa_milestones", "location_independence", "financial_sovereignty"]
    },
    {
        "archetype": ProfessionalArchetype.ACADEMIC_ELITE,
        "name_en": "Academic Elite",
        "name_pt": "Elite Acadêmica",
        "name_es": "Elite Académica",
        "description_en": "Candidates for excellence scholarships (Ivy League, Russell Group, Erasmus) and cutting-edge research",
        "description_pt": "Candidatos a bolsas de Excelência (Ivy League, Russell Group, Erasmus) e Pesquisa de Ponta",
        "description_es": "Candidatos a becas de excelencia (Ivy League, Russell Group, Erasmus) e investigación de vanguardia",
        "primary_motivator": "Prestige and Erudition",
        "primary_fear": "Academic failure and loss of status",
        "evolution_path": "Base Candidate → Global Academic Reference",
        "preferred_route_types": ["scholarship", "research_position", "academic_exchange"],
        "route_weights": {
            "employment": 0.5,
            "education": 1.0,
            "entrepreneurship": 0.3,
            "investment": 0.2,
            "family": 0.4
        },
        "narrative_voice": {
            "tone": "scholarly",
            "focus": "academic_excellence",
            "keywords": ["research", "scholarly", "academic", "rigorous", "innovative"],
            "avoid": ["practical", "commercial", "mainstream"],
            "sentence_style": "formal_and_precise",
            "achievement_framing": "intellectual_contribution"
        },
        "companion_traits": {
            "personality": "wise_professor",
            "communication_style": "scholarly_and_encouraging",
            "encouragement_type": "intellectual_growth",
            "evolution_triggers": ["scholarship_awarded", "paper_published", "conference_accepted"],
            "visual_theme": "owl",
            "abilities": ["research_advisor", "scholarship_finder", "academic_network_builder"]
        },
        "interview_focus_areas": ["research_methodology", "academic_contributions", "publication_record", "intellectual_curiosity"],
        "service_preferences": {
            "career_coaching": 0.4,
            "visa_consulting": 0.7,
            "tax_optimization": 0.3,
            "language_training": 0.8,
            "interview_prep": 0.9
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "deliberate",
        "content_themes": ["academic_excellence", "research", "intellectual_growth", "prestige"],
        "success_metrics": ["scholarship_awarded", "publications", "citations", "academic_network"],
        "preferred_quest_types": ["scholarship_application", "research_proposal", "academic_networking", "publication_prep"],
        "achievement_priorities": ["academic_recognition", "research_impact", "scholarly_network"]
    },
    {
        "archetype": ProfessionalArchetype.CAREER_MASTERY,
        "name_en": "Career Mastery",
        "name_pt": "Maestria de Carreira",
        "name_es": "Maestría de Carrera",
        "description_en": "Professionals transitioning sectors or hierarchical levels in the international market",
        "description_pt": "Profissionais em transição de setor ou nível hierárquico no mercado internacional",
        "description_es": "Profesionales en transición de sector o nivel jerárquico en el mercado internacional",
        "primary_motivator": "Expertise and Value Realignment",
        "primary_fear": "Career stagnation and skill obsolescence",
        "evolution_path": "Regional Specialist → Global Career Master",
        "preferred_route_types": ["job_relocation", "upskilling", "career_pivot"],
        "route_weights": {
            "employment": 0.9,
            "education": 0.7,
            "entrepreneurship": 0.6,
            "investment": 0.4,
            "family": 0.5
        },
        "narrative_voice": {
            "tone": "professional",
            "focus": "expertise_and_growth",
            "keywords": ["expert", "strategic", "transformative", "value-driven"],
            "avoid": ["entry-level", "junior", "learning"],
            "sentence_style": "confident_and_strategic",
            "achievement_framing": "value_and_impact"
        },
        "companion_traits": {
            "personality": "strategic_coach",
            "communication_style": "professional_and_motivating",
            "encouragement_type": "growth_focused",
            "evolution_triggers": ["promotion", "skill_certification", "career_pivot_success"],
            "visual_theme": "dragon",
            "abilities": ["career_strategist", "skill_mapper", "interview_coach"]
        },
        "interview_focus_areas": ["leadership_experience", "strategic_thinking", "change_management", "value_creation"],
        "service_preferences": {
            "career_coaching": 0.9,
            "visa_consulting": 0.6,
            "tax_optimization": 0.5,
            "language_training": 0.6,
            "interview_prep": 0.9
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "moderate",
        "content_themes": ["career_growth", "expertise", "leadership", "transformation"],
        "success_metrics": ["promotion", "salary_increase", "skill_mastery", "career_pivot"],
        "preferred_quest_types": ["skill_development", "leadership_training", "career_transition", "networking"],
        "achievement_priorities": ["career_advancement", "skill_mastery", "professional_recognition"]
    },
    {
        "archetype": ProfessionalArchetype.GLOBAL_PRESENCE,
        "name_en": "Global Presence",
        "name_pt": "Presença Global",
        "name_es": "Presencia Global",
        "description_en": "Remote professionals focused on digital nomad visas and geographic optimization",
        "description_pt": "Profissionais remotos focados em vistos de nômade digital e otimização geográfica",
        "description_es": "Profesionales remotos enfocados en visas de nómada digital y optimización geográfica",
        "primary_motivator": "Freedom of Flow and Experience",
        "primary_fear": "Being tied down and missing experiences",
        "evolution_path": "Corporate Tourist → Global Flow Citizen",
        "preferred_route_types": ["digital_nomad", "remote_work", "location_independent"],
        "route_weights": {
            "employment": 0.7,
            "education": 0.4,
            "entrepreneurship": 0.8,
            "investment": 0.6,
            "family": 0.3
        },
        "narrative_voice": {
            "tone": "adventurous",
            "focus": "flexibility_and_experience",
            "keywords": ["adaptable", "global", "remote", "flexible", "experienced"],
            "avoid": ["office-based", "9-to-5", "traditional"],
            "sentence_style": "dynamic_and_engaging",
            "achievement_framing": "experience_and_adaptability"
        },
        "companion_traits": {
            "personality": "adventurous_guide",
            "communication_style": "enthusiastic_and_supportive",
            "encouragement_type": "experience_focused",
            "evolution_triggers": ["new_country", "remote_job", "nomad_visa"],
            "visual_theme": "butterfly",
            "abilities": ["location_scout", "visa_optimizer", "remote_work_finder"]
        },
        "interview_focus_areas": ["remote_work_experience", "adaptability", "timezone_management", "cultural_awareness"],
        "service_preferences": {
            "career_coaching": 0.5,
            "visa_consulting": 0.9,
            "tax_optimization": 0.7,
            "language_training": 0.7,
            "interview_prep": 0.6
        },
        "typical_risk_tolerance": "high",
        "decision_speed": "fast",
        "content_themes": ["travel", "remote_work", "flexibility", "cultural_experiences"],
        "success_metrics": ["countries_visited", "remote_income", "visa_diversity", "cultural_integration"],
        "preferred_quest_types": ["visa_application", "remote_job_search", "location_research", "cultural_integration"],
        "achievement_priorities": ["location_diversity", "remote_income", "cultural_experiences"]
    },
    {
        "archetype": ProfessionalArchetype.FRONTIER_ARCHITECT,
        "name_en": "Frontier Architect",
        "name_pt": "Arquiteto de Fronteira",
        "name_es": "Arquitecto de Frontera",
        "description_en": "Engineers and developers focused on technology transfer and competency-based relocation",
        "description_pt": "Engenheiros e DEVs focados em transferência tecnológica e realocação por competência",
        "description_es": "Ingenieros y desarrolladores enfocados en transferencia tecnológica y reubicación por competencia",
        "primary_motivator": "Structure and Technical Security",
        "primary_fear": "Technical obsolescence and instability",
        "evolution_path": "Technical Resource → Next-Generation Architect",
        "preferred_route_types": ["job_relocation", "tech_transfer", "skilled_migration"],
        "route_weights": {
            "employment": 0.9,
            "education": 0.6,
            "entrepreneurship": 0.7,
            "investment": 0.5,
            "family": 0.6
        },
        "narrative_voice": {
            "tone": "technical",
            "focus": "technical_excellence",
            "keywords": ["architect", "engineer", "technical", "systematic", "innovative"],
            "avoid": ["non-technical", "soft skills only"],
            "sentence_style": "precise_and_structured",
            "achievement_framing": "technical_impact"
        },
        "companion_traits": {
            "personality": "technical_mentor",
            "communication_style": "logical_and_supportive",
            "encouragement_type": "skill_focused",
            "evolution_triggers": ["tech_certification", "system_design", "architecture_role"],
            "visual_theme": "robot",
            "abilities": ["tech_stack_advisor", "certification_guide", "system_design_coach"]
        },
        "interview_focus_areas": ["system_design", "technical_depth", "problem_solving", "architecture_decisions"],
        "service_preferences": {
            "career_coaching": 0.7,
            "visa_consulting": 0.8,
            "tax_optimization": 0.5,
            "language_training": 0.5,
            "interview_prep": 0.9
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "moderate",
        "content_themes": ["technical_excellence", "architecture", "innovation", "systems"],
        "success_metrics": ["tech_certifications", "system_launches", "technical_leadership", "patents"],
        "preferred_quest_types": ["technical_certification", "system_design", "code_review", "architecture_planning"],
        "achievement_priorities": ["technical_mastery", "system_impact", "innovation"]
    },
    {
        "archetype": ProfessionalArchetype.VERIFIED_TALENT,
        "name_en": "Verified Talent",
        "name_pt": "Talento Validado",
        "name_es": "Talento Verificado",
        "description_en": "Technical talents seeking certification of their seniority in high-performance environments",
        "description_pt": "Talentos técnicos em busca de certificação de sua senioridade em ambientes de alta performance",
        "description_es": "Talentos técnicos en busca de certificación de su senioridad en entornos de alto rendimiento",
        "primary_motivator": "Market Validation and Confidence",
        "primary_fear": "Competence doubt and rejection",
        "evolution_path": "Hidden Expert → World-Class Talent",
        "preferred_route_types": ["job_relocation", "certification", "skill_validation"],
        "route_weights": {
            "employment": 0.9,
            "education": 0.7,
            "entrepreneurship": 0.4,
            "investment": 0.3,
            "family": 0.5
        },
        "narrative_voice": {
            "tone": "confident",
            "focus": "proven_expertise",
            "keywords": ["proven", "validated", "certified", "accomplished", "recognized"],
            "avoid": ["aspiring", "learning", "junior"],
            "sentence_style": "evidence_based",
            "achievement_framing": "validation_and_recognition"
        },
        "companion_traits": {
            "personality": "confidence_builder",
            "communication_style": "encouraging_and_validating",
            "encouragement_type": "validation_focused",
            "evolution_triggers": ["certification_earned", "job_offer", "positive_feedback"],
            "visual_theme": "lion",
            "abilities": ["confidence_coach", "achievement_highlighter", "validation_tracker"]
        },
        "interview_focus_areas": ["achievements", "certifications", "impact_metrics", "recognition"],
        "service_preferences": {
            "career_coaching": 0.9,
            "visa_consulting": 0.6,
            "tax_optimization": 0.4,
            "language_training": 0.6,
            "interview_prep": 1.0
        },
        "typical_risk_tolerance": "low",
        "decision_speed": "deliberate",
        "content_themes": ["validation", "confidence", "recognition", "achievement"],
        "success_metrics": ["certifications", "job_offers", "salary_validation", "peer_recognition"],
        "preferred_quest_types": ["certification_prep", "interview_practice", "portfolio_building", "achievement_documentation"],
        "achievement_priorities": ["market_validation", "confidence_building", "recognition"]
    },
    {
        "archetype": ProfessionalArchetype.FUTURE_GUARDIAN,
        "name_en": "Future Guardian",
        "name_pt": "Guardiã do Futuro",
        "name_es": "Guardiana del Futuro",
        "description_en": "Professionals focused on building a safe and prosperous environment for future generations",
        "description_pt": "Profissionais focados na construção de um ambiente seguro e próspero para as próximas gerações",
        "description_es": "Profesionales enfocados en construir un entorno seguro y próspero para las próximas generaciones",
        "primary_motivator": "Stability and Family Legacy",
        "primary_fear": "Insecurity and failed legacy",
        "evolution_path": "Overwhelmed Leader → Strategic Future Guardian",
        "preferred_route_types": ["family_migration", "stable_employment", "quality_of_life"],
        "route_weights": {
            "employment": 0.8,
            "education": 0.7,
            "entrepreneurship": 0.5,
            "investment": 0.6,
            "family": 1.0
        },
        "narrative_voice": {
            "tone": "responsible",
            "focus": "stability_and_legacy",
            "keywords": ["reliable", "stable", "responsible", "family-oriented", "long-term"],
            "avoid": ["risky", "unstable", "short-term"],
            "sentence_style": "thoughtful_and_grounded",
            "achievement_framing": "legacy_and_stability"
        },
        "companion_traits": {
            "personality": "nurturing_guide",
            "communication_style": "supportive_and_understanding",
            "encouragement_type": "stability_focused",
            "evolution_triggers": ["family_visa", "stable_job", "quality_of_life_improvement"],
            "visual_theme": "tree",
            "abilities": ["family_planner", "stability_advisor", "quality_of_life_optimizer"]
        },
        "interview_focus_areas": ["work_life_balance", "stability", "family_support", "long_term_commitment"],
        "service_preferences": {
            "career_coaching": 0.7,
            "visa_consulting": 0.9,
            "tax_optimization": 0.6,
            "language_training": 0.7,
            "interview_prep": 0.7
        },
        "typical_risk_tolerance": "low",
        "decision_speed": "deliberate",
        "content_themes": ["family", "stability", "legacy", "quality_of_life"],
        "success_metrics": ["family_visa", "stable_income", "quality_of_life", "education_access"],
        "preferred_quest_types": ["family_visa_prep", "stable_job_search", "education_research", "quality_of_life_planning"],
        "achievement_priorities": ["family_security", "stable_future", "quality_of_life"]
    },
    {
        "archetype": ProfessionalArchetype.CHANGE_AGENT,
        "name_en": "Change Agent",
        "name_pt": "Agente de Mudança",
        "name_es": "Agente de Cambio",
        "description_en": "Public servants or executives seeking to transition to impact roles in NGOs or international organizations",
        "description_pt": "Servidores ou executivos que buscam transicionar para papéis de impacto em ONGs ou organismos internacionais",
        "description_es": "Servidores o ejecutivos que buscan transicionar a roles de impacto en ONGs u organismos internacionales",
        "primary_motivator": "Purpose and Systemic Impact",
        "primary_fear": "Meaninglessness and bureaucratic stagnation",
        "evolution_path": "Stagnant Bureaucrat → Global Impact Agent",
        "preferred_route_types": ["ngo_transition", "international_organization", "social_impact"],
        "route_weights": {
            "employment": 0.8,
            "education": 0.6,
            "entrepreneurship": 0.5,
            "investment": 0.3,
            "family": 0.5
        },
        "narrative_voice": {
            "tone": "purposeful",
            "focus": "impact_and_purpose",
            "keywords": ["impact", "purpose-driven", "transformative", "systemic", "meaningful"],
            "avoid": ["bureaucratic", "routine", "administrative"],
            "sentence_style": "mission_driven",
            "achievement_framing": "impact_and_change"
        },
        "companion_traits": {
            "personality": "mission_guide",
            "communication_style": "inspiring_and_purposeful",
            "encouragement_type": "purpose_focused",
            "evolution_triggers": ["ngo_role", "policy_change", "community_impact"],
            "visual_theme": "dove",
            "abilities": ["impact_mapper", "purpose_finder", "network_connector"]
        },
        "interview_focus_areas": ["social_impact", "change_management", "stakeholder_engagement", "mission_alignment"],
        "service_preferences": {
            "career_coaching": 0.8,
            "visa_consulting": 0.7,
            "tax_optimization": 0.4,
            "language_training": 0.7,
            "interview_prep": 0.8
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "moderate",
        "content_themes": ["purpose", "impact", "change", "social_good"],
        "success_metrics": ["impact_roles", "policy_influence", "community_outcomes", "mission_alignment"],
        "preferred_quest_types": ["impact_role_search", "network_building", "mission_alignment", "transition_planning"],
        "achievement_priorities": ["systemic_impact", "purpose_fulfillment", "change_creation"]
    },
    {
        "archetype": ProfessionalArchetype.KNOWLEDGE_NODE,
        "name_en": "Knowledge Node",
        "name_pt": "Nó de Conhecimento",
        "name_es": "Nodo de Conocimiento",
        "description_en": "Pure researchers seeking the best intellectual ecosystems for their theses",
        "description_pt": "Pesquisadores puros que buscam os melhores ecossistemas intelectuais para suas teses",
        "description_es": "Investigadores puros que buscan los mejores ecosistemas intelectuales para sus tesis",
        "primary_motivator": "Truth and Discovery",
        "primary_fear": "Intellectual isolation and irrelevance",
        "evolution_path": "Isolated Researcher → Global Knowledge Reference",
        "preferred_route_types": ["research_position", "academic_fellowship", "think_tank"],
        "route_weights": {
            "employment": 0.4,
            "education": 1.0,
            "entrepreneurship": 0.2,
            "investment": 0.2,
            "family": 0.3
        },
        "narrative_voice": {
            "tone": "intellectual",
            "focus": "knowledge_and_discovery",
            "keywords": ["research", "discovery", "intellectual", "rigorous", "groundbreaking"],
            "avoid": ["commercial", "applied", "practical"],
            "sentence_style": "academic_and_precise",
            "achievement_framing": "intellectual_contribution"
        },
        "companion_traits": {
            "personality": "intellectual_companion",
            "communication_style": "thoughtful_and_curious",
            "encouragement_type": "discovery_focused",
            "evolution_triggers": ["breakthrough", "publication", "collaboration"],
            "visual_theme": "telescope",
            "abilities": ["research_advisor", "collaboration_finder", "publication_guide"]
        },
        "interview_focus_areas": ["research_depth", "intellectual_curiosity", "collaboration", "innovation"],
        "service_preferences": {
            "career_coaching": 0.3,
            "visa_consulting": 0.7,
            "tax_optimization": 0.2,
            "language_training": 0.8,
            "interview_prep": 0.6
        },
        "typical_risk_tolerance": "low",
        "decision_speed": "deliberate",
        "content_themes": ["research", "discovery", "knowledge", "intellectual_growth"],
        "success_metrics": ["publications", "citations", "collaborations", "breakthroughs"],
        "preferred_quest_types": ["research_proposal", "publication_prep", "collaboration_building", "grant_writing"],
        "achievement_priorities": ["intellectual_impact", "knowledge_creation", "academic_network"]
    },
    {
        "archetype": ProfessionalArchetype.CONSCIOUS_LEADER,
        "name_en": "Conscious Leader",
        "name_pt": "Liderança Consciente",
        "name_es": "Liderazgo Consciente",
        "description_en": "C-levels seeking to decelerate without losing prominence, focusing on boards and strategic leadership",
        "description_pt": "C-levels buscando desacelerar sem perder o protagonismo, focando em conselhos e liderança estratégica",
        "description_es": "C-levels que buscan desacelerar sin perder protagonismo, enfocándose en consejos y liderazgo estratégico",
        "primary_motivator": "Balance and Senior Quality of Life",
        "primary_fear": "Irrelevance and burnout",
        "evolution_path": "Corporate Machine → Conscious Value Leader",
        "preferred_route_types": ["board_position", "advisory_role", "strategic_consulting"],
        "route_weights": {
            "employment": 0.7,
            "education": 0.4,
            "entrepreneurship": 0.6,
            "investment": 0.8,
            "family": 0.7
        },
        "narrative_voice": {
            "tone": "wise",
            "focus": "strategic_value",
            "keywords": ["strategic", "experienced", "balanced", "value-driven", "wise"],
            "avoid": ["operational", "hands-on", "high-pressure"],
            "sentence_style": "reflective_and_strategic",
            "achievement_framing": "wisdom_and_value"
        },
        "companion_traits": {
            "personality": "wise_advisor",
            "communication_style": "reflective_and_strategic",
            "encouragement_type": "balance_focused",
            "evolution_triggers": ["board_seat", "advisory_role", "work_life_balance"],
            "visual_theme": "sage",
            "abilities": ["strategic_advisor", "network_connector", "balance_optimizer"]
        },
        "interview_focus_areas": ["strategic_vision", "board_experience", "leadership_wisdom", "value_creation"],
        "service_preferences": {
            "career_coaching": 0.8,
            "visa_consulting": 0.6,
            "tax_optimization": 0.8,
            "language_training": 0.4,
            "interview_prep": 0.7
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "deliberate",
        "content_themes": ["balance", "wisdom", "strategic_value", "quality_of_life"],
        "success_metrics": ["board_positions", "advisory_roles", "work_life_balance", "strategic_impact"],
        "preferred_quest_types": ["board_search", "advisory_networking", "strategic_positioning", "balance_planning"],
        "achievement_priorities": ["strategic_influence", "work_life_balance", "legacy_building"]
    },
    {
        "archetype": ProfessionalArchetype.CULTURAL_PROTAGONIST,
        "name_en": "Cultural Protagonist",
        "name_pt": "Protagonista Cultural",
        "name_es": "Protagonista Cultural",
        "description_en": "Creative industries and arts seeking global cultural epicenters",
        "description_pt": "Indústrias Criativas e Artes que buscam os epicentros culturais globais",
        "description_es": "Industrias creativas y artes que buscan los epicentros culturales globales",
        "primary_motivator": "Expression and Identity",
        "primary_fear": "Creative suppression and marginalization",
        "evolution_path": "Marginal Creative → International Cultural Protagonist",
        "preferred_route_types": ["artist_visa", "cultural_exchange", "creative_residency"],
        "route_weights": {
            "employment": 0.6,
            "education": 0.5,
            "entrepreneurship": 0.8,
            "investment": 0.4,
            "family": 0.4
        },
        "narrative_voice": {
            "tone": "creative",
            "focus": "expression_and_identity",
            "keywords": ["creative", "innovative", "expressive", "cultural", "artistic"],
            "avoid": ["conventional", "corporate", "traditional"],
            "sentence_style": "expressive_and_unique",
            "achievement_framing": "creative_impact"
        },
        "companion_traits": {
            "personality": "creative_muse",
            "communication_style": "inspiring_and_expressive",
            "encouragement_type": "expression_focused",
            "evolution_triggers": ["exhibition", "performance", "cultural_recognition"],
            "visual_theme": "peacock",
            "abilities": ["creative_advisor", "cultural_navigator", "expression_coach"]
        },
        "interview_focus_areas": ["creative_portfolio", "cultural_impact", "artistic_vision", "innovation"],
        "service_preferences": {
            "career_coaching": 0.6,
            "visa_consulting": 0.8,
            "tax_optimization": 0.5,
            "language_training": 0.7,
            "interview_prep": 0.6
        },
        "typical_risk_tolerance": "high",
        "decision_speed": "fast",
        "content_themes": ["creativity", "expression", "culture", "identity"],
        "success_metrics": ["exhibitions", "performances", "cultural_recognition", "creative_income"],
        "preferred_quest_types": ["portfolio_building", "cultural_networking", "visa_application", "creative_projects"],
        "achievement_priorities": ["creative_expression", "cultural_impact", "artistic_recognition"]
    },
    {
        "archetype": ProfessionalArchetype.DESTINY_ARBITRATOR,
        "name_en": "Destiny Arbitrator",
        "name_pt": "Arbitrador de Destino",
        "name_es": "Árbitro de Destino",
        "description_en": "Professionals focused on the best systemic cost/benefit ratio between taxes, climate, and infrastructure",
        "description_pt": "Profissionais focados na melhor relação custo/benefício sistêmica entre impostos, clima e infraestrutura",
        "description_es": "Profesionales enfocados en la mejor relación costo/beneficio sistémica entre impuestos, clima e infraestructura",
        "primary_motivator": "Efficiency and Life Arbitrage",
        "primary_fear": "Suboptimal choices and wasted resources",
        "evolution_path": "Taxpayer → Arbiter of Own Reality",
        "preferred_route_types": ["tax_optimization", "quality_of_life", "geo_arbitrage"],
        "route_weights": {
            "employment": 0.7,
            "education": 0.4,
            "entrepreneurship": 0.8,
            "investment": 0.9,
            "family": 0.6
        },
        "narrative_voice": {
            "tone": "analytical",
            "focus": "optimization_and_efficiency",
            "keywords": ["optimized", "efficient", "strategic", "data-driven", "calculated"],
            "avoid": ["emotional", "impulsive", "suboptimal"],
            "sentence_style": "analytical_and_precise",
            "achievement_framing": "optimization_and_efficiency"
        },
        "companion_traits": {
            "personality": "strategic_optimizer",
            "communication_style": "analytical_and_practical",
            "encouragement_type": "efficiency_focused",
            "evolution_triggers": ["tax_savings", "quality_improvement", "arbitrage_success"],
            "visual_theme": "calculator",
            "abilities": ["tax_optimizer", "location_analyzer", "efficiency_maximizer"]
        },
        "interview_focus_areas": ["analytical_skills", "optimization", "strategic_thinking", "data_analysis"],
        "service_preferences": {
            "career_coaching": 0.5,
            "visa_consulting": 0.8,
            "tax_optimization": 1.0,
            "language_training": 0.5,
            "interview_prep": 0.6
        },
        "typical_risk_tolerance": "medium",
        "decision_speed": "moderate",
        "content_themes": ["optimization", "efficiency", "arbitrage", "strategic_living"],
        "success_metrics": ["tax_savings", "quality_of_life_score", "cost_efficiency", "location_optimization"],
        "preferred_quest_types": ["tax_planning", "location_analysis", "cost_optimization", "quality_research"],
        "achievement_priorities": ["life_optimization", "financial_efficiency", "strategic_positioning"]
    }
]


async def seed_archetype_configs():
    """Seed all 12 archetype configurations"""
    async with async_session_maker() as session:
        try:
            # Check if archetypes already exist
            result = await session.execute(select(ArchetypeConfig))
            existing = result.scalars().all()
            
            if existing:
                print(f"Found {len(existing)} existing archetype configs. Skipping seed.")
                return
            
            # Create all archetype configs
            configs_created = 0
            for config_data in ARCHETYPE_CONFIGS:
                config = ArchetypeConfig(
                    id=uuid.uuid4(),
                    **config_data
                )
                session.add(config)
                configs_created += 1
                print(f"Created: {config_data['name_en']} ({config_data['archetype'].value})")
            
            await session.commit()
            print(f"\n✅ Successfully seeded {configs_created} archetype configurations!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding archetype configs: {e}")
            raise


if __name__ == "__main__":
    print("🌱 Seeding Archetype Configurations...")
    print("=" * 60)
    asyncio.run(seed_archetype_configs())
    print("=" * 60)
    print("✅ Seed complete!")
