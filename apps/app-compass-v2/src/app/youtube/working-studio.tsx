"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Circle, 
  Square, 
  Play, 
  Pause,
  Settings,
  Upload,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share,
  Clock,
  FileText,
  Link,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react'
// Temporary placeholder components
const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 ${className}`}>
    {children}
  </div>
)

const GlassButton: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, variant = 'primary', size = 'md', className = '', onClick, disabled = false }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200"
  const variantClasses = {
    primary: "bg-companion-primary text-white hover:bg-companion-primary/80",
    outline: "border border-white/20 hover:bg-white/10",
    destructive: "bg-red-500 text-white hover:bg-red-600"
  }
  const sizeClasses = {
    sm: "text-sm px-3 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = '' }) => (
  <div className={`w-full bg-white/20 rounded-full h-2 ${className}`}>
    <div 
      className="bg-companion-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
)
import { 
  useYouTubeStore, 
  getVideoTypeInfo, 
  getVideoStatusInfo, 
  formatDuration, 
  formatFileSize, 
  formatNumber,
  getEngagementRate,
  getRecordingQualityInfo,
  getAudioQualityInfo
} from '@/stores/youtubeStore'

export default function WorkingYouTubeStudio() {
  const {
    videos,
    currentVideo,
    recordingSession,
    isRecording,
    youtubeIntegration,
    stats,
    isLoading,
    error,
    fetchVideos,
    fetchVideoDetails,
    startRecordingSession,
    stopRecordingSession,
    createVideoScript,
    uploadVideoToYouTube,
    connectYouTubeAccount,
    fetchYouTubeStatus,
    fetchYouTubeStats,
    clearError,
    updateRecordingSettings,
    startRecording,
    stopRecording
  } = useYouTubeStore()

  const [showRecordingSetup, setShowRecordingSetup] = useState(false)
  const [showVideoDetails, setShowVideoDetails] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)
  const [showScriptEditor, setShowScriptEditor] = useState(false)
  const [showYouTubeConnect, setShowYouTubeConnect] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  
  const [recordingSettings, setRecordingSettings] = useState({
    title: '',
    videoType: 'interview',
    teleprompterEnabled: false,
    teleprompterSpeed: 150,
    backgroundType: 'blur',
    cameraPosition: 'center',
    audioQuality: 'high',
    videoQuality: '1080p'
  })
  
  const [scriptContent, setScriptContent] = useState('')
  const [uploadSettings, setUploadSettings] = useState({
    title: '',
    description: '',
    privacy: 'private'
  })
  
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchVideos()
    fetchYouTubeStatus()
    fetchYouTubeStats()
  }, [fetchVideos, fetchYouTubeStatus, fetchYouTubeStats])

  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  const handleStartRecording = async () => {
    try {
      const response = await startRecordingSession(recordingSettings)
      setRecordingTime(0)
      setIsPaused(false)
      
      // Start actual recording
      await startActualRecording()
      
      setShowRecordingSetup(false)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled,
        audio: micEnabled
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.start()
      startRecording()
    } catch (error) {
      console.error('Failed to access media devices:', error)
    }
  }

  const handleStopRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      
      if (recordingSession) {
        await stopRecordingSession(recordingSession.id)
      }
      
      stopRecording()
      setRecordingTime(0)
      setIsPaused(false)
      
      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    }
  }

  const handleCreateScript = async () => {
    if (!selectedVideoId || !scriptContent.trim()) return
    
    await createVideoScript(selectedVideoId, {
      script_content: scriptContent,
      script_type: 'teleprompter'
    })
    
    setShowScriptEditor(false)
    setScriptContent('')
  }

  const handleUploadToYouTube = async () => {
    if (!selectedVideoId) return
    
    await uploadVideoToYouTube(selectedVideoId, uploadSettings)
    setShowUploadDialog(false)
  }

  const handleConnectYouTube = async (authData: any) => {
    await connectYouTubeAccount(authData)
    setShowYouTubeConnect(false)
  }

  const handleVideoClick = (video: any) => {
    setSelectedVideoId(video.id)
    setShowVideoDetails(true)
    fetchVideoDetails(video.id)
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-foreground">Loading YouTube Studio...</p>
          </div>
        </GlassCard>
      </div>
    )
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
            YouTube Studio
          </h1>
          <p className="text-foreground/60">
            Record, edit, and upload your videos
          </p>
        </motion.div>

        {/* YouTube Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${youtubeIntegration?.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    YouTube {youtubeIntegration?.connected ? 'Connected' : 'Not Connected'}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {youtubeIntegration?.connected 
                      ? `Channel: ${youtubeIntegration.channelName}` 
                      : 'Connect your YouTube account to upload videos'}
                  </p>
                </div>
              </div>
              <GlassButton
                onClick={() => setShowYouTubeConnect(true)}
                variant={youtubeIntegration?.connected ? 'outline' : 'primary'}
                size="sm"
              >
                {youtubeIntegration?.connected ? 'Manage' : 'Connect'}
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recording Interface */}
        {isRecording && recordingSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Video Preview */}
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg bg-black"
                      style={{ minHeight: '300px' }}
                    />
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                        <Circle className="w-3 h-3 fill-current" />
                        <span className="text-sm font-medium">
                          {formatDuration(recordingTime)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Recording Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <GlassButton
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                      variant={cameraEnabled ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </GlassButton>
                    
                    <GlassButton
                      onClick={() => setMicEnabled(!micEnabled)}
                      variant={micEnabled ? 'primary' : 'outline'}
                      size="sm"
                    >
                      {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </GlassButton>
                    
                    {isPaused ? (
                      <GlassButton
                        onClick={handleResumeRecording}
                        variant="primary"
                        size="sm"
                      >
                        <Play className="w-4 h-4" />
                      </GlassButton>
                    ) : (
                      <GlassButton
                        onClick={handlePauseRecording}
                        variant="outline"
                        size="sm"
                      >
                        <Pause className="w-4 h-4" />
                      </GlassButton>
                    )}
                    
                    <GlassButton
                      onClick={handleStopRecording}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="w-4 h-4" />
                    </GlassButton>
                  </div>
                </div>
                
                {/* Recording Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Recording Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Title</span>
                      <span className="font-medium">{recordingSession.title}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Type</span>
                      <span className="font-medium">{getVideoTypeInfo(recordingSession.sessionType as any).name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Duration</span>
                      <span className="font-medium">{formatDuration(recordingTime)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Video Quality</span>
                      <span className="font-medium">{getRecordingQualityInfo(recordingSession.videoQuality).name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Audio Quality</span>
                      <span className="font-medium">{getAudioQualityInfo(recordingSession.audioQuality).name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Start Recording Button */}
            {!isRecording && (
              <GlassCard className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Start Recording
                  </h3>
                  <p className="text-foreground/60 mb-6">
                    Record interviews, presentations, tutorials, and more
                  </p>
                  <GlassButton
                    onClick={() => setShowRecordingSetup(true)}
                    variant="primary"
                    size="lg"
                  >
                    <Circle className="w-5 h-5 mr-2" />
                    Start Recording Session
                  </GlassButton>
                </div>
              </GlassCard>
            )}

            {/* Videos List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Your Videos
                </h3>
                <span className="text-sm text-foreground/60">
                  {videos.length} videos
                </span>
              </div>
              
              <div className="space-y-4">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-foreground/60">
                            <span>{getVideoTypeInfo(video.videoType).name}</span>
                            <span>{formatDuration(video.durationSeconds)}</span>
                            <span>{getVideoStatusInfo(video.status).name}</span>
                          </div>
                          
                          {video.youtubeUrl && (
                            <div className="flex items-center gap-4 text-sm text-foreground/60 mt-2">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatNumber(video.viewCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {formatNumber(video.likeCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {formatNumber(video.commentCount)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <GlassButton
                            onClick={() => handleVideoClick(video)}
                            variant="outline"
                            size="sm"
                          >
                            View Details
                          </GlassButton>
                          
                          {video.status === 'processed' && youtubeIntegration?.connected && (
                            <GlassButton
                              onClick={() => {
                                setSelectedVideoId(video.id)
                                setUploadSettings({
                                  title: video.title,
                                  description: video.description || '',
                                  privacy: 'private'
                                })
                                setShowUploadDialog(true)
                              }}
                              variant="primary"
                              size="sm"
                            >
                              <Upload className="w-4 h-4" />
                            </GlassButton>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Studio Stats
              </h3>
              
              {stats && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Total Videos</span>
                    <span className="font-medium">{stats.total_videos}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Total Views</span>
                    <span className="font-medium">{formatNumber(stats.total_views)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Total Likes</span>
                    <span className="font-medium">{formatNumber(stats.total_likes)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Total Duration</span>
                    <span className="font-medium">{formatDuration(stats.total_duration_seconds)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Engagement Rate</span>
                    <span className="font-medium">
                      {getEngagementRate(stats.total_likes, stats.total_views)}%
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
            
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <GlassButton
                  onClick={() => setShowRecordingSetup(true)}
                  variant="primary"
                  className="w-full"
                  disabled={isRecording}
                >
                  <Circle className="w-4 h-4 mr-2" />
                  New Recording
                </GlassButton>
                
                <GlassButton
                  onClick={() => setShowScriptEditor(true)}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Script
                </GlassButton>
                
                {youtubeIntegration?.connected && (
                  <GlassButton
                    onClick={() => window.open('https://studio.youtube.com', '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    YouTube Studio
                  </GlassButton>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Recording Setup Modal */}
      {showRecordingSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-foreground mb-6">Recording Setup</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={recordingSettings.title}
                  onChange={(e) => setRecordingSettings({...recordingSettings, title: e.target.value})}
                  placeholder="Enter video title"
                  className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Video Type
                </label>
                <select
                  value={recordingSettings.videoType}
                  onChange={(e) => setRecordingSettings({...recordingSettings, videoType: e.target.value})}
                  className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                >
                  <option value="interview">Interview Practice</option>
                  <option value="presentation">Presentation</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="vlog">Vlog</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Video Quality
                  </label>
                  <select
                    value={recordingSettings.videoQuality}
                    onChange={(e) => setRecordingSettings({...recordingSettings, videoQuality: e.target.value})}
                    className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  >
                    <option value="720p">HD 720p</option>
                    <option value="1080p">Full HD 1080p</option>
                    <option value="4k">4K Ultra HD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Audio Quality
                  </label>
                  <select
                    value={recordingSettings.audioQuality}
                    onChange={(e) => setRecordingSettings({...recordingSettings, audioQuality: e.target.value})}
                    className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  >
                    <option value="low">Standard</option>
                    <option value="medium">High</option>
                    <option value="high">Premium</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={recordingSettings.teleprompterEnabled}
                    onChange={(e) => setRecordingSettings({...recordingSettings, teleprompterEnabled: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-foreground">Enable Teleprompter</span>
                </label>
              </div>
              
              {recordingSettings.teleprompterEnabled && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Teleprompter Speed (WPM)
                  </label>
                  <input
                    type="number"
                    value={recordingSettings.teleprompterSpeed}
                    onChange={(e) => setRecordingSettings({...recordingSettings, teleprompterSpeed: parseInt(e.target.value)})}
                    min="50"
                    max="300"
                    className="w-full px-4 py-2 liquid-glass rounded-xl border border-white/20 focus:border-companion-primary/50 focus:outline-none"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <GlassButton
                  onClick={() => setShowRecordingSetup(false)}
                  className="flex-1"
                  variant="outline"
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  onClick={handleStartRecording}
                  className="flex-1"
                  variant="primary"
                  disabled={!recordingSettings.title.trim()}
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Start Recording
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Video Details Modal */}
      {showVideoDetails && currentVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Video Details</h3>
              <GlassButton
                onClick={() => setShowVideoDetails(false)}
                variant="outline"
                size="sm"
              >
                Close
              </GlassButton>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-16 h-16 text-white" />
                </div>
                
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {currentVideo.title}
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/60">Type</span>
                    <span>{getVideoTypeInfo(currentVideo.videoType).name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/60">Duration</span>
                    <span>{formatDuration(currentVideo.durationSeconds)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/60">Status</span>
                    <span>{getVideoStatusInfo(currentVideo.status).name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/60">File Size</span>
                    <span>{currentVideo.fileSize ? formatFileSize(currentVideo.fileSize) : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/60">Recorded</span>
                    <span>{new Date(currentVideo.recordingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-foreground mb-3">Analytics</h5>
                
                {currentVideo.youtubeUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Views</span>
                      <span className="font-medium">{formatNumber(currentVideo.viewCount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Likes</span>
                      <span className="font-medium">{formatNumber(currentVideo.likeCount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Comments</span>
                      <span className="font-medium">{formatNumber(currentVideo.commentCount)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">Engagement</span>
                      <span className="font-medium">
                        {getEngagementRate(currentVideo.likeCount, currentVideo.viewCount)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-foreground/60 py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Upload to YouTube to see analytics</p>
                  </div>
                )}
                
                <div className="mt-6 space-y-3">
                  {currentVideo.status === 'processed' && youtubeIntegration?.connected && (
                    <GlassButton
                      onClick={() => {
                        setUploadSettings({
                          title: currentVideo.title,
                          description: currentVideo.description || '',
                          privacy: 'private'
                        })
                        setShowUploadDialog(true)
                      }}
                      variant="primary"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload to YouTube
                    </GlassButton>
                  )}
                  
                  <GlassButton
                    onClick={() => {
                      setSelectedVideoId(currentVideo.id)
                      setShowScriptEditor(true)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Add Script
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
