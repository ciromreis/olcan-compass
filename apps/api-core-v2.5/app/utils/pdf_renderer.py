"""HTML Renderer for Master Dossier.

This renderer creates HTML documents that browsers can save as PDF.
Works on Render free tier without system dependencies.

IMPLEMENTED: 2026-04-22 (free tier compatible)
"""

import io
from datetime import datetime, timezone
from typing import Optional
from jinja2 import Environment, select_autoescape

from app.services.dossier_orchestrator import MasterDossierPayload


# ============================================================
# HTML Template (inline for portability)
# ============================================================

DOSSIER_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Master Strategic Dossier - {{ payload.metadata.user_name }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Source+Sans+3:wght@300;400;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --olcan-navy: #001338;
            --olcan-slate: #F8FAFC;
            --olcan-accent: #FBBF24;
            --olcan-text: #1E293B;
            --olcan-muted: #64748B;
        }
        
        body {
            font-family: 'Source Sans 3', -apple-system, sans-serif;
            color: var(--olcan-navy);
            line-height: 1.6;
            background: var(--olcan-slate);
        }
        
        h1, h2, h3 {
            font-family: 'DM Serif Display', Georgia, serif;
            font-weight: 400;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--olcan-navy);
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--olcan-navy);
        }
        
        .logo span {
            color: var(--olcan-accent);
        }
        
        .meta {
            text-align: right;
            font-size: 12px;
            color: var(--olcan-muted);
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18px;
            color: var(--olcan-navy);
            padding-bottom: 8px;
            border-bottom: 1px solid #E2E8F0;
            margin-bottom: 16px;
        }
        
        .section.the-mirror {
            background: linear-gradient(135deg, #001338 0%, #1E3A8A 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
        }
        
        .section.the-mirror .section-title {
            color: var(--olcan-accent);
            border-bottom-color: rgba(251, 191, 36, 0.3);
        }
        
        .archetype-badge {
            display: inline-block;
            background: var(--olcan-accent);
            color: var(--olcan-navy);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .readiness-score {
            font-size: 48px;
            font-family: 'DM Serif Display', serif;
            font-weight: 400;
        }
        
        .readiness-bar {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        
        .dimension {
            flex: 1;
            text-align: center;
        }
        
        .dimension-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: rgba(255,255,255,0.7);
        }
        
        .dimension-value {
            font-size: 20px;
            font-weight: 600;
        }
        
        .route-timeline {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .milestone {
            flex: 1;
            min-width: 120px;
            padding: 12px;
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
        }
        
        .milestone.completed {
            border-color: #10B981;
            background: #F0FDF4;
        }
        
        .milestone.pending {
            border-color: #FCD34D;
        }
        
        .task-list {
            list-style: none;
        }
        
        .task-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #E2E8F0;
        }
        
        .task-item:last-child {
            border-bottom: none;
        }
        
        .task-priority {
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 10px;
            text-transform: uppercase;
        }
        
        .task-priority.high {
            background: #FEE2E2;
            color: #DC2626;
        }
        
        .task-priority.medium {
            background: #FEF3C7;
            color: #D97706;
        }
        
        .task-priority.low {
            background: #DBEAFE;
            color: #2563EB;
        }
        
        .documents-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .artifact {
            padding: 12px;
            background: white;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
        }
        
        .artifact-score {
            font-size: 24px;
            font-weight: 600;
            color: var(--olcan-navy);
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E2E8F0;
            text-align: center;
            font-size: 11px;
            color: var(--olcan-muted);
        }
        
        .page-break {
            page-break-after: always;
        }
        
        @media print {
            .page {
                box-shadow: none;
                margin: 0;
                padding: 15mm;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <header class="header">
            <div class="logo">Olcan<span>Compass</span></div>
            <div class="meta">
                <div>Master Strategic Dossier</div>
                <div>Gerado em: {{ payload.metadata.generated_at.strftime('%d/%m/%Y') }}</div>
                <div>{{ payload.metadata.target_destination or 'Planejamento Personalizado' }}</div>
            </div>
        </header>
        
        <!-- THE MIRROR: Identity & Readiness -->
        {% if payload.identity_readiness %}
        <section class="section the-mirror">
            <h2 class="section-title">THE MIRROR</h2>
            <p>Identidade & Preparação</p>
            
            <div class="archetype-badge">
                {{ payload.identity_readiness.archetype_display }}
            </div>
            
            <div class="readiness-score">
                {{ payload.identity_readiness.readiness_score }}%
            </div>
            <p style="font-size: 12px; opacity: 0.7;">Readiness Score</p>
            
            <div class="readiness-bar">
                {% for dim, score in payload.identity_readiness.dimensions.items() %}
                <div class="dimension">
                    <div class="dimension-value">{{ score }}%</div>
                    <div class="dimension-label">{{ dim }}</div>
                </div>
                {% endfor %}
            </div>
            
            {% if payload.identity_readiness.risk_flags %}
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="font-size: 12px; opacity: 0.7;">Risk Flags</p>
                <ul style="font-size: 12px; margin-left: 16px;">
                    {% for flag in payload.identity_readiness.risk_flags %}
                    <li>{{ flag }}</li>
                    {% endfor %}
                </ul>
            </div>
            {% endif %}
        </section>
        {% endif %}
        
        <!-- THE COMPASS: Strategic Route -->
        {% if payload.strategic_route %}
        <section class="section">
            <h2 class="section-title">THE COMPASS</h2>
            <p>Rota Estratégica</p>
            
            <div style="margin-bottom: 16px;">
                <strong>{{ payload.strategic_route.route_name }}</strong>
                <span style="color: var(--olcan-muted);"> · {{ payload.strategic_route.route_type }}</span>
            </div>
            
            <div style="display: flex; gap: 24px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 24px; font-weight: 600;">{{ payload.strategic_route.timeline_months }}</div>
                    <div style="font-size: 11px; color: var(--olcan-muted);">Meses</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 600; color: #10B981;">{{ payload.strategic_route.completed_milestones }}</div>
                    <div style="font-size: 11px; color: var(--olcan-muted);">Concluídos</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: 600;">{{ payload.strategic_route.pending_milestones }}</div>
                    <div style="font-size: 11px; color: var(--olcan-muted);">Pendentes</div>
                </div>
            </div>
            
            <div class="route-timeline">
                {% for m in payload.strategic_route.milestones %}
                <div class="milestone {{ 'completed' if m.status == 'completed' else 'pending' }}">
                    <div style="font-size: 11px; color: var(--olcan-muted);">{{ m.order }}</div>
                    <div style="font-weight: 600;">{{ m.title }}</div>
                </div>
                {% endfor %}
            </div>
        </section>
        {% endif %}
        
        <!-- Upcoming Tasks -->
        {% if payload.upcoming_tasks %}
        <section class="section">
            <h2 class="section-title">PRÓXIMAS AÇÕES</h2>
            <p>Tarefas pendentes para as próximas semanas</p>
            
            <ul class="task-list">
                {% for task in payload.upcoming_tasks[:5] %}
                <li class="task-item">
                    <span>{{ task.title }}</span>
                    <span class="task-priority {{ task.priority }}">{{ task.priority }}</span>
                </li>
                {% endfor %}
            </ul>
        </section>
        {% endif %}
        
        <div class="page-break"></div>
        
        <!-- THE FORGE: Execution Artifacts -->
        <section class="section">
            <h2 class="section-title">THE FORGE</h2>
            <p>Artefatos de Execução</p>
            
            {% if payload.execution_artifacts %}
            <div class="documents-grid">
                {% for doc in payload.execution_artifacts %}
                <div class="artifact">
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--olcan-muted);">
                        {{ doc.type }}
                    </div>
                    <div style="font-weight: 600;">{{ doc.title }}</div>
                    <div class="artifact-score">
                        {% if doc.olcan_score %}{{ doc.olcan_score }}{% else %}--{% endif %}
                    </div>
                    <div style="font-size: 10px; color: var(--olcan-muted);">Olcan Score</div>
                </div>
                {% endfor %}
            </div>
            {% else %}
            <p style="color: var(--olcan-muted);">Nenhum documento criado ainda.</p>
            {% endif %}
        </section>
        
        <!-- Footer -->
        <footer class="footer">
            <p>Gerado por Olcan Compass · compass.olcan.com.br</p>
            <p>Este documento é propriedade intelectual do candidato.</p>
        </footer>
    </div>
</body>
</html>
"""


# ============================================================
# HTML Renderer
# ============================================================

class DossierHtmlRenderer:
    """Renders Master Dossier as HTML (browsers can save as PDF).
    
    Free tier compatible - no system dependencies required.
    """
    
    def __init__(self):
        self.env = Environment(
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def render(self, payload: MasterDossierPayload) -> bytes:
        """Render payload as HTML bytes."""
        
        template = self.env.from_string(DOSSIER_TEMPLATE)
        html_content = template.render(payload=payload)
        
        return html_content.encode('utf-8')


async def generate_dossier_pdf(payload: MasterDossierPayload) -> bytes:
    """Render Master Dossier as HTML (browser-renderable).
    
    Returns HTML that can be saved as PDF in any browser.
    """
    renderer = DossierHtmlRenderer()
    return await renderer.render(payload)