"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  Circle, 
  Download, 
  Upload, 
  Mic, 
  MicOff,
  Video,
  Settings,
  Share2,
  Eye,
  Clock,
  FileText,
  Zap,
  Target,
  BarChart3,
  Camera,
  Monitor,
  Smartphone
} from 'lucide-react'
import { GlassCard, GlassButton, ProgressBar, GlassModal } from '@/components/ui'

interface RecordingSession {
  id: string
  title: string
  duration: number
  isRecording: boolean
  isPaused: boolean
  startTime: Date | null
  audioLevel: number
  videoSource: 'screen' | 'camera' | 'both'
  quality: 'low' | 'medium' | 'high' | '4k'
}

interface VideoTemplate {
  id: string
  name: string
  description: string
  duration: string
  scenes: string[]
  thumbnail: string
  category: 'tutorial' | 'review' | 'showcase' | 'interview'
}

const YouTubeStudio = () => {
  const [recordingSession, setRecordingSession] = useState<RecordingSession>({
    id: 'session-1',
    title: 'My YouTube Video',
    duration: 0,
    isRecording: false,
    isPaused: false,
    startTime: null,
    audioLevel: 0,
    videoSource: 'screen',
    quality: 'high'
  })
  
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [recordedVideos, setRecordedVideos] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const videoTemplates: VideoTemplate[] = [
    {
      id: 'companion-intro',
      name: 'Companion Introduction',
      description: 'Introduce your career companion to your audience',
      duration: '5-10 min',
      scenes: ['Intro', 'Companion Reveal', 'Abilities', 'Evolution', 'Outro'],
      thumbnail: '🐉',
      category: 'showcase'
    },
    {
      id: 'resume-tutorial',
      name: 'Resume Building Tutorial',
      description: 'Show how to build ATS-optimized resumes',
      duration: '10-15 min',
      scenes: ['Problem', 'Solution', 'Demo', 'Results', 'Tips'],
      thumbnail: '📝',
      category: 'tutorial'
    },
    {
      id: 'interview-practice',
      name: 'Interview Practice Session',
      description: 'Practice interview techniques with AI feedback',
      duration: '15-20 min',
      scenes: ['Setup', 'Questions', 'Feedback', 'Improvement', 'Summary'],
      thumbnail: '🎤',
      category: 'tutorial'
    },
    {
      id: 'career-journey',
      name: 'Career Journey Story',
      description: 'Share your career transformation story',
      duration: '8-12 min',
      scenes: ['Beginning', 'Challenges', 'Discovery', 'Growth', 'Future'],
      thumbnail: '🚀',
      category: 'interview'
    },
    {
      id: 'feature-review',
      name: 'Platform Feature Review',
      description: 'Review and demonstrate platform features',
      duration: '12-18 min',
      scenes: ['Overview', 'Features', 'Benefits', 'Use Cases', 'Conclusion'],
      thumbnail: '⭐',
      category: 'review'
    },
    {
      id: 'companion-battle',
      name: 'Companion Battle Showcase',
      description: 'Showcase companion battles and competitions',
      duration: '6-10 min',
      scenes: ['Intro', 'Battle Setup', 'Action', 'Results', 'Analysis'],
      thumbnail: '⚔️',
      category: 'showcase'
    }
  ]

  const startRecording = async () => {
    try {
      let stream: MediaStream
      
      if (recordingSession.videoSource === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        })
      } else if (recordingSession.videoSource === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        })
      } else {
        // Both screen and camera
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        // Combine streams
        stream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...cameraStream.getAudioTracks()
        ])
      }
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })
      
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const videoUrl = URL.createObjectURL(blob)
        
        const newVideo = {
          id: Date.now().toString(),
          title: recordingSession.title,
          url: videoUrl,
          duration: recordingSession.duration,
          timestamp: new Date(),
          size: blob.size,
          template: selectedTemplate
        }
        
        setRecordedVideos(prev => [...prev, newVideo])
        setRecordingSession(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          duration: 0,
          startTime: null
        }))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(1000) // Collect data every second
      
      setRecordingSession(prev => ({
        ...prev,
        isRecording: true,
        startTime: new Date()
      }))
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingSession(prev => ({
          ...prev,
          duration: prev.duration + 1
        }))
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to start recording. Please check your permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingSession.isRecording) {
      if (recordingSession.isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingSession(prev => ({
            ...prev,
            duration: prev.duration + 1
          }))
        }, 1000)
        
        setRecordingSession(prev => ({
          ...prev,
          isPaused: false
        }))
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        setRecordingSession(prev => ({
          ...prev,
          isPaused: true
        }))
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingSession.isRecording) {
      mediaRecorderRef.current.stop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const downloadVideo = (video: any) => {
    const a = document.createElement('a')
    a.href = video.url
    a.download = `${video.title}.webm`
    a.click()
  }

  const shareVideo = (video: any) => {
    const shareText = `Check out my YouTube video: ${video.title}`
    
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Video link copied to clipboard!')
    }
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
            YouTube Studio
          </h1>
          <p className="text-foreground/60">
            Create professional YouTube videos with your companion
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Templates */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Video Templates
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {videoTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 liquid-glass rounded-xl border cursor-pointer transition-all duration-300 ${
                        selectedTemplate?.id === template.id
                          ? 'border-companion-primary/50 bg-companion-primary/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{template.thumbnail}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <p className="text-sm text-foreground/60 mb-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-foreground/40">
                            <Clock className="w-3 h-3" />
                            <span>{template.duration}</span>
                            <span>•</span>
                            <span className="capitalize">{template.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Recording Settings
                  </h3>
                  <GlassButton
                    onClick={() => setShowSettings(!showSettings)}
                    variant="default"
                    size="sm"
                  >
                    <Settings className="w-4 h-4" />
                  </GlassButton>
                </div>
                
                {showSettings && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Video Title
                      </label>
                      <input
                        type="text"
                        value={recordingSession.title}
                        onChange={(e) => setRecordingSession(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        className="w-full px-3 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                        placeholder="Enter video title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Video Source
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'screen', label: 'Screen', icon: Monitor },
                          { value: 'camera', label: 'Camera', icon: Camera },
                          { value: 'both', label: 'Both', icon: Smartphone }
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setRecordingSession(prev => ({
                              ...prev,
                              videoSource: value as any
                            }))}
                            className={`p-2 liquid-glass rounded-xl border transition-all duration-300 ${
                              recordingSession.videoSource === value
                                ? 'border-companion-primary/50 bg-companion-primary/10'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            <span className="text-xs">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Quality
                      </label>
                      <select
                        value={recordingSession.quality}
                        onChange={(e) => setRecordingSession(prev => ({
                          ...prev,
                          quality: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                      >
                        <option value="low">Low (480p)</option>
                        <option value="medium">Medium (720p)</option>
                        <option value="high">High (1080p)</option>
                        <option value="4k">4K (2160p)</option>
                      </select>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* Center Column - Recording Interface */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Recording Studio
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-companion-primary">
                    <Clock className="w-5 h-5" />
                    {formatTime(recordingSession.duration)}
                  </div>
                </div>

                {/* Recording Preview */}
                <div className="mb-6">
                  <div className="aspect-video liquid-glass rounded-xl border border-white/20 flex items-center justify-center">
                    {recordingSession.isRecording ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <div className="w-6 h-6 bg-white rounded-full" />
                        </div>
                        <p className="text-foreground font-medium">
                          {recordingSession.isPaused ? 'Recording Paused' : 'Recording...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Video className="w-16 h-16 text-foreground/40 mb-4 mx-auto" />
                        <p className="text-foreground/60">
                          {selectedTemplate ? 'Ready to record' : 'Select a template to begin'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!recordingSession.isRecording ? (
                    <GlassButton
                      onClick={startRecording}
                      disabled={!selectedTemplate}
                      className="w-20 h-20 rounded-full bg-red-500"
                      variant="primary"
                    >
                      <Circle className="w-8 h-8" />
                    </GlassButton>
                  ) : (
                    <>
                      <GlassButton
                        onClick={pauseRecording}
                        className="w-16 h-16 rounded-full"
                        variant="default"
                      >
                        {recordingSession.isPaused ? (
                          <Play className="w-6 h-6" />
                        ) : (
                          <Pause className="w-6 h-6" />
                        )}
                      </GlassButton>
                      
                      <GlassButton
                        onClick={stopRecording}
                        className="w-16 h-16 rounded-full bg-red-500"
                        variant="primary"
                      >
                        <Square className="w-6 h-6" />
                      </GlassButton>
                    </>
                  )}
                </div>

                {/* Audio Level Indicator */}
                {recordingSession.isRecording && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Mic className="w-4 h-4 text-foreground/60" />
                    <div className="flex gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-companion-primary rounded-full"
                          style={{
                            height: `${Math.random() * 20 + 5}px`,
                            opacity: Math.random() * 0.5 + 0.5
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Template Guide */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Template Guide: {selectedTemplate.name}
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedTemplate.scenes.map((scene, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-companion-primary/20 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-foreground">{scene}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Right Column - Recorded Videos */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Recorded Videos
                </h3>
                
                {recordedVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-foreground/40 mx-auto mb-4" />
                    <p className="text-foreground/60">No videos recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recordedVideos.map((video) => (
                      <div key={video.id} className="p-4 liquid-glass rounded-xl border border-white/20">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{video.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-foreground/60">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(video.duration)}</span>
                              <span>•</span>
                              <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <GlassButton
                              onClick={() => setShowPreview(true)}
                              size="sm"
                              variant="default"
                            >
                              <Eye className="w-3 h-3" />
                            </GlassButton>
                            <GlassButton
                              onClick={() => downloadVideo(video)}
                              size="sm"
                              variant="default"
                            >
                              <Download className="w-3 h-3" />
                            </GlassButton>
                            <GlassButton
                              onClick={() => shareVideo(video)}
                              size="sm"
                              variant="default"
                            >
                              <Share2 className="w-3 h-3" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* YouTube Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  YouTube Tips
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-companion-primary mt-0.5" />
                    <span className="text-sm text-foreground/80">
                      Keep videos under 20 minutes for better engagement
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-companion-accent mt-0.5" />
                    <span className="text-sm text-foreground/80">
                      Use your companion as a co-host for unique content
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-foreground/80">
                      Include analytics and progress tracking in tutorials
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span className="text-sm text-foreground/80">
                      Create series content around companion evolution
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <GlassModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Video Preview"
        size="lg"
      >
        <div className="aspect-video liquid-glass rounded-xl border border-white/20 flex items-center justify-center">
          <Video className="w-16 h-16 text-foreground/40" />
          <p className="text-foreground/60">Video preview would appear here</p>
        </div>
      </GlassModal>
    </div>
  )
}

export default YouTubeStudio
