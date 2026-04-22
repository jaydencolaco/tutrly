'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, X } from 'lucide-react'
import { toast } from 'sonner'

interface ParsedRow {
  [key: string]: string
}

export default function MassUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<{ headers: string[]; rows: ParsedRow[] } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const ALLOWED = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]

  const handleFile = (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error('Only Excel (.xlsx, .xls) or CSV files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File exceeds 10 MB limit.')
      return
    }
    setSelectedFile(file)

    // CSV preview
    if (file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.trim().split('\n').slice(0, 6) // header + 5 rows
        const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.trim().replace(/"/g, ''))
          return headers.reduce<ParsedRow>((obj, h, i) => ({ ...obj, [h]: vals[i] ?? '' }), {})
        })
        setPreview({ headers, rows })
      }
      reader.readAsText(file)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const data = await res.json()
      await fetch('/api/process-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: data.pathname, filename: data.filename }),
      })
      toast.success(`${data.filename} uploaded and processing started.`)
      setSelectedFile(null)
      setPreview(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const clear = () => { setSelectedFile(null); setPreview(null) }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-purple-900">Mass Upload</h1>
        <p className="text-purple-600 mt-1">Upload an Excel or CSV file to bulk-create students.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative bg-white rounded-2xl border-2 border-dashed transition-all cursor-pointer p-12 text-center ${
          isDragging ? 'border-purple-500 bg-purple-50' : selectedFile ? 'border-green-300 bg-green-50 cursor-default' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">{selectedFile.name}</span>
              <button onClick={(e) => { e.stopPropagation(); clear() }} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-green-600">{(selectedFile.size / 1024).toFixed(1)} KB — ready to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-purple-900">Drop your file here</p>
            <p className="text-sm text-purple-500">or click to browse — .xlsx, .xls, .csv up to 10 MB</p>
          </div>
        )}
      </div>

      {/* CSV preview table */}
      {preview && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-purple-50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-purple-900">Preview (first 5 rows)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50">
                <tr>
                  {preview.headers.map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-purple-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-t border-purple-50">
                    {preview.headers.map((h) => (
                      <td key={h} className="px-4 py-2.5 text-purple-800 whitespace-nowrap">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95 shadow-md"
      >
        {isUploading ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="w-4 h-4" /> Upload & Process</>
        )}
      </button>
    </div>
  )
}
