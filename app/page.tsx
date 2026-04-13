'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const ALLOWED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.')
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB.')
      return false
    }
    return true
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Step 1: Upload file to Vercel Blob
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadData = await uploadResponse.json()
      toast.success(`${uploadData.filename} uploaded successfully!`)

      // Step 2: Trigger Python script to process the file
      const processResponse = await fetch('/api/process-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: uploadData.pathname,
          filename: uploadData.filename,
        }),
      })

      if (!processResponse.ok) {
        const errorData = await processResponse.json()
        console.error('[v0] Processing error:', errorData)
        throw new Error(errorData.error || 'Processing failed')
      }

      // Store upload state in localStorage
      localStorage.setItem(
        'uploadState',
        JSON.stringify({
          pathname: uploadData.pathname,
          filename: uploadData.filename,
          uploadedAt: new Date().toISOString(),
        })
      )

      toast.success('Processing started! Redirecting...')

      // Navigate to processing page
      setTimeout(() => {
        router.push('/processing')
      }, 1500)
    } catch (error) {
      console.error('[v0] Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative circles - Purple gradient circles like tutrly */}
      <div className="circle-1" style={{ top: '-200px', left: '-200px' }} />
      <div className="circle-2" style={{ bottom: '-100px', right: '-150px' }} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 md:p-8 border-b border-purple-200/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-900 italic font-sans">
              Tutrly
            </h1>
            <p className="text-purple-700 font-medium hidden md:block">Student Data Management</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-6 text-balance leading-tight">
              Upload Your Student Data
            </h2>
            <p className="text-xl text-purple-700 text-balance">
              Simply upload your Excel or CSV file containing student information. Our system will process and securely store your data.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-purple-100 overflow-hidden mb-8">
            {/* Upload Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
              className={`relative p-12 md:p-20 transition-all cursor-pointer ${
                isDragging
                  ? 'bg-purple-100 scale-[1.02]'
                  : selectedFile
                    ? 'bg-green-50'
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                disabled={isUploading}
              />

              <div className="flex flex-col items-center justify-center">
                {selectedFile ? (
                  <>
                    <div className="relative mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-purple-900 mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-purple-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB • Ready to upload
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mb-2">
                      Drag & drop your file
                    </p>
                    <p className="text-purple-700 mb-4">or click to browse your computer</p>
                    <p className="text-sm text-purple-600 font-medium">
                      Supported: .xlsx, .xls, .csv • Max 10MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* File Requirements */}
            <div className="px-12 md:px-20 py-8 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-purple-900">What to include:</p>
              </div>
              <ul className="space-y-2 text-sm text-purple-700 ml-8">
                <li>• Student names and email addresses</li>
                <li>• Contact information and enrollment details</li>
                <li>• Any other relevant student data</li>
                <li>• One file at a time, maximum 10MB</li>
              </ul>
            </div>

            {/* Upload Button */}
            <div className="px-12 md:px-20 py-8 bg-white">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all ${
                  selectedFile && !isUploading
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading your file...
                  </span>
                ) : (
                  'Upload & Process'
                )}
              </button>
              <p className="text-center text-purple-600 text-sm mt-3">
                Your data is encrypted and securely stored
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">🔒</div>
              <h3 className="font-semibold text-purple-900 mb-1">Secure</h3>
              <p className="text-sm text-purple-700">Your data is encrypted and protected</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">⚡</div>
              <h3 className="font-semibold text-purple-900 mb-1">Fast</h3>
              <p className="text-sm text-purple-700">Instant processing and storage</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">✅</div>
              <h3 className="font-semibold text-purple-900 mb-1">Reliable</h3>
              <p className="text-sm text-purple-700">Never lose your student data</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
