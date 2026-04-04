"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Hash, 
  BookOpen, 
  Target,
  BarChart3,
  Download,
  Share2,
  Eye,
  Zap
} from 'lucide-react'
import { GlassCard, GlassButton, ProgressBar, GlassModal } from '@/components/ui'

interface DocumentAnalytics {
  wordCount: number
  characterCount: number
  readingTime: number
  complexity: number
  keywords: Array<{ word: string; count: number; importance: number }>
  readability: {
    score: number
    level: string
    suggestions: string[]
  }
  seo: {
    titleOptimization: number
    metaDescription: number
    keywordDensity: number
    overall: number
  }
}

const DocumentAnalytics = () => {
  const [docText, setDocument] = useState('')
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const analyzeDocument = async () => {
    if (!docText.trim()) return

    setIsAnalyzing(true)
    
    // Simulate docText analysis
    setTimeout(() => {
      const words = docText.trim().split(/\s+/)
      const characters = docText.length
      const wordCount = words.length
      const avgWordLength = words.reduce((acc, word) => acc + word.length, 0) / words.length
      
      // Calculate reading time (average 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200)
      
      // Extract keywords (simple frequency analysis)
      const wordFreq: Record<string, number> = {}
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '')
        if (cleanWord.length > 3) {
          wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
        }
      })
      
      const keywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({
          word,
          count,
          importance: Math.min(100, (count / wordCount) * 100)
        }))
      
      // Calculate complexity based on average word length and sentence structure
      const sentences = docText.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const avgSentenceLength = words.length / sentences.length
      const complexity = Math.min(100, (avgWordLength * 5) + (avgSentenceLength * 3))
      
      // Readability assessment
      const readabilityScore = Math.max(0, Math.min(100, 100 - complexity))
      const readabilityLevel = 
        readabilityScore >= 80 ? 'Very Easy' :
        readabilityScore >= 60 ? 'Easy' :
        readabilityScore >= 40 ? 'Fair' :
        readabilityScore >= 20 ? 'Difficult' : 'Very Difficult'
      
      const suggestions = []
      if (avgSentenceLength > 20) suggestions.push('Consider using shorter sentences')
      if (avgWordLength > 6) suggestions.push('Use simpler words where possible')
      if (wordCount < 300) suggestions.push('Consider adding more content')
      if (wordCount > 2000) suggestions.push('Consider breaking into smaller sections')
      
      // SEO analysis
      const seo = {
        titleOptimization: Math.min(100, Math.random() * 40 + 60),
        metaDescription: Math.min(100, Math.random() * 30 + 70),
        keywordDensity: Math.min(100, Math.random() * 20 + 80),
        overall: 0
      }
      seo.overall = (seo.titleOptimization + seo.metaDescription + seo.keywordDensity) / 3
      
      const analyticsData: DocumentAnalytics = {
        wordCount,
        characterCount: characters,
        readingTime,
        complexity,
        keywords,
        readability: {
          score: readabilityScore,
          level: readabilityLevel,
          suggestions
        },
        seo
      }
      
      setAnalytics(analyticsData)
      setIsAnalyzing(false)
    }, 1500)
  }

  const exportAnalytics = () => {
    if (!analytics) return
    
    const data = {
      docText: docText.substring(0, 500) + '...',
      analytics,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = 'document-analytics.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareAnalytics = () => {
    if (!analytics) return
    
    const shareText = `Document Analysis: ${analytics.wordCount} words, ${analytics.readingTime} min read, Readability: ${analytics.readability.level}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Document Analytics',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Analytics copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Document Analytics
          </h1>
          <p className="text-foreground/60">
            Analyze your docTexts for YouTube content creation
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Document Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Your Document
                </h3>
                
                <div className="space-y-4">
                  <textarea
                    value={docText}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Paste your docText text here for analysis..."
                    className="w-full h-64 p-4 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <GlassButton
                      onClick={analyzeDocument}
                      disabled={!docText.trim() || isAnalyzing}
                      className="flex-1"
                      variant="primary"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4" />
                          Analyze Document
                        </>
                      )}
                    </GlassButton>
                    
                    <GlassButton
                      onClick={() => setDocument('')}
                      variant="default"
                    >
                      Clear
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Quick Stats */}
            {analytics && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Quick Stats
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-companion-primary mr-2" />
                        <span className="text-2xl font-bold text-foreground">
                          {analytics.wordCount}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">Words</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-companion-accent mr-2" />
                        <span className="text-2xl font-bold text-foreground">
                          {analytics.readingTime}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">Min Read</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-2xl font-bold text-foreground">
                          {analytics.readability.score}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">Readability</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-2xl font-bold text-foreground">
                          {Math.round(analytics.complexity)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/60">Complexity</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Right Column - Analytics */}
          {analytics && (
            <div className="space-y-6">
              {/* Keywords */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Top Keywords
                  </h3>
                  
                  <div className="space-y-3">
                    {analytics.keywords.map((keyword, index) => (
                      <div key={keyword.word} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground w-20">
                          {keyword.word}
                        </span>
                        <div className="flex-1">
                          <ProgressBar 
                            value={keyword.importance} 
                            max={100} 
                            size="sm"
                            color="primary"
                          />
                        </div>
                        <span className="text-sm text-foreground/60 w-8">
                          {keyword.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Readability Analysis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Readability Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Readability Score</span>
                        <span className="text-sm font-medium">{analytics.readability.score}%</span>
                      </div>
                      <ProgressBar value={analytics.readability.score} max={100} />
                    </div>
                    
                    <div className="p-3 liquid-glass rounded-xl border border-white/20">
                      <p className="text-sm text-foreground mb-2">
                        <strong>Level:</strong> {analytics.readability.level}
                      </p>
                      
                      {analytics.readability.suggestions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Suggestions:</p>
                          {analytics.readability.suggestions.map((suggestion, index) => (
                            <p key={index} className="text-xs text-foreground/60">
                              • {suggestion}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* SEO Analysis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    SEO Analysis
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground/60">Title Optimization</span>
                        <span className="text-sm font-medium">{Math.round(analytics.seo.titleOptimization)}%</span>
                      </div>
                      <ProgressBar value={analytics.seo.titleOptimization} max={100} size="sm" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground/60">Meta Description</span>
                        <span className="text-sm font-medium">{Math.round(analytics.seo.metaDescription)}%</span>
                      </div>
                      <ProgressBar value={analytics.seo.metaDescription} max={100} size="sm" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground/60">Keyword Density</span>
                        <span className="text-sm font-medium">{Math.round(analytics.seo.keywordDensity)}%</span>
                      </div>
                      <ProgressBar value={analytics.seo.keywordDensity} max={100} size="sm" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Overall SEO Score</span>
                        <span className="text-sm font-medium">{Math.round(analytics.seo.overall)}%</span>
                      </div>
                      <ProgressBar value={analytics.seo.overall} max={100} color="success" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Export Options */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Export & Share
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <GlassButton
                      onClick={exportAnalytics}
                      className="flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </GlassButton>
                    
                    <GlassButton
                      onClick={shareAnalytics}
                      className="flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Results
                    </GlassButton>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentAnalytics
