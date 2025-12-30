export type CSVColumn<T> = {
  key: keyof T | string
  header: string
  format?: (value: any, row: T) => string
}

export function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn<T>[]
): string {
  // Build header row
  const headers = columns.map(col => escapeCSV(col.header))
  const headerRow = headers.join(',')
  
  // Build data rows
  const dataRows = data.map(row => {
    const values = columns.map(col => {
      const value = row[col.key]
      const formatted = col.format ? col.format(value, row) : value
      return escapeCSV(String(formatted ?? ''))
    })
    return values.join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}

function escapeCSV(value: string): string {
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
