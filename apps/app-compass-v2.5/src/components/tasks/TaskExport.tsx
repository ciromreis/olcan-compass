'use client'

import { useState } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { DownloadIcon, FileTextIcon, TableIcon, FilterIcon } from 'lucide-react'
import { format } from 'date-fns'
import { taskToast } from './TaskToast'

type ExportFormat = 'csv' | 'json'
type ExportScope = 'all' | 'filtered' | 'selected'

interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  includeSubtasks: boolean
  includeStats: boolean
  dateRange: 'all' | 'month' | 'week' | 'custom'
}

export function TaskExportButton() {
  const { tasks, filters } = useTaskStore()
  const [showExportModal, setShowExportModal] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    scope: 'filtered',
    includeSubtasks: true,
    includeStats: true,
    dateRange: 'all',
  })
  const [isExporting, setIsExporting] = useState(false)

  // Filter tasks based on scope
  const getExportTasks = () => {
    let exportTasks = [...tasks]

    if (options.scope === 'filtered') {
      // Apply current filters
      if (filters.status) {
        exportTasks = exportTasks.filter((t) => t.status === filters.status)
      }
      if (filters.priority) {
        exportTasks = exportTasks.filter((t) => t.priority === filters.priority)
      }
      if (filters.category) {
        exportTasks = exportTasks.filter((t) => t.category === filters.category)
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        exportTasks = exportTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(searchLower) ||
            t.description?.toLowerCase().includes(searchLower)
        )
      }
    }

    // Apply date range filter
    if (options.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      if (options.dateRange === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (options.dateRange === 'month') {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        return exportTasks // custom would need date pickers
      }

      exportTasks = exportTasks.filter((t) => {
        if (!t.due_date) return false
        return new Date(t.due_date) >= startDate
      })
    }

    return exportTasks
  }

  // Export to CSV
  const exportToCSV = async () => {
    setIsExporting(true)

    try {
      const exportTasks = getExportTasks()

      if (exportTasks.length === 0) {
        taskToast.error('Nenhuma tarefa para exportar', 'Ajuste os filtros ou escopo')
        setIsExporting(false)
        return
      }

      // Build CSV content
      const headers = [
        'ID',
        'Titulo',
        'Descricao',
        'Status',
        'Prioridade',
        'Categoria',
        'XP',
        'Tempo Estimado',
        'Prazo',
        'Criado em',
        'Concluido em',
        'Subtarefas',
      ]

      const rows = exportTasks.map((task) => [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.status,
        task.priority,
        task.category,
        task.xp_reward,
        task.estimated_hours || 0,
        task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
        format(new Date(task.created_at), 'yyyy-MM-dd HH:mm'),
        task.completed_at ? format(new Date(task.completed_at), 'yyyy-MM-dd HH:mm') : '',
        options.includeSubtasks ? (task.subtask_count || 0) : 0,
      ])

      // Add statistics row
      if (options.includeStats) {
        rows.push([])
        rows.push(['STATISTICS'])
        rows.push(['Total Tasks', exportTasks.length])
        rows.push([
          'Completed',
          exportTasks.filter((t) => t.status === 'COMPLETED').length,
        ])
        rows.push([
          'In Progress',
          exportTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        ])
        rows.push(['Pending', exportTasks.filter((t) => t.status === 'PENDING').length])
        rows.push([
          'Total XP',
          exportTasks.reduce((sum, t) => sum + t.xp_reward, 0),
        ])
        rows.push([
          'Total Hours',
          exportTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        ])
      }

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `olcan-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      taskToast.success(
        `${exportTasks.length} tarefas exportadas!`,
        `Arquivo CSV baixado (${(blob.size / 1024).toFixed(1)} KB)`
      )
    } catch (error) {
      taskToast.error('Falha na exportacao', 'Tente novamente')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  // Export to JSON
  const exportToJSON = async () => {
    setIsExporting(true)

    try {
      const exportTasks = getExportTasks()

      if (exportTasks.length === 0) {
        taskToast.error('Nenhuma tarefa para exportar', 'Ajuste os filtros ou escopo')
        setIsExporting(false)
        return
      }

      // Build JSON data
      const exportData: Record<string, unknown> = {
        export_date: new Date().toISOString(),
        total_tasks: exportTasks.length,
        tasks: exportTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          category: task.category,
          xp_reward: task.xp_reward,
          estimated_hours: task.estimated_hours,
          due_date: task.due_date,
          created_at: task.created_at,
          completed_at: task.completed_at,
          subtask_count: options.includeSubtasks ? task.subtask_count : undefined,
        })),
      }

      if (options.includeStats) {
        exportData.statistics = {
          total: exportTasks.length,
          completed: exportTasks.filter((t) => t.status === 'COMPLETED').length,
          in_progress: exportTasks.filter((t) => t.status === 'IN_PROGRESS').length,
          pending: exportTasks.filter((t) => t.status === 'PENDING').length,
          total_xp: exportTasks.reduce((sum, t) => sum + t.xp_reward, 0),
          total_hours: exportTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        }
      }

      const jsonContent = JSON.stringify(exportData, null, 2)

      // Download file
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `olcan-tasks-${format(new Date(), 'yyyy-MM-dd')}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      taskToast.success(
        `${exportTasks.length} tarefas exportadas!`,
        `Arquivo JSON baixado (${(blob.size / 1024).toFixed(1)} KB)`
      )
    } catch (error) {
      taskToast.error('Falha na exportacao', 'Tente novamente')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    if (options.format === 'csv') {
      await exportToCSV()
    } else {
      await exportToJSON()
    }
  }

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setShowExportModal(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm"
      >
        <DownloadIcon className="w-4 h-4" />
        Exportar
      </button>

      {/* Export Modal */}
      {showExportModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowExportModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Exportar tarefas</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Baixe suas tarefas em diferentes formatos
                    </p>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="p-6 space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Formato
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOptions({ ...options, format: 'csv' })}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        options.format === 'csv'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <TableIcon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">CSV</div>
                        <div className="text-xs text-slate-500">Planilha</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setOptions({ ...options, format: 'json' })}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        options.format === 'json'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileTextIcon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">JSON</div>
                        <div className="text-xs text-slate-500">Dados</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Scope Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Escopo
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'Todas as tarefas', desc: 'Exportar todas' },
                      { value: 'filtered', label: 'Tarefas filtradas', desc: 'Usar filtros atuais' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setOptions({ ...options, scope: option.value as ExportScope })}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          options.scope === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FilterIcon className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">{option.label}</div>
                          <div className="text-xs text-gray-600">{option.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Periodo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'Todo periodo' },
                      { value: 'month', label: 'Ultimos 30 dias' },
                      { value: 'week', label: 'Ultimos 7 dias' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setOptions({ ...options, dateRange: option.value as 'all' | 'month' | 'week' | 'custom' })
                        }
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          options.dateRange === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeSubtasks}
                      onChange={(e) =>
                        setOptions({ ...options, includeSubtasks: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Incluir subtarefas</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeStats}
                      onChange={(e) =>
                        setOptions({ ...options, includeStats: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Incluir estatisticas</span>
                  </label>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-500 mb-1">Previa:</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {getExportTasks().length} {getExportTasks().length === 1 ? 'tarefa' : 'tarefas'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || getExportTasks().length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="w-4 h-4" />
                      Exportar {options.format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
