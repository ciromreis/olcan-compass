"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Share2, 
  FileText, 
  Image, 
  Video, 
  Code, 
  Database, 
  Calendar,
  Mail,
  Link,
  QrCode,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  CheckCircle,
  Upload,
  Settings,
  Filter,
  Search
} from 'lucide-react'
import { GlassCard, GlassButton, ProgressBar, GlassModal } from '@/components/ui'

interface ExportFormat {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  extensions: string[]
  maxSize: string
  features: string[]
}

interface ShareOption {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  url?: string
  action?: () => void
}

interface ExportHistory {
  id: string
  filename: string
  format: string
  size: string
  date: string
  downloads: number
  shared: boolean
}

const ExportPage = () => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional PDF format for resumes and documents',
      icon: <FileText className="w-6 h-6" />,
      extensions: ['.pdf'],
      maxSize: '10MB',
      features: ['ATS-optimized', 'Print-ready', 'Password protection']
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Microsoft Word format for editing',
      icon: <FileText className="w-6 h-6" />,
      extensions: ['.docx'],
      maxSize: '5MB',
      features: ['Editable', 'Track changes', 'Comments']
    },
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-quality image for social media',
      icon: <Image className="w-6 h-6" />,
      extensions: ['.png'],
      maxSize: '25MB',
      features: ['Transparent background', 'High resolution', 'Web optimized']
    },
    {
      id: 'mp4',
      name: 'MP4 Video',
      description: 'Video format for YouTube and social platforms',
      icon: <Video className="w-6 h-6" />,
      extensions: ['.mp4'],
      maxSize: '500MB',
      features: ['HD quality', 'Optimized for web', 'Mobile friendly']
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Structured data for developers',
      icon: <Code className="w-6 h-6" />,
      extensions: ['.json'],
      maxSize: '1MB',
      features: ['API-ready', 'Machine readable', 'Backup format']
    },
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      description: 'Excel-compatible spreadsheet format',
      icon: <Database className="w-6 h-6" />,
      extensions: ['.csv'],
      maxSize: '2MB',
      features: ['Excel compatible', 'Data analysis', 'Charts ready']
    }
  ]

  const shareOptions: ShareOption[] = [
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      description: 'Send via email',
      action: () => {
        const subject = 'Check out my Olcan Compass creation!'
        const body = 'I wanted to share this with you from my career journey.'
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      }
    },
    {
      id: 'link',
      name: 'Copy Link',
      icon: <Link className="w-5 h-5" />,
      description: 'Copy shareable link',
      action: () => {
        const link = `https://olcan-compass.com/share/${Date.now()}`
        navigator.clipboard.writeText(link)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: <QrCode className="w-5 h-5" />,
      description: 'Generate QR code',
      action: () => {
        // Generate QR code logic
        console.log('Generate QR code')
      }
    },
    {
      id: 'social',
      name: 'Social Media',
      icon: <Globe className="w-5 h-5" />,
      description: 'Share to social platforms',
      action: () => {
        const text = 'Check out my career companion journey!'
        const url = 'https://olcan-compass.com'
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
      }
    }
  ]

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      filename: 'my-resume-2024.pdf',
      format: 'PDF',
      size: '2.4 MB',
      date: '2024-03-20',
      downloads: 15,
      shared: true
    },
    {
      id: '2',
      filename: 'companion-screenshot.png',
      format: 'PNG',
      size: '1.8 MB',
      date: '2024-03-19',
      downloads: 8,
      shared: false
    },
    {
      id: '3',
      filename: 'interview-practice.mp4',
      format: 'MP4',
      size: '45.2 MB',
      date: '2024-03-18',
      downloads: 23,
      shared: true
    }
  ]

  const mockItems = [
    { id: '1', name: 'My Resume', type: 'document', date: '2024-03-20', size: '2.4 MB' },
    { id: '2', name: 'Companion Avatar', type: 'image', date: '2024-03-19', size: '1.8 MB' },
    { id: '3', name: 'Interview Practice', type: 'video', date: '2024-03-18', size: '45.2 MB' },
    { id: '4', name: 'Career Analytics', type: 'data', date: '2024-03-17', size: '0.5 MB' },
    { id: '5', name: 'Guild Progress', type: 'document', date: '2024-03-16', size: '1.2 MB' }
  ]

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  const handleExport = () => {
    if (!selectedFormat || selectedItems.length === 0) return

    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          setShowSuccessModal(true)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAllItems = () => {
    setSelectedItems(filteredItems.map(item => item.id))
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Export & Share
          </h1>
          <p className="text-foreground/60">
            Export your creations and share them with the world
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Item Selection */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Select Items
                  </h3>
                  <div className="flex gap-2">
                    <GlassButton onClick={selectAllItems} size="sm" variant="default">
                      Select All
                    </GlassButton>
                    <GlassButton onClick={clearSelection} size="sm" variant="default">
                      Clear
                    </GlassButton>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="document">Documents</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="data">Data</option>
                  </select>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 liquid-glass rounded-xl border cursor-pointer transition-all duration-300 ${
                        selectedItems.includes(item.id)
                          ? 'border-companion-primary/50 bg-companion-primary/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-4 h-4 rounded"
                          />
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-xs text-foreground/60">
                              {item.type} • {item.size} • {item.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 liquid-glass rounded-xl border border-white/20">
                  <div className="text-sm text-foreground/60">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Center Column - Export Options */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Export Format
                </h3>

                <div className="space-y-3">
                  {exportFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`p-4 liquid-glass rounded-xl border cursor-pointer transition-all duration-300 ${
                        selectedFormat?.id === format.id
                          ? 'border-companion-primary/50 bg-companion-primary/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedFormat(format)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{format.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{format.name}</h4>
                          <p className="text-sm text-foreground/60 mb-2">
                            {format.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-foreground/40">
                            <span>{format.extensions.join(', ')}</span>
                            <span>Max: {format.maxSize}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {format.features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-companion-primary/10 border border-companion-primary/20 rounded-full text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Export Progress */}
            {isExporting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Exporting...
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <ProgressBar value={exportProgress} max={100} />
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Export Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassButton
                onClick={handleExport}
                disabled={!selectedFormat || selectedItems.length === 0 || isExporting}
                className="w-full"
                size="lg"
                variant="primary"
              >
                <Download className="w-5 h-5" />
                Export {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
              </GlassButton>
            </motion.div>
          </div>

          {/* Right Column - Share Options */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Share Options
                </h3>

                <div className="space-y-3">
                  {shareOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={option.action}
                      className="w-full p-4 liquid-glass rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3"
                    >
                      <div className="text-xl">{option.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{option.name}</div>
                        <div className="text-sm text-foreground/60">{option.description}</div>
                      </div>
                      {option.id === 'link' && copiedLink && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Export History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Export History
                </h3>

                <div className="space-y-3">
                  {exportHistory.map((item) => (
                    <div key={item.id} className="p-3 liquid-glass rounded-xl border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{item.filename}</div>
                          <div className="text-xs text-foreground/60">
                            {item.format} • {item.size} • {item.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.shared && (
                            <Share2 className="w-4 h-4 text-companion-primary" />
                          )}
                          <GlassButton size="sm" variant="default">
                            <Download className="w-3 h-3" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Device Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Device Preview
                </h3>

                <div className="space-y-3">
                  {[
                    { icon: <Smartphone className="w-5 h-5" />, name: 'Mobile', size: '375x667' },
                    { icon: <Tablet className="w-5 h-5" />, name: 'Tablet', size: '768x1024' },
                    { icon: <Monitor className="w-5 h-5" />, name: 'Desktop', size: '1920x1080' }
                  ].map((device) => (
                    <div key={device.name} className="flex items-center gap-3 p-3 liquid-glass rounded-xl border border-white/20">
                      {device.icon}
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{device.name}</div>
                        <div className="text-xs text-foreground/60">{device.size}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <GlassModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Export Complete!"
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-semibold text-foreground">
            Export Successful!
          </h3>
          <p className="text-foreground/60">
            Your {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} have been exported as {selectedFormat?.name}
          </p>
          <div className="flex gap-3">
            <GlassButton
              onClick={() => setShowShareModal(true)}
              className="flex-1"
              variant="primary"
            >
              <Share2 className="w-4 h-4" />
              Share
            </GlassButton>
            <GlassButton
              onClick={() => setShowSuccessModal(false)}
              className="flex-1"
              variant="default"
            >
              Done
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}

export default ExportPage
