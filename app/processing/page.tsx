'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ProcessingState {
  startTime: number
  progress: number
  isStopped: boolean
}

interface UploadState {
  pathname: string
  filename: string
  uploadedAt: string
}

const PROCESSING_MESSAGES = [
  'Connecting to TUTRLY database...',
  'Reading your Excel file from secure storage...',
  'Validating student data...',
  'Creating new student records...',
  'Processing enrollment information...',
  'Optimizing database entries...',
  'Finalizing student records...',
  'Generating confirmation reports...',
]

const TOTAL_DURATION = 60 * 60 * 1000 // 60 minutes in milliseconds

export default function ProcessingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(PROCESSING_MESSAGES[0])
  const [elapsedTime, setElapsedTime] = useState('0m 0s')
  const [remainingTime, setRemainingTime] = useState('60m 0s')
  const [isProcessing, setIsProcessing] = useState(true)
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState | null>(null)

  // Format time display
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  // Initialize or restore processing state
  useEffect(() => {
    const storedUploadState = localStorage.getItem('uploadState')
    if (storedUploadState) {
      setUploadState(JSON.parse(storedUploadState))
    }

    const storedProcessingState = localStorage.getItem('processingState')
    let startTime: number

    if (storedProcessingState) {
      const state = JSON.parse(storedProcessingState) as ProcessingState
      startTime = state.startTime
      setProgress(state.progress)

      if (state.isStopped) {
        setIsProcessing(false)
        return
      }
    } else {
      startTime = Date.now()
      localStorage.setItem('processingState', JSON.stringify({ startTime, progress: 0, isStopped: false }))
    }

    // Update progress and time displays
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startTime
      const newProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 100)

      setProgress(newProgress)
      setElapsedTime(formatTime(elapsed))
      setRemainingTime(formatTime(Math.max(0, TOTAL_DURATION - elapsed)))

      // Update localStorage
      localStorage.setItem('processingState', JSON.stringify({ startTime, progress: newProgress, isStopped: false }))

      // Rotate messages every 5-8 seconds
      const messageIndex = Math.floor((elapsed / 1000) * 0.15) % PROCESSING_MESSAGES.length
      setCurrentMessage(PROCESSING_MESSAGES[messageIndex])

      // Mark as complete at 100%
      if (newProgress >= 100) {
        setIsProcessing(false)
        clearInterval(interval)
        localStorage.setItem('processingState', JSON.stringify({ startTime, progress: 100, isStopped: false }))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleStop = () => {
    setShowStopDialog(true)
  }

  const confirmStop = () => {
    setIsProcessing(false)
    setShowStopDialog(false)

    const state = JSON.parse(localStorage.getItem('processingState') || '{}') as ProcessingState
    localStorage.setItem('processingState', JSON.stringify({ ...state, isStopped: true }))

    toast.info('Processing stopped by admin')
  }

  const handleReturn = () => {
    localStorage.removeItem('uploadState')
    localStorage.removeItem('processingState')
    router.push('/')
  }

  if (!uploadState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400">No upload found. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative circles */}
      <div className="circle-1" style={{ top: '-200px', left: '-200px' }} />
      <div className="circle-2" style={{ bottom: '-100px', right: '-150px' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-3 text-balance">
            {isProcessing
              ? 'Processing Your Data'
              : progress >= 100
                ? 'Processing Complete!'
                : 'Processing Stopped'}
          </h1>
          <p className="text-lg text-purple-700 h-6">
            {isProcessing ? currentMessage : ''}
            {!isProcessing && progress >= 100 && 'All students have been successfully created and stored.'}
            {!isProcessing && progress < 100 && 'The process was stopped by an administrator.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Animated Icon */}
            <div className="flex justify-center mb-8">
              {isProcessing && (
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse" />
                  <div className="absolute inset-2 rounded-full flex items-center justify-center bg-white">
                    <div className="relative w-16 h-16">
                      <svg
                        className="absolute inset-0 w-full h-full animate-spin text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {!isProcessing && progress >= 100 && (
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-200 to-emerald-200" />
                  <div className="absolute inset-2 rounded-full flex items-center justify-center bg-white">
                    <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {!isProcessing && progress < 100 && (
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 to-orange-200" />
                  <div className="absolute inset-2 rounded-full flex items-center justify-center bg-white">
                    <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Section */}
            {isProcessing && (
              <div className="space-y-6 mb-8">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-purple-900">Progress</span>
                    <span className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden border border-purple-200">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-100 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-1">
                      Elapsed
                    </p>
                    <p className="text-2xl font-bold text-purple-900 font-mono">{elapsedTime}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-1">
                      Remaining
                    </p>
                    <p className="text-2xl font-bold text-purple-900 font-mono">{remainingTime}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Summary */}
            {!isProcessing && progress >= 100 && (
              <div className="space-y-4 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">File:</span>
                      <span className="text-green-700 font-semibold truncate ml-2">{uploadState.filename}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Status:</span>
                      <span className="text-green-700 font-semibold">Successfully Processed</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Processing Time:</span>
                      <span className="text-green-700 font-semibold">{elapsedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isProcessing && (
                <button
                  onClick={handleStop}
                  className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Stop Process
                </button>
              )}

              {!isProcessing && (
                <button
                  onClick={handleReturn}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
                >
                  Upload Another File
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stop Confirmation Dialog */}
      {showStopDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-200 max-w-sm w-full p-8 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-purple-900">Stop Processing?</h2>
            </div>
            <p className="text-purple-700 mb-6">
              Are you sure you want to stop the current processing? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStopDialog(false)}
                className="flex-1 py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={confirmStop}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
