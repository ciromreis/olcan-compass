-- Create Enhanced Document Forge System Tables

-- 1. Create Process table for multi-process management
CREATE TABLE IF NOT EXISTS processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    process_type VARCHAR(100) NOT NULL,
    target_institution VARCHAR(255),
    target_organization VARCHAR(255),
    deadline TIMESTAMPTZ,
    priority_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    status enhanced_process_status NOT NULL DEFAULT 'draft',
    readiness_score FLOAT NOT NULL DEFAULT 0.0,
    target_readiness FLOAT NOT NULL DEFAULT 90.0,
    momentum_score FLOAT NOT NULL DEFAULT 0.0,
    process_metadata JSONB NOT NULL DEFAULT '{}',
    requirements_context JSONB NOT NULL DEFAULT '{}',
    timeline_data JSONB NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_processes_user_id ON processes(user_id);
CREATE INDEX IF NOT EXISTS ix_processes_status ON processes(status);
CREATE INDEX IF NOT EXISTS ix_processes_deadline ON processes(deadline);

-- 2. Create DocumentVariation table for document variation management
CREATE TABLE IF NOT EXISTS document_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    variation_type enhanced_document_variation_type NOT NULL,
    content TEXT NOT NULL,
    content_sections JSONB NOT NULL DEFAULT '{}',
    shared_sections JSONB NOT NULL DEFAULT '[]',
    customized_sections JSONB NOT NULL DEFAULT '[]',
    version INTEGER NOT NULL DEFAULT 1,
    status enhanced_document_variation_status NOT NULL DEFAULT 'draft',
    ats_score FLOAT,
    authenticity_score FLOAT,
    cultural_fit_score FLOAT,
    variation_metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_document_variations_base_document_id ON document_variations(base_document_id);
CREATE INDEX IF NOT EXISTS ix_document_variations_process_id ON document_variations(process_id);
CREATE INDEX IF NOT EXISTS ix_document_variations_user_id ON document_variations(user_id);

-- 3. Create ProcessTask table for enhanced task management
CREATE TABLE IF NOT EXISTS process_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL DEFAULT 'custom',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    priority enhanced_task_priority NOT NULL DEFAULT 'medium',
    status enhanced_process_task_status NOT NULL DEFAULT 'todo',
    xp_reward INTEGER NOT NULL DEFAULT 10,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date TIMESTAMPTZ,
    blocking_task_id UUID REFERENCES process_tasks(id) ON DELETE SET NULL,
    template_task_id VARCHAR(100),
    task_metadata JSONB NOT NULL DEFAULT '{}',
    completion_notes TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_process_tasks_process_id ON process_tasks(process_id);
CREATE INDEX IF NOT EXISTS ix_process_tasks_user_id ON process_tasks(user_id);
CREATE INDEX IF NOT EXISTS ix_process_tasks_status ON process_tasks(status);
CREATE INDEX IF NOT EXISTS ix_process_tasks_due_date ON process_tasks(due_date);

-- 4. Create ProcessTemplate table for process templates
CREATE TABLE IF NOT EXISTS process_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    process_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    estimated_duration_days INTEGER,
    template_data JSONB NOT NULL DEFAULT '{}',
    task_templates JSONB NOT NULL DEFAULT '[]',
    document_requirements JSONB NOT NULL DEFAULT '[]',
    milestones JSONB NOT NULL DEFAULT '[]',
    success_metrics JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    success_rate FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_process_templates_process_type ON process_templates(process_type);
CREATE INDEX IF NOT EXISTS ix_process_templates_category ON process_templates(category);

-- 5. Create TechnicalReport table for technical report generation
CREATE TABLE IF NOT EXISTS technical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    title VARCHAR(255) NOT NULL,
    executive_summary TEXT,
    content_sections JSONB NOT NULL DEFAULT '{}',
    metrics_data JSONB NOT NULL DEFAULT '{}',
    timeline_data JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB NOT NULL DEFAULT '[]',
    export_formats JSONB NOT NULL DEFAULT '["pdf", "html"]',
    date_range_start TIMESTAMPTZ,
    date_range_end TIMESTAMPTZ,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_technical_reports_process_id ON technical_reports(process_id);
CREATE INDEX IF NOT EXISTS ix_technical_reports_user_id ON technical_reports(user_id);

-- 6. Create ExportJob table for export management
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
    export_type enhanced_export_type NOT NULL,
    format enhanced_export_format NOT NULL,
    branding_enabled BOOLEAN NOT NULL DEFAULT true,
    status enhanced_export_status NOT NULL DEFAULT 'queued',
    file_path VARCHAR(500),
    file_size_bytes INTEGER,
    download_url VARCHAR(500),
    export_options JSONB NOT NULL DEFAULT '{}',
    error_message TEXT,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS ix_export_jobs_status ON export_jobs(status);

-- 7. Create CMSFormData table for CMS integration
CREATE TABLE IF NOT EXISTS cms_form_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_type VARCHAR(100) NOT NULL,
    form_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    section_name VARCHAR(100) NOT NULL,
    field_data JSONB NOT NULL DEFAULT '{}',
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    is_validated BOOLEAN NOT NULL DEFAULT false,
    validation_errors JSONB NOT NULL DEFAULT '[]',
    last_auto_save TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_cms_form_data_user_id ON cms_form_data(user_id);
CREATE INDEX IF NOT EXISTS ix_cms_form_data_form_type ON cms_form_data(form_type);

-- 8. Extend existing user_progress table with new gamification fields
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS document_forge_xp INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS processes_completed INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS documents_created INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS variations_created INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS exports_generated INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS momentum_score FLOAT NOT NULL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS last_forge_activity TIMESTAMPTZ;

-- 9. Create ProcessEvent table for activity tracking
CREATE TABLE IF NOT EXISTS process_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_process_events_process_id ON process_events(process_id);
CREATE INDEX IF NOT EXISTS ix_process_events_user_id ON process_events(user_id);
CREATE INDEX IF NOT EXISTS ix_process_events_event_type ON process_events(event_type);

-- 10. Add foreign key relationships to existing tables
-- Link dossiers to processes
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS process_id UUID REFERENCES processes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS ix_dossiers_process_id ON dossiers(process_id);

-- Link documents to processes
ALTER TABLE documents ADD COLUMN IF NOT EXISTS process_id UUID REFERENCES documents(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS ix_documents_process_id ON documents(process_id);