import type { FinancialRecord, ReconciliationResult, MatchResult, MismatchResult } from '@/types'

/**
 * Normalize a value for comparison
 */
function normalizeValue(value: any): any {
  if (typeof value === 'string') {
    return value.trim().toLowerCase()
  }
  if (typeof value === 'number') {
    return value
  }
  return String(value).trim().toLowerCase()
}

/**
 * Calculate similarity between two values
 */
function calculateSimilarity(value1: any, value2: any): number {
  const norm1 = normalizeValue(value1)
  const norm2 = normalizeValue(value2)

  if (norm1 === norm2) return 1.0

  if (typeof norm1 === 'string' && typeof norm2 === 'string') {
    // Simple string similarity (can be enhanced with Levenshtein distance)
    const longer = norm1.length > norm2.length ? norm1 : norm2
    const shorter = norm1.length > norm2.length ? norm2 : norm1
    if (longer.length === 0) return 1.0
    return (longer.length - editDistance(longer, shorter)) / longer.length
  }

  return 0
}

/**
 * Simple edit distance calculation
 */
function editDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

/**
 * Find matching fields between two records
 */
function findMatchingFields(record1: FinancialRecord, record2: FinancialRecord): {
  matchedFields: string[]
  confidence: number
  differences: { field: string; value1: any; value2: any }[]
} {
  const allFields = new Set([
    ...Object.keys(record1),
    ...Object.keys(record2),
  ])

  const matchedFields: string[] = []
  const differences: { field: string; value1: any; value2: any }[] = []
  let totalSimilarity = 0
  let fieldCount = 0

  // Priority fields for matching
  const priorityFields = ['id', 'reference', 'date', 'amount', 'description']

  // Check priority fields first
  for (const field of priorityFields) {
    if (record1[field] !== undefined && record2[field] !== undefined) {
      const similarity = calculateSimilarity(record1[field], record2[field])
      totalSimilarity += similarity
      fieldCount++

      if (similarity >= 0.9) {
        matchedFields.push(field)
      } else {
        differences.push({
          field,
          value1: record1[field],
          value2: record2[field],
        })
      }
    }
  }

  // Check other fields
  for (const field of allFields) {
    if (!priorityFields.includes(field) && record1[field] !== undefined && record2[field] !== undefined) {
      const similarity = calculateSimilarity(record1[field], record2[field])
      totalSimilarity += similarity
      fieldCount++

      if (similarity >= 0.9) {
        matchedFields.push(field)
      } else {
        differences.push({
          field,
          value1: record1[field],
          value2: record2[field],
        })
      }
    }
  }

  const confidence = fieldCount > 0 ? totalSimilarity / fieldCount : 0

  return { matchedFields, confidence, differences }
}

/**
 * Check if two records are likely the same
 */
function areRecordsLikelySame(record1: FinancialRecord, record2: FinancialRecord): boolean {
  const { confidence, matchedFields } = findMatchingFields(record1, record2)

  // Consider records matched if:
  // 1. High confidence (>0.8) OR
  // 2. Key fields match (id/reference + at least one other field)
  const hasKeyMatch = matchedFields.some(f => ['id', 'reference'].includes(f))
  const hasMultipleMatches = matchedFields.length >= 2

  return confidence >= 0.8 || (hasKeyMatch && hasMultipleMatches)
}

/**
 * Main reconciliation function
 */
export function reconcileData(
  dataset1: FinancialRecord[],
  dataset2: FinancialRecord[]
): ReconciliationResult {
  const matches: MatchResult[] = []
  const mismatches: MismatchResult[] = []
  const matchedIndices1 = new Set<number>()
  const matchedIndices2 = new Set<number>()

  // First pass: Find exact and near-exact matches
  for (let i = 0; i < dataset1.length; i++) {
    if (matchedIndices1.has(i)) continue

    let bestMatch: { index: number; confidence: number; matchedFields: string[]; differences: any[] } | null = null

    for (let j = 0; j < dataset2.length; j++) {
      if (matchedIndices2.has(j)) continue

      const { confidence, matchedFields, differences } = findMatchingFields(
        dataset1[i],
        dataset2[j]
      )

      if (areRecordsLikelySame(dataset1[i], dataset2[j])) {
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { index: j, confidence, matchedFields, differences }
        }
      }
    }

    if (bestMatch) {
      if (bestMatch.differences.length === 0) {
        // Perfect match
        matches.push({
          record1: dataset1[i],
          record2: dataset2[bestMatch.index],
          confidence: bestMatch.confidence,
          matchedFields: bestMatch.matchedFields,
        })
      } else {
        // Mismatch (similar but with differences)
        mismatches.push({
          record1: dataset1[i],
          record2: dataset2[bestMatch.index],
          differences: bestMatch.differences,
        })
      }
      matchedIndices1.add(i)
      matchedIndices2.add(bestMatch.index)
    }
  }

  // Find missing records
  const missingInDataset1: FinancialRecord[] = []
  const missingInDataset2: FinancialRecord[] = []

  for (let i = 0; i < dataset2.length; i++) {
    if (!matchedIndices2.has(i)) {
      missingInDataset1.push(dataset2[i])
    }
  }

  for (let i = 0; i < dataset1.length; i++) {
    if (!matchedIndices1.has(i)) {
      missingInDataset2.push(dataset1[i])
    }
  }

  // Calculate summary
  const totalMatches = matches.length
  const totalMismatches = mismatches.length
  const totalMissingIn1 = missingInDataset1.length
  const totalMissingIn2 = missingInDataset2.length
  const totalProcessed = totalMatches + totalMismatches + totalMissingIn2
  const matchRate = dataset1.length > 0 ? (totalMatches / dataset1.length) * 100 : 0

  return {
    matches,
    mismatches,
    missingInDataset1,
    missingInDataset2,
    summary: {
      totalRecords1: dataset1.length,
      totalRecords2: dataset2.length,
      totalMatches,
      totalMismatches,
      totalMissingIn1,
      totalMissingIn2,
      matchRate: Math.round(matchRate * 100) / 100,
    },
  }
}
