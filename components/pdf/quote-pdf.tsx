import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Quote, Project, Customer, TaxRule, QuoteLine, Settings } from '@/lib/db'
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  quoteTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  quoteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quoteMetaItem: {
    fontSize: 9,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    marginBottom: 5,
  },
  valueBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    marginVertical: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 8,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#9ca3af',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    backgroundColor: '#f9fafb',
  },
  colDescription: {
    width: '35%',
  },
  colUOM: {
    width: '10%',
  },
  colQty: {
    width: '10%',
    textAlign: 'right',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTaxable: {
    width: '10%',
    textAlign: 'center',
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginBottom: 5,
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  terms: {
    fontSize: 9,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  signature: {
    marginTop: 40,
  },
  signatureLine: {
    fontSize: 10,
    marginBottom: 5,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
  },
})

interface QuotePDFProps {
  quote: Quote & {
    project: Project & {
      customer: Customer
    }
    tax_rule: TaxRule
  }
  lines: QuoteLine[]
  settings: Settings
  calculations: {
    subtotal: number
    taxableSubtotal: number
    taxAmount: number
    total: number
  }
}

export function QuotePDF({ quote, lines, settings, calculations }: QuotePDFProps) {
  const customer = quote.project.customer
  const project = quote.project
  const taxRule = quote.tax_rule

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with company info */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{settings.company_name}</Text>
          {settings.company_address && (
            <Text style={styles.companyInfo}>{settings.company_address}</Text>
          )}
          {(settings.company_phone || settings.company_email) && (
            <Text style={styles.companyInfo}>
              {settings.company_phone && `Phone: ${settings.company_phone}`}
              {settings.company_phone && settings.company_email && ' | '}
              {settings.company_email && `Email: ${settings.company_email}`}
            </Text>
          )}
        </View>

        {/* Quote title and metadata */}
        <Text style={styles.quoteTitle}>QUOTE</Text>
        
        <View style={styles.quoteMetaRow}>
          <Text style={styles.quoteMetaItem}>Quote #: {quote.quote_no}</Text>
          <Text style={styles.quoteMetaItem}>Date: {formatDate(quote.quote_date)}</Text>
        </View>

        {/* Customer & Project Info (Two Columns) */}
        <View style={styles.twoColumn}>
          {/* Left Column - Bill To */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>BILL TO:</Text>
            <Text style={styles.valueBold}>{customer.name}</Text>
            {customer.contact_name && (
              <Text style={styles.value}>{customer.contact_name}</Text>
            )}
            {customer.billing_street && (
              <Text style={styles.value}>{customer.billing_street}</Text>
            )}
            {(customer.billing_city || customer.billing_state || customer.billing_zip) && (
              <Text style={styles.value}>
                {customer.billing_city && `${customer.billing_city}, `}
                {customer.billing_state && `${customer.billing_state} `}
                {customer.billing_zip && customer.billing_zip}
              </Text>
            )}
            {customer.phone && (
              <Text style={styles.value}>Phone: {customer.phone}</Text>
            )}
            {customer.email && (
              <Text style={styles.value}>Email: {customer.email}</Text>
            )}
          </View>

          {/* Right Column - Project */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>PROJECT:</Text>
            <Text style={styles.valueBold}>
              {project.project_no} - {project.name}
            </Text>
            {(project.job_street || project.job_city || project.job_state || project.job_zip) && (
              <>
                <Text style={styles.label}>Job Site Address:</Text>
                {project.job_street && (
                  <Text style={styles.value}>{project.job_street}</Text>
                )}
                {(project.job_city || project.job_state || project.job_zip) && (
                  <Text style={styles.value}>
                    {project.job_city && `${project.job_city}, `}
                    {project.job_state && `${project.job_state} `}
                    {project.job_zip && project.job_zip}
                  </Text>
                )}
              </>
            )}
            <Text style={styles.value}>Quote Date: {formatDate(quote.quote_date)}</Text>
            {quote.valid_until && (
              <Text style={styles.value}>Valid Until: {formatDate(quote.valid_until)}</Text>
            )}
            <Text style={styles.value}>Status: {quote.status}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colUOM}>UOM</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTaxable}>Taxable</Text>
            <Text style={styles.colTotal}>Line Total</Text>
          </View>

          {/* Table Rows */}
          {lines.map((line, index) => {
            const lineTotal = line.qty * line.unit_price
            const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlt
            
            return (
              <View key={line.id} style={rowStyle}>
                <Text style={styles.colDescription}>{line.description}</Text>
                <Text style={styles.colUOM}>{line.uom}</Text>
                <Text style={styles.colQty}>{line.qty.toFixed(2)}</Text>
                <Text style={styles.colPrice}>{formatCurrency(line.unit_price)}</Text>
                <Text style={styles.colTaxable}>{line.is_taxable ? 'Yes' : 'No'}</Text>
                <Text style={styles.colTotal}>{formatCurrency(lineTotal)}</Text>
              </View>
            )
          })}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculations.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Tax ({(taxRule.rate * 100).toFixed(2)}%):
            </Text>
            <Text style={styles.totalValue}>{formatCurrency(calculations.taxAmount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(calculations.total)}</Text>
          </View>
        </View>

        {/* Footer with Terms & Signature */}
        <View style={styles.footer}>
          {settings.default_quote_terms && (
            <>
              <Text style={styles.termsTitle}>Terms & Conditions:</Text>
              <Text style={styles.terms}>{settings.default_quote_terms}</Text>
            </>
          )}
          
          <View style={styles.signature}>
            <Text style={styles.signatureLine}>
              Accepted By: ________________________________     Date: ______________
            </Text>
          </View>
        </View>

        {/* Page Numbers */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
