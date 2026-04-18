# Changelog - Olcan Compass v2.5

## [2.5.0] - 2026-03-31

### 🎯 New Features

#### **Narrative Forge - CV Builder**
- ✅ PDF Import with client-side parsing (pdfjs-dist)
- ✅ 4 Professional templates in Portuguese
- ✅ Drag-and-drop section reordering (@dnd-kit)
- ✅ PDF/JSON export
- ✅ Auto-save every 2 seconds
- ✅ Real-time statistics

**Components:**
- `src/components/forge/PDFImporter.tsx`
- `src/components/forge/PDFExporter.tsx`
- `src/components/forge/SectionEditor.tsx`
- `src/components/forge/CVTemplates.tsx`
- `src/app/(app)/forge/[id]/cv-builder/page.tsx`

#### **ATS Optimizer (Resume Matcher)**
- ✅ CV vs Job Description compatibility analysis
- ✅ Weighted scoring (keywords 35%, skills 35%, exp 20%, edu 10%)
- ✅ 200+ technical skills detection
- ✅ Prioritized suggestions (critical/important/optional)
- ✅ Visual feedback with progress bars

**Components:**
- `src/components/forge/ATSAnalyzer.tsx`
- `src/lib/ats-analyzer.ts`
- `src/app/(app)/forge/[id]/ats-optimizer/page.tsx`

#### **Voice Interview System**
- ✅ Audio recording in browser (Web Audio API)
- ✅ Delivery analysis (tone, pace, clarity, confidence)
- ✅ Content analysis (relevance, depth, structure)
- ✅ Comprehensive feedback with strengths/improvements
- ✅ Hesitation and filler word detection

**Components:**
- `src/components/interviews/VoiceRecorder.tsx`
- `src/lib/audio-recorder.ts`

#### **Forge ↔ Interviews Integration**
- ✅ Contextual question generation from documents
- ✅ Interview sessions linked to documents
- ✅ Aggregated feedback from multiple sessions
- ✅ Document improvement suggestions
- ✅ Continuous improvement loop

**Backend:**
- `apps/api-core-v2.5/app/services/forge_interview_service.py`
- `apps/api-core-v2.5/app/services/voice_analysis_service.py`
- `apps/api-core-v2.5/app/api/routes/forge_interview.py`

#### **Rich Text Editor**
- ✅ TipTap integration with 15+ formatting tools
- ✅ Bold, italic, strikethrough, highlight
- ✅ Headings H1/H2/H3
- ✅ Lists and blockquotes
- ✅ Links
- ✅ Unlimited Undo/Redo
- ✅ Word and character counter
- ✅ Configurable character limit
- ✅ Keyboard shortcuts (Ctrl+S, Ctrl+B, etc.)

**Components:**
- `src/components/forge/RichTextEditor.tsx`
- `src/components/forge/InterviewFeedbackPanel.tsx`

### 📦 Dependencies Added

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@tiptap/react": "^3.20.1",
  "@tiptap/starter-kit": "^3.20.1",
  "@tiptap/extension-placeholder": "^3.22.0",
  "@tiptap/extension-character-count": "^3.22.0",
  "@tiptap/extension-link": "^3.22.0",
  "@tiptap/extension-highlight": "^3.22.0",
  "jspdf": "^4.2.1",
  "pdfjs-dist": "3.11.174",
  "react-to-print": "^3.3.0"
}
```

### 🎨 Branding Compliance

- ✅ 100% Portuguese (Brazil)
- ✅ Accessible terminology (no technical jargon)
- ✅ Clear user context
- ✅ Optimized performance (client-side processing)
- ✅ Premium UX (consistent Olcan design)

### 📊 Database Schema

**New relationships:**
- `InterviewSession.source_narrative_id` → `Document.id`
- Aggregated feedback stored in `InterviewSession`
- Audio recordings linked to `InterviewAnswer`

### 🔗 Inspired By

- **Reactive Resume** - Editor, templates, drag-and-drop
- **OpenResume** - PDF import
- **Resume Matcher** - ATS analysis
- **RenderCV** - Modular structure
- **Antriview** - Voice delivery analysis
- **FoloUp** - Content analysis

### 📝 Documentation

- `docs/ATS_OPTIMIZER_SUMMARY.md`
- `docs/FORGE_CV_BUILDER_SUMMARY.md`
- `docs/FORGE_INTEGRATION_SUMMARY.md`
- `docs/MICROSAAS_COMPLETE_IMPLEMENTATION.md`

---

## Version Separation

**v2 (Stable):** Production-ready, no changes  
**v2.5 (Development):** New MicroSaaS features, active development

### Migration from v2

v2.5 is a **copy** of v2 with new features added. v2 remains untouched and stable.

**Key Differences:**
- New Forge components
- ATS Optimizer
- Voice Interview system
- Rich text editor (TipTap)
- Additional dependencies

### Running v2.5

```bash
# Install dependencies
pnpm install

# Development
cd apps/app-compass-v2.5
pnpm dev

# Build
pnpm build

# Backend (v2.5)
cd apps/api-core-v2.5
python -m uvicorn app.main:app --reload
```

### Environment Variables

Same as v2, plus:

```env
# Optional: For future Whisper API integration
OPENAI_API_KEY=your_key_here
```

---

## Next Steps

### Phase 2: AI Integration
- [ ] GPT-4 for content generation
- [ ] Whisper API for professional transcription
- [ ] ML audio analysis (tone, energy, pauses)
- [ ] Intelligent rewrite suggestions

### Phase 3: Advanced Features
- [ ] Video recording for interviews
- [ ] Conversational AI mock interviews
- [ ] Analytics dashboard
- [ ] Market benchmarking

### Phase 4: Collaboration
- [ ] Document sharing
- [ ] Mentor feedback
- [ ] Peer review
- [ ] Community templates

---

**Developed:** March 31, 2026  
**Team:** Olcan Development  
**License:** Proprietary
