'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ReconciliationResult } from '@/types'
import ResultsTable from './ResultsTable'

interface ReconciliationResultsProps {
  results: ReconciliationResult
}

const COLORS = {
  match: '#10b981',
  mismatch: '#f59e0b',
  missing1: '#ef4444',
  missing2: '#3b82f6',
}

export default function ReconciliationResults({ results }: ReconciliationResultsProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'mismatches' | 'missing1' | 'missing2'>('matches')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterConfidence, setFilterConfidence] = useState<number>(0)

  const chartData = [
    { name: 'Matches', value: results.summary.totalMatches, color: COLORS.match },
    { name: 'Mismatches', value: results.summary.totalMismatches, color: COLORS.mismatch },
    { name: 'Missing in Dataset 1', value: results.summary.totalMissingIn1, color: COLORS.missing1 },
    { name: 'Missing in Dataset 2', value: results.summary.totalMissingIn2, color: COLORS.missing2 },
  ]

  const filteredMatches = useMemo(() => {
    return results.matches.filter((match) => {
      const matchesSearch = searchQuery === '' || 
        JSON.stringify(match.record1).toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(match.record2).toLowerCase().includes(searchQuery.toLowerCase())
      const matchesConfidence = match.confidence >= filterConfidence
      return matchesSearch && matchesConfidence
    })
  }, [results.matches, searchQuery, filterConfidence])

  const filteredMismatches = useMemo(() => {
    return results.mismatches.filter((mismatch) => {
      return searchQuery === '' || 
        JSON.stringify(mismatch.record1).toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(mismatch.record2).toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [results.mismatches, searchQuery])

  const filteredMissing1 = useMemo(() => {
    return results.missingInDataset1.filter((record) => {
      return searchQuery === '' || 
        JSON.stringify(record).toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [results.missingInDataset1, searchQuery])

  const filteredMissing2 = useMemo(() => {
    return results.missingInDataset2.filter((record) => {
      return searchQuery === '' || 
        JSON.stringify(record).toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [results.missingInDataset2, searchQuery])

  const getCurrentData = () => {
    switch (activeTab) {
      case 'matches':
        return filteredMatches
      case 'mismatches':
        return filteredMismatches
      case 'missing1':
        return filteredMissing1
      case 'missing2':
        return filteredMissing2
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Reconciliation Results</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Matches</p>
              <p className="text-2xl font-bold text-green-900">{results.summary.totalMatches}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Mismatches</p>
              <p className="text-2xl font-bold text-yellow-900">{results.summary.totalMismatches}</p>
            </div>
            <AlertCircle className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Missing in Dataset 1</p>
              <p className="text-2xl font-bold text-red-900">{results.summary.totalMissingIn1}</p>
            </div>
            <XCircle className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Missing in Dataset 2</p>
              <p className="text-2xl font-bold text-blue-900">{results.summary.totalMissingIn2}</p>
            </div>
            <XCircle className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Match Rate */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary-600" size={24} />
          <div>
            <p className="text-sm text-primary-700 font-medium">Overall Match Rate</p>
            <p className="text-2xl font-bold text-primary-900">{results.summary.matchRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Count Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.filter(d => d.value > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'matches'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Matches ({results.matches.length})
            </button>
            <button
              onClick={() => setActiveTab('mismatches')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'mismatches'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mismatches ({results.mismatches.length})
            </button>
            <button
              onClick={() => setActiveTab('missing1')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'missing1'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Missing in Dataset 1 ({results.missingInDataset1.length})
            </button>
            <button
              onClick={() => setActiveTab('missing2')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'missing2'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Missing in Dataset 2 ({results.missingInDataset2.length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {activeTab === 'matches' && (
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <label className="text-sm text-gray-600">Min Confidence:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-700 font-medium">
                {(filterConfidence * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <ResultsTable
        activeTab={activeTab}
        data={getCurrentData()}
        results={results}
      />
    </div>
  )
}
