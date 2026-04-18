# Task Management System - Design & UX Improvements

## Date: 2026-04-13
## Status: Implementation Guidelines

---

## 🎨 Design System Alignment

### Color Palette (Aligned with Olcan Compass)
- **Primary**: `slate-950` (buttons, active states)
- **Secondary**: `blue-600` (links, highlights)
- **Background**: `slate-50`, `white`
- **Borders**: `slate-200`
- **Text**: `slate-950` (headings), `slate-600` (body), `slate-400` (muted)
- **Success**: `green-600`
- **Warning**: `yellow-600`
- **Error**: `red-600`

### Spacing & Layout
- **Container padding**: `p-6` (24px)
- **Section gaps**: `gap-6` (24px)
- **Component gaps**: `gap-3` (12px)
- **Card padding**: `p-4` to `p-6`
- **Button padding**: `px-5 py-2.5` (comfortable touch targets)

### Border Radius
- **Buttons**: `rounded-xl` (12px)
- **Cards**: `rounded-2xl` (16px)
- **Inputs**: `rounded-xl` (12px)
- **Modals**: `rounded-2xl` (16px)
- **Tabs**: `rounded-xl` (12px)

### Typography
- **Page title**: `text-3xl font-bold tracking-tight`
- **Section headers**: `text-xl font-bold`
- **Subheaders**: `text-lg font-semibold`
- **Body**: `text-sm` or `text-base`
- **Labels**: `text-xs font-semibold uppercase tracking-wide`

---

## 🌐 Portuguese Translation Guide

### Navigation
- Tasks → Tarefas
- Calendar → Calendario
- Achievements → Conquistas
- Dashboard → Painel
- Routes → Caminhos
- Applications → Candidaturas
- Marketplace → Mercado

### Task Management
- Task Dashboard → Central de Tarefas
- New Task → Nova Tarefa
- Create New Task → Criar Nova Tarefa
- Task List → Lista de Tarefas
- Task Calendar → Calendario de Tarefas
- Achievement Gallery → Galeria de Conquistas

### Actions
- Complete → Concluir
- Start → Iniciar
- Delete → Excluir
- Edit → Editar
- Save → Salvar
- Cancel → Cancelar
- Export → Exportar
- Filter → Filtrar
- Search → Buscar
- Clear → Limpar

### Status
- All Tasks → Todas
- Pending → Pendente
- In Progress → Em Progresso
- Completed → Concluida
- Cancelled → Cancelada

### Priority
- Critical → Critica
- High → Alta
- Medium → Media
- Low → Baixa

### Categories
- Documentation → Documentacao
- Language → Idioma
- Research → Pesquisa
- Planning → Planejamento
- Health → Saude
- Financial → Financeiro

### Gamification
- XP → XP (keep as-is)
- Level → Nivel
- Streak → Sequencia
- Achievement → Conquista
- Progress → Progresso
- Statistics → Estatisticas

### Messages
- Loading tasks... → Carregando tarefas...
- No tasks yet → Nenhuma tarefa ainda
- Task completed! → Tarefa concluida!
- Level up! → Subiu de nivel!
- Export successful → Exportacao concluida

---

## 🚫 Design Restrictions

### No Emojis
- Remove all emoji characters from UI
- Use Lucide icons instead
- Use Unicode symbols sparingly (only when necessary)

### Avoid Compression
- Don't cram features into small spaces
- Use proper spacing (`gap-6`, `p-6`)
- Allow content to breathe
- Use grid layouts for organization
- Provide adequate whitespace

### Better Integration
- Integrate with existing navbar (done - added to navigation.ts)
- Use existing design tokens
- Follow app layout patterns
- Match breadcrumb structure

---

## 📐 Layout Improvements

### Tasks Page Structure
```
┌─────────────────────────────────────────────┐
│ Page Header (title + actions)               │
├─────────────────────────────────────────────┤
│ Sub-navigation Tabs                         │
│ [Tarefas] [Calendario] [Conquistas]        │
├──────────────────────────┬──────────────────┤
│                          │                  │
│ Main Content Area        │ Gamification     │
│ (Tasks/Calendar/         │ Panel            │
│  Achievements)           │ (sticky)         │
│                          │                  │
│                          │                  │
└──────────────────────────┴──────────────────┘
```

### Spacing Guidelines
- Page padding: `space-y-6`
- Section gaps: `gap-6`
- Card internal: `p-6`
- Button groups: `gap-3`
- Form fields: `space-y-4`

---

## ✅ Completed Improvements

### 1. Navigation Integration ✅
- Added "Tarefas" to sidebar navigation
- Integrated with breadcrumb system
- Uses CheckSquare icon
- Proper aliases for route matching

### 2. Page Header Redesign ✅
- Portuguese titles
- Clean, spacious layout
- Export button + New Task button
- Dynamic header per tab

### 3. Sub-navigation Tabs ✅
- Pill-style tabs with icons
- Active state: dark bg + white text
- Inactive: light hover state
- Proper spacing (`gap-1`, `p-1.5`)

### 4. Layout Grid ✅
- Two-column layout on desktop
- Main content + gamification panel
- Sticky right panel
- Responsive (single column on mobile)

### 5. Modal Styling ✅
- Gradient headers
- Portuguese text
- Proper backdrop blur
- Clean close buttons

---

## 🔄 Remaining Translations Needed

### Components to Update
1. **TaskSidebar.tsx** - Filter labels, search placeholder
2. **TaskList.tsx** - Empty state, filter badges
3. **TaskCard.tsx** - Status labels, action buttons
4. **TaskDetail.tsx** - Form labels, buttons
5. **TaskCreateForm.tsx** - All form fields
6. **SubtaskList.tsx** - Labels, placeholders
7. **AchievementGallery.tsx** - Category names, filters
8. **TaskCalendar.tsx** - Day names, month names
9. **GamificationPanel.tsx** - All labels
10. **LevelUpModal.tsx** - Messages, titles

### Priority Order
1. TaskSidebar (filters are always visible)
2. TaskList (main view)
3. TaskCard (repeated element)
4. AchievementGallery (tab content)
5. TaskCalendar (tab content)
6. GamificationPanel (always visible)
7. TaskDetail (modal)
8. TaskCreateForm (modal)
9. SubtaskList (nested)
10. LevelUpModal (occasional)

---

## 🎯 UX Best Practices

### Visual Hierarchy
1. Page title (largest, boldest)
2. Sub-navigation (clear tabs)
3. Section headers
4. Content cards
5. Secondary actions

### Interaction Feedback
- Hover states on all interactive elements
- Active states for selected items
- Loading states for async operations
- Success/error toasts
- Confirmation dialogs for destructive actions

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)
- Screen reader text

### Performance
- Lazy load modals
- Virtualize long lists
- Debounce search
- Cache API responses
- Optimize images

---

## 📝 Implementation Checklist

### Immediate (High Priority)
- [x] Add Tasks to navigation
- [x] Create sub-navigation tabs
- [x] Translate main page header
- [x] Improve page layout
- [ ] Translate TaskSidebar
- [ ] Translate TaskList
- [ ] Translate TaskCard
- [ ] Remove all emojis

### Short Term (Medium Priority)
- [ ] Translate AchievementGallery
- [ ] Translate TaskCalendar
- [ ] Translate GamificationPanel
- [ ] Translate all modals
- [ ] Add proper loading states
- [ ] Improve empty states

### Long Term (Low Priority)
- [ ] Add keyboard shortcuts
- [ ] Improve mobile responsiveness
- [ ] Add animations
- [ ] Optimize performance
- [ ] Add tooltips
- [ ] Improve error messages

---

## 🔧 Technical Notes

### File Locations
- Navigation: `src/lib/navigation.ts`
- Layout: `src/app/(app)/layout.tsx`
- Tasks page: `src/app/(app)/tasks/page.tsx`
- Components: `src/components/tasks/`

### State Management
- Store: `src/stores/taskStore.ts`
- Types: `src/lib/taskTypes.ts`
- API: `src/lib/taskApi.ts`

### Design Tokens
- Using Tailwind CSS
- Custom colors in `tailwind.config.js`
- Spacing scale: 4px base
- Breakpoints: Tailwind defaults

---

**Status**: Guidelines documented  
**Next Step**: Systematic translation of all components  
**Approach**: One component at a time, test after each
