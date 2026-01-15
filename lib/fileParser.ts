import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { FinancialRecord } from '@/types'

/**
 * Parse CSV file
 */
export function parseCSV(file: File): Promise<FinancialRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const records = results.data.map((row: any, index: number) => {
            // Normalize the data
            const record: FinancialRecord = {}
            
            // Try to identify common fields
            Object.keys(row).forEach((key) => {
              const normalizedKey = key.toLowerCase().trim()
              const value = row[key]

              // Map common field names
              if (normalizedKey.includes('id') || normalizedKey.includes('reference')) {
                record.id = record.id || value
                record.reference = record.reference || value
              }
              if (normalizedKey.includes('date')) {
                record.date = value
              }
              if (normalizedKey.includes('amount') || normalizedKey.includes('value') || normalizedKey.includes('price')) {
                record.amount = parseFloat(value) || 0
              }
              if (normalizedKey.includes('description') || normalizedKey.includes('details') || normalizedKey.includes('note')) {
                record.description = value
              }
              if (normalizedKey.includes('category') || normalizedKey.includes('type')) {
                record.category = value
              }

              // Keep original field as well
              record[key] = value
            })

            // Ensure at least an index-based ID
            if (!record.id && !record.reference) {
              record.id = `record-${index + 1}`
              record.reference = `record-${index + 1}`
            }

            return record
          })

          resolve(records)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

/**
 * Parse Excel file
 */
export function parseExcel(file: File): Promise<FinancialRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const records = jsonData.map((row: any, index: number) => {
          const record: FinancialRecord = {}

          // Try to identify common fields
          Object.keys(row).forEach((key) => {
            const normalizedKey = key.toLowerCase().trim()
            const value = row[key]

            // Map common field names
            if (normalizedKey.includes('id') || normalizedKey.includes('reference')) {
              record.id = record.id || value
              record.reference = record.reference || value
            }
            if (normalizedKey.includes('date')) {
              record.date = value
            }
            if (normalizedKey.includes('amount') || normalizedKey.includes('value') || normalizedKey.includes('price')) {
              record.amount = parseFloat(value) || 0
            }
            if (normalizedKey.includes('description') || normalizedKey.includes('details') || normalizedKey.includes('note')) {
              record.description = value
            }
            if (normalizedKey.includes('category') || normalizedKey.includes('type')) {
              record.category = value
            }

            // Keep original field as well
            record[key] = value
          })

          // Ensure at least an index-based ID
          if (!record.id && !record.reference) {
            record.id = `record-${index + 1}`
            record.reference = `record-${index + 1}`
          }

          return record
        })

        resolve(records)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse uploaded file based on its type
 */
export async function parseFile(file: File): Promise<FinancialRecord[]> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (fileExtension === 'csv') {
    return parseCSV(file)
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file)
  } else {
    throw new Error('Unsupported file type. Please upload a CSV or Excel file.')
  }
}
