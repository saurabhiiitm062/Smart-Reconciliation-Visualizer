'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { parseFile } from '@/lib/fileParser'
import type { FinancialRecord } from '@/types'

interface FileUploadProps {
  title: string
  subtitle: string
  onDataUploaded: (data: FinancialRecord[]) => void
  data: FinancialRecord[]
}

export default function FileUpload({
  title,
  subtitle,
  onDataUploaded,
  data,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const records = await parseFile(file)
      if (records.length === 0) {
        throw new Error('The file appears to be empty or has no valid data.')
      }
      onDataUploaded(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClear = () => {
    onDataUploaded([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        {data.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear data"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Upload
            className={`mx-auto mb-4 ${
              isDragging ? 'text-primary-500' : 'text-gray-400'
            }`}
            size={48}
          />
          <p className="text-gray-600 mb-2">
            {isLoading ? (
              'Processing file...'
            ) : (
              <>
                Drag and drop a file here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  browse
                </button>
              </>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Supports CSV and Excel files (.csv, .xlsx, .xls)
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-green-600" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                {data.length} record{data.length !== 1 ? 's' : ''} loaded
              </p>
              <p className="text-sm text-green-700">
                File successfully parsed and ready for reconciliation
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
            >
              Replace File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
