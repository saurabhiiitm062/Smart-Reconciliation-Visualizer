'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ReconciliationResults from '@/components/ReconciliationResults'
import { reconcileData } from '@/lib/reconciliation'
import type { FinancialRecord, ReconciliationResult } from '@/types'

export default function Home() {
  const [dataset1, setDataset1] = useState<FinancialRecord[]>([])
  const [dataset2, setDataset2] = useState<FinancialRecord[]>([])
  const [results, setResults] = useState<ReconciliationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDataset1Upload = (data: FinancialRecord[]) => {
    setDataset1(data)
    setResults(null)
  }

  const handleDataset2Upload = (data: FinancialRecord[]) => {
    setDataset2(data)
    setResults(null)
  }

  const handleReconcile = () => {
    if (dataset1.length === 0 || dataset2.length === 0) {
      alert('Please upload both datasets before reconciling')
      return
    }

    setIsProcessing(true)
    // Simulate processing time for better UX
    setTimeout(() => {
      const reconciliationResults = reconcileData(dataset1, dataset2)
      setResults(reconciliationResults)
      setIsProcessing(false)
    }, 500)
  }

  const handleReset = () => {
    setDataset1([])
    setDataset2([])
    setResults(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Smart Reconciliation Visualizer
          </h1>
          <p className="text-lg text-gray-600">
            Compare and reconcile two financial datasets with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FileUpload
            title="Dataset 1"
            subtitle="Upload your first dataset (e.g., Purchase Register)"
            onDataUploaded={handleDataset1Upload}
            data={dataset1}
          />
          <FileUpload
            title="Dataset 2"
            subtitle="Upload your second dataset (e.g., Sales Register)"
            onDataUploaded={handleDataset2Upload}
            data={dataset2}
          />
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleReconcile}
            disabled={isProcessing || dataset1.length === 0 || dataset2.length === 0}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isProcessing ? 'Processing...' : 'Reconcile Datasets'}
          </button>
          {(dataset1.length > 0 || dataset2.length > 0) && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {results && <ReconciliationResults results={results} />}
      </div>
    </main>
  )
}
