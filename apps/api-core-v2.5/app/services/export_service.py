"""
Export Service for Enhanced Document Forge System

Handles multi-format document exports (PDF, DOCX, Markdown, HTML, ZIP)
with branding control and background processing.
"""

import uuid
import os
import zipfile
import tempfile
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.enhanced_forge import (
    ExportJob, Process, DocumentVariation, TechnicalReport,
    ExportStatus, ExportType, ExportFormat
)
from app.models.document import Document
from app.core.config import settings


class ExportService:
    """Service for handling document and report exports"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.export_dir = Path(settings.EXPORT_DIR if hasattr(settings, 'EXPORT_DIR') else '/tmp/exports')
        self.export_dir.mkdir(exist_ok=True)
    
    async def process_export_job(self, job_id: uuid.UUID):
        """Process an export job in the background"""
        
        # Get the export job
        result = await self.db.execute(
            select(ExportJob).where(ExportJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            return
        
        try:
            # Update job status
            job.status = ExportStatus.PROCESSING
            job.progress_percentage = 10
            await self.db.commit()
            
            # Process based on export type
            if job.export_type == ExportType.DOCUMENT:
                await self._export_document(job)
            elif job.export_type == ExportType.DOSSIER:
                await self._export_dossier(job)
            elif job.export_type == ExportType.TECHNICAL_REPORT:
                await self._export_technical_report(job)
            
            # Mark as completed
            job.status = ExportStatus.COMPLETED
            job.progress_percentage = 100
            job.completed_at = datetime.utcnow()
            job.expires_at = datetime.utcnow() + timedelta(days=7)  # 7-day expiry
            
        except Exception as e:
            # Mark as failed
            job.status = ExportStatus.FAILED
            job.error_message = str(e)
            job.progress_percentage = 0
        
        await self.db.commit()
    
    async def _export_document(self, job: ExportJob):
        """Export a single document"""
        
        document_id = job.export_options.get('document_id')
        if not document_id:
            raise ValueError("Document ID not provided in export options")
        
        # Get document
        result = await self.db.execute(
            select(Document).where(
                and_(Document.id == document_id, Document.user_id == job.user_id)
            )
        )
        document = result.scalar_one_or_none()
        
        if not document:
            raise ValueError("Document not found")
        
        job.progress_percentage = 30
        await self.db.commit()
        
        # Generate export based on format
        if job.format == ExportFormat.PDF:
            file_path = await self._generate_pdf_document(document, job.branding_enabled)
        elif job.format == ExportFormat.DOCX:
            file_path = await self._generate_docx_document(document, job.branding_enabled)
        elif job.format == ExportFormat.MARKDOWN:
            file_path = await self._generate_markdown_document(document)
        else:
            raise ValueError(f"Unsupported format for document export: {job.format}")
        
        job.progress_percentage = 80
        await self.db.commit()
        
        # Set file info
        job.file_path = str(file_path)
        job.file_size_bytes = file_path.stat().st_size
        job.download_url = f"/api/v1/enhanced-forge/export-jobs/{job.id}/download"
    
    async def _export_dossier(self, job: ExportJob):
        """Export a complete dossier (all process documents)"""
        
        if not job.process_id:
            raise ValueError("Process ID required for dossier export")
        
        # Get process with all documents
        result = await self.db.execute(
            select(Process).where(
                and_(Process.id == job.process_id, Process.user_id == job.user_id)
            )
        )
        process = result.scalar_one_or_none()
        
        if not process:
            raise ValueError("Process not found")
        
        job.progress_percentage = 20
        await self.db.commit()
        
        # Get all documents and variations for this process
        documents_result = await self.db.execute(
            select(Document).where(Document.process_id == job.process_id)
        )
        documents = documents_result.scalars().all()
        
        variations_result = await self.db.execute(
            select(DocumentVariation).where(DocumentVariation.process_id == job.process_id)
        )
        variations = variations_result.scalars().all()
        
        job.progress_percentage = 40
        await self.db.commit()
        
        # Create temporary directory for dossier files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Create dossier structure
            dossier_dir = temp_path / f"dossier_{process.title.replace(' ', '_')}"
            dossier_dir.mkdir()
            
            # Generate cover page
            await self._generate_dossier_cover_page(process, dossier_dir)
            
            # Export documents
            if documents:
                docs_dir = dossier_dir / "documents"
                docs_dir.mkdir()
                
                for i, doc in enumerate(documents):
                    if job.format == ExportFormat.PDF:
                        doc_file = await self._generate_pdf_document(doc, job.branding_enabled)
                    elif job.format == ExportFormat.DOCX:
                        doc_file = await self._generate_docx_document(doc, job.branding_enabled)
                    else:
                        doc_file = await self._generate_markdown_document(doc)
                    
                    # Copy to dossier directory
                    target_path = docs_dir / f"{doc.title.replace(' ', '_')}.{job.format.value}"
                    target_path.write_bytes(doc_file.read_bytes())
                    
                    # Update progress
                    progress = 40 + (i / len(documents)) * 30
                    job.progress_percentage = int(progress)
                    await self.db.commit()
            
            # Export document variations
            if variations:
                variations_dir = dossier_dir / "variations"
                variations_dir.mkdir()
                
                for i, variation in enumerate(variations):
                    var_file = await self._generate_variation_export(variation, job.format, job.branding_enabled)
                    target_path = variations_dir / f"{variation.title.replace(' ', '_')}.{job.format.value}"
                    target_path.write_bytes(var_file.read_bytes())
            
            job.progress_percentage = 80
            await self.db.commit()
            
            # Create ZIP archive
            zip_path = self.export_dir / f"dossier_{job.id}.zip"
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in dossier_dir.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(temp_path)
                        zipf.write(file_path, arcname)
            
            # Set file info
            job.file_path = str(zip_path)
            job.file_size_bytes = zip_path.stat().st_size
            job.download_url = f"/api/v1/enhanced-forge/export-jobs/{job.id}/download"
    
    async def _export_technical_report(self, job: ExportJob):
        """Export a technical report"""
        
        report_id = job.export_options.get('report_id')
        if not report_id:
            raise ValueError("Report ID not provided in export options")
        
        # Get technical report
        result = await self.db.execute(
            select(TechnicalReport).where(
                and_(TechnicalReport.id == report_id, TechnicalReport.user_id == job.user_id)
            )
        )
        report = result.scalar_one_or_none()
        
        if not report:
            raise ValueError("Technical report not found")
        
        job.progress_percentage = 30
        await self.db.commit()
        
        # Generate export based on format
        if job.format == ExportFormat.PDF:
            file_path = await self._generate_pdf_report(report, job.branding_enabled)
        elif job.format == ExportFormat.HTML:
            file_path = await self._generate_html_report(report, job.branding_enabled)
        else:
            raise ValueError(f"Unsupported format for technical report export: {job.format}")
        
        job.progress_percentage = 80
        await self.db.commit()
        
        # Set file info
        job.file_path = str(file_path)
        job.file_size_bytes = file_path.stat().st_size
        job.download_url = f"/api/v1/enhanced-forge/export-jobs/{job.id}/download"
    
    async def _generate_pdf_document(self, document: Document, branding_enabled: bool) -> Path:
        """Generate PDF document with optional branding"""
        
        # This would integrate with a PDF generation library like WeasyPrint or ReportLab
        # For now, we'll create a placeholder implementation
        
        filename = f"document_{document.id}.pdf"
        file_path = self.export_dir / filename
        
        # Placeholder PDF content
        pdf_content = self._create_pdf_content(
            title=document.title,
            content=document.raw_text or "Document content",
            branding_enabled=branding_enabled
        )
        
        file_path.write_bytes(pdf_content)
        return file_path
    
    async def _generate_docx_document(self, document: Document, branding_enabled: bool) -> Path:
        """Generate DOCX document with optional branding"""
        
        # This would integrate with python-docx library
        # For now, we'll create a placeholder implementation
        
        filename = f"document_{document.id}.docx"
        file_path = self.export_dir / filename
        
        # Placeholder DOCX content
        docx_content = self._create_docx_content(
            title=document.title,
            content=document.raw_text or "Document content",
            branding_enabled=branding_enabled
        )
        
        file_path.write_bytes(docx_content)
        return file_path
    
    async def _generate_markdown_document(self, document: Document) -> Path:
        """Generate Markdown document"""
        
        filename = f"document_{document.id}.md"
        file_path = self.export_dir / filename
        
        # Create markdown content
        markdown_content = f"# {document.title}\n\n"
        markdown_content += f"**Type:** {document.document_type.value}\n"
        markdown_content += f"**Created:** {document.created_at.strftime('%Y-%m-%d')}\n"
        markdown_content += f"**Updated:** {document.updated_at.strftime('%Y-%m-%d')}\n\n"
        markdown_content += "---\n\n"
        markdown_content += document.raw_text or "Document content"
        
        file_path.write_text(markdown_content, encoding='utf-8')
        return file_path
    
    async def _generate_variation_export(self, variation: DocumentVariation, 
                                       format: ExportFormat, branding_enabled: bool) -> Path:
        """Generate export for document variation"""
        
        filename = f"variation_{variation.id}.{format.value}"
        file_path = self.export_dir / filename
        
        if format == ExportFormat.PDF:
            content = self._create_pdf_content(
                title=variation.title,
                content=variation.content,
                branding_enabled=branding_enabled
            )
        elif format == ExportFormat.DOCX:
            content = self._create_docx_content(
                title=variation.title,
                content=variation.content,
                branding_enabled=branding_enabled
            )
        elif format == ExportFormat.MARKDOWN:
            content = f"# {variation.title}\n\n{variation.content}".encode('utf-8')
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        file_path.write_bytes(content)
        return file_path
    
    async def _generate_dossier_cover_page(self, process: Process, dossier_dir: Path):
        """Generate cover page for dossier export"""
        
        cover_content = f"""# Dossier: {process.title}

**Process Type:** {process.process_type}
**Status:** {process.status.value}
**Readiness Score:** {process.readiness_score:.1f}%
**Target Institution:** {process.target_institution or 'N/A'}
**Deadline:** {process.deadline.strftime('%Y-%m-%d') if process.deadline else 'N/A'}

**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC

---

## Process Overview

This dossier contains all documents and materials related to the {process.process_type} application process.

### Contents

- Documents: Core application documents
- Variations: Process-specific document variations
- Metadata: Process configuration and progress data

### Readiness Assessment

Current readiness score: {process.readiness_score:.1f}%
Target readiness: {process.target_readiness:.1f}%
Momentum score: {process.momentum_score:.1f}%

---

*Generated by Olcan Compass Enhanced Document Forge System*
"""
        
        cover_path = dossier_dir / "README.md"
        cover_path.write_text(cover_content, encoding='utf-8')
    
    async def _generate_pdf_report(self, report: TechnicalReport, branding_enabled: bool) -> Path:
        """Generate PDF technical report"""
        
        filename = f"technical_report_{report.id}.pdf"
        file_path = self.export_dir / filename
        
        # Create comprehensive report content
        report_content = self._create_technical_report_pdf(report, branding_enabled)
        
        file_path.write_bytes(report_content)
        return file_path
    
    async def _generate_html_report(self, report: TechnicalReport, branding_enabled: bool) -> Path:
        """Generate HTML technical report with interactive elements"""
        
        filename = f"technical_report_{report.id}.html"
        file_path = self.export_dir / filename
        
        # Create interactive HTML report
        html_content = self._create_technical_report_html(report, branding_enabled)
        
        file_path.write_text(html_content, encoding='utf-8')
        return file_path
    
    def _create_pdf_content(self, title: str, content: str, branding_enabled: bool) -> bytes:
        """Create PDF content (placeholder implementation)"""
        
        # This would use a proper PDF library like WeasyPrint or ReportLab
        # For now, return placeholder content
        
        pdf_text = f"PDF Document: {title}\n\n{content}"
        
        if branding_enabled:
            pdf_text += "\n\n---\nGenerated by Olcan Compass Document Forge"
            pdf_text += "\nwww.olcan.com"
        
        return pdf_text.encode('utf-8')
    
    def _create_docx_content(self, title: str, content: str, branding_enabled: bool) -> bytes:
        """Create DOCX content (placeholder implementation)"""
        
        # This would use python-docx library
        # For now, return placeholder content
        
        docx_text = f"DOCX Document: {title}\n\n{content}"
        
        if branding_enabled:
            docx_text += "\n\n---\nGenerated by Olcan Compass Document Forge"
        
        return docx_text.encode('utf-8')
    
    def _create_technical_report_pdf(self, report: TechnicalReport, branding_enabled: bool) -> bytes:
        """Create technical report PDF content"""
        
        # This would generate a comprehensive PDF report with charts and visualizations
        # For now, return structured text content
        
        content = f"""Technical Report: {report.title}

Executive Summary:
{report.executive_summary or 'No executive summary provided.'}

Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}
Report Type: {report.report_type}

Metrics Data:
{self._format_metrics_for_pdf(report.metrics_data)}

Timeline Data:
{self._format_timeline_for_pdf(report.timeline_data)}

Recommendations:
{self._format_recommendations_for_pdf(report.recommendations)}
"""
        
        if branding_enabled:
            content += "\n\n---\nGenerated by Olcan Compass Enhanced Document Forge"
            content += "\nwww.olcan.com"
        
        return content.encode('utf-8')
    
    def _create_technical_report_html(self, report: TechnicalReport, branding_enabled: bool) -> str:
        """Create interactive HTML technical report"""
        
        branding_footer = ""
        if branding_enabled:
            branding_footer = """
            <footer style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: center; color: #666;">
                <p>Generated by <strong>Olcan Compass Enhanced Document Forge</strong></p>
                <p><a href="https://www.olcan.com">www.olcan.com</a></p>
            </footer>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{report.title}</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 2rem; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }}
                .section {{ background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .metric {{ display: inline-block; background: #f8f9fa; padding: 1rem; margin: 0.5rem; border-radius: 4px; min-width: 150px; text-align: center; }}
                .timeline-item {{ padding: 1rem; border-left: 3px solid #667eea; margin-left: 1rem; margin-bottom: 1rem; }}
                .recommendation {{ background: #e3f2fd; padding: 1rem; margin: 0.5rem 0; border-radius: 4px; border-left: 4px solid #2196f3; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report.title}</h1>
                <p>Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                <p>Report Type: {report.report_type}</p>
            </div>
            
            <div class="section">
                <h2>Executive Summary</h2>
                <p>{report.executive_summary or 'No executive summary provided.'}</p>
            </div>
            
            <div class="section">
                <h2>Key Metrics</h2>
                {self._format_metrics_for_html(report.metrics_data)}
            </div>
            
            <div class="section">
                <h2>Timeline</h2>
                {self._format_timeline_for_html(report.timeline_data)}
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
                {self._format_recommendations_for_html(report.recommendations)}
            </div>
            
            {branding_footer}
        </body>
        </html>
        """
        
        return html_content
    
    def _format_metrics_for_pdf(self, metrics_data: Dict[str, Any]) -> str:
        """Format metrics data for PDF output"""
        
        if not metrics_data:
            return "No metrics data available."
        
        formatted = []
        for key, value in metrics_data.items():
            formatted.append(f"- {key.replace('_', ' ').title()}: {value}")
        
        return "\n".join(formatted)
    
    def _format_metrics_for_html(self, metrics_data: Dict[str, Any]) -> str:
        """Format metrics data for HTML output"""
        
        if not metrics_data:
            return "<p>No metrics data available.</p>"
        
        html_metrics = []
        for key, value in metrics_data.items():
            html_metrics.append(f'<div class="metric"><strong>{key.replace("_", " ").title()}</strong><br>{value}</div>')
        
        return "".join(html_metrics)
    
    def _format_timeline_for_pdf(self, timeline_data: Dict[str, Any]) -> str:
        """Format timeline data for PDF output"""
        
        events = timeline_data.get('events', [])
        if not events:
            return "No timeline events available."
        
        formatted = []
        for event in events:
            formatted.append(f"- {event.get('date', 'Unknown date')}: {event.get('title', 'Unknown event')}")
        
        return "\n".join(formatted)
    
    def _format_timeline_for_html(self, timeline_data: Dict[str, Any]) -> str:
        """Format timeline data for HTML output"""
        
        events = timeline_data.get('events', [])
        if not events:
            return "<p>No timeline events available.</p>"
        
        html_events = []
        for event in events:
            html_events.append(f'''
                <div class="timeline-item">
                    <strong>{event.get('date', 'Unknown date')}</strong><br>
                    {event.get('title', 'Unknown event')}
                </div>
            ''')
        
        return "".join(html_events)
    
    def _format_recommendations_for_pdf(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format recommendations for PDF output"""
        
        if not recommendations:
            return "No recommendations available."
        
        formatted = []
        for rec in recommendations:
            formatted.append(f"- {rec.get('title', 'Untitled')}: {rec.get('description', 'No description')}")
        
        return "\n".join(formatted)
    
    def _format_recommendations_for_html(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format recommendations for HTML output"""
        
        if not recommendations:
            return "<p>No recommendations available.</p>"
        
        html_recs = []
        for rec in recommendations:
            html_recs.append(f'''
                <div class="recommendation">
                    <strong>{rec.get('title', 'Untitled')}</strong><br>
                    {rec.get('description', 'No description')}
                </div>
            ''')
        
        return "".join(html_recs)
    
    async def cleanup_expired_exports(self):
        """Clean up expired export files"""
        
        # Get expired export jobs
        result = await self.db.execute(
            select(ExportJob).where(
                and_(
                    ExportJob.expires_at.isnot(None),
                    ExportJob.expires_at < datetime.utcnow()
                )
            )
        )
        expired_jobs = result.scalars().all()
        
        for job in expired_jobs:
            # Delete file if it exists
            if job.file_path and Path(job.file_path).exists():
                try:
                    Path(job.file_path).unlink()
                except OSError:
                    pass  # File might already be deleted
            
            # Delete job record
            await self.db.delete(job)
        
        await self.db.commit()
        return len(expired_jobs)