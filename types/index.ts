export interface FinancialRecord {
  id?: string
  date?: string
  amount?: number
  description?: string
  reference?: string
  category?: string
  [key: string]: any // Allow additional fields
}

export interface MatchResult {
  record1: FinancialRecord
  record2: FinancialRecord
  confidence: number
  matchedFields: string[]
}

export interface MismatchResult {
  record1: FinancialRecord
  record2: FinancialRecord
  differences: {
    field: string
    value1: any
    value2: any
  }[]
}

export interface ReconciliationResult {
  matches: MatchResult[]
  mismatches: MismatchResult[]
  missingInDataset1: FinancialRecord[]
  missingInDataset2: FinancialRecord[]
  summary: {
    totalRecords1: number
    totalRecords2: number
    totalMatches: number
    totalMismatches: number
    totalMissingIn1: number
    totalMissingIn2: number
    matchRate: number
  }
}
