'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReconciliationResult, MatchResult, MismatchResult, FinancialRecord } from '@/types'

interface ResultsTableProps {
  activeTab: 'matches' | 'mismatches' | 'missing1' | 'missing2'
  data: any[]
  results: ReconciliationResult
}

export default function ResultsTable({ activeTab, data, results }: ResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const renderRecord = (record: FinancialRecord, title: string) => {
    const keys = Object.keys(record).filter(k => k !== 'id' && k !== 'reference')
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {keys.map((key) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-700 w-32">{key}:</span>
              <span className="text-gray-900 flex-1">{String(record[key] || 'N/A')}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          No records in this category.
        </p>
      </div>
    )
  }

  if (activeTab === 'matches') {
    return (
      <div className="space-y-4">
        {data.map((match: MatchResult, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="bg-green-50 p-4 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => toggleRow(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedRows.has(index) ? (
                    <ChevronUp className="text-green-600" size={20} />
                  ) : (
                    <ChevronDown className="text-green-600" size={20} />
                  )}
                  <div>
                    <p className="font-semibold text-green-900">
                      Match #{index + 1} - Confidence: {(match.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-green-700">
                      Matched fields: {match.matchedFields.join(', ') || 'None'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                  Match
                </span>
              </div>
            </div>
            {expandedRows.has(index) && (
              <div className="p-4 space-y-4">
                {renderRecord(match.record1, 'Record from Dataset 1')}
                {renderRecord(match.record2, 'Record from Dataset 2')}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (activeTab === 'mismatches') {
    return (
      <div className="space-y-4">
        {data.map((mismatch: MismatchResult, index: number) => (
          <div key={index} className="border border-yellow-200 rounded-lg overflow-hidden">
            <div
              className="bg-yellow-50 p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => toggleRow(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedRows.has(index) ? (
                    <ChevronUp className="text-yellow-600" size={20} />
                  ) : (
                    <ChevronDown className="text-yellow-600" size={20} />
                  )}
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Mismatch #{index + 1}
                    </p>
                    <p className="text-sm text-yellow-700">
                      {mismatch.differences.length} difference(s) found
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                  Mismatch
                </span>
              </div>
            </div>
            {expandedRows.has(index) && (
              <div className="p-4 space-y-4">
                {renderRecord(mismatch.record1, 'Record from Dataset 1')}
                {renderRecord(mismatch.record2, 'Record from Dataset 2')}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3">Differences:</h4>
                  <div className="space-y-2">
                    {mismatch.differences.map((diff, diffIndex) => (
                      <div key={diffIndex} className="bg-white rounded p-3">
                        <p className="font-medium text-gray-900 mb-1">{diff.field}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Dataset 1: </span>
                            <span className="text-red-700 font-medium">{String(diff.value1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dataset 2: </span>
                            <span className="text-red-700 font-medium">{String(diff.value2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (activeTab === 'missing1' || activeTab === 'missing2') {
    return (
      <div className="space-y-4">
        {data.map((record: FinancialRecord, index: number) => (
          <div key={index} className="border border-red-200 rounded-lg overflow-hidden">
            <div
              className="bg-red-50 p-4 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => toggleRow(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedRows.has(index) ? (
                    <ChevronUp className="text-red-600" size={20} />
                  ) : (
                    <ChevronDown className="text-red-600" size={20} />
                  )}
                  <div>
                    <p className="font-semibold text-red-900">
                      Missing Record #{index + 1}
                    </p>
                    <p className="text-sm text-red-700">
                      {record.id || record.reference || `Record ${index + 1}`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
                  Missing
                </span>
              </div>
            </div>
            {expandedRows.has(index) && (
              <div className="p-4">
                {renderRecord(record, 'Record Details')}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return null
}
