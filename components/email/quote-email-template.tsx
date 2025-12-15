import { formatDate } from '../../lib/utils/format-date'

interface QuoteEmailTemplateProps {
  customerName: string
  quoteNo: string
  quoteDate: string
  validUntil: string
  projectName: string
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number // Expected as decimal (e.g., 0.10 for 10%)
  companyName?: string
}

export function QuoteEmailTemplate({
  customerName,
  quoteNo,
  quoteDate,
  validUntil,
  projectName,
  subtotal,
  taxAmount,
  total,
  taxRate,
  companyName = 'Zenith Field Service',
}: QuoteEmailTemplateProps): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr>
        <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
            ${companyName}
          </h1>
          <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">
            Quote #${quoteNo}
          </p>
        </td>
      </tr>

      <!-- Main Content -->
      <tr>
        <td style="padding: 40px 30px;">
          <p style="font-size: 16px; margin-top: 0; margin-bottom: 24px;">
            Dear ${customerName},
          </p>

          <p style="font-size: 16px; margin-bottom: 24px;">
            Thank you for your interest in our services. Please find attached your quote for <strong>${projectName}</strong>.
          </p>

          <!-- Quote Summary Box -->
          <table style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 24px; padding: 20px;">
            <tr>
              <td>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">
                      Quote Date:
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 500;">
                      ${formatDate(quoteDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">
                      Valid Until:
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 500;">
                      ${formatDate(validUntil)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; padding-top: 16px;">
                      Subtotal:
                    </td>
                    <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; font-size: 14px; text-align: right; padding-top: 16px;">
                      ${formatCurrency(subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">
                      Tax (${(taxRate * 100).toFixed(2)}%):
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right;">
                      ${formatCurrency(taxAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 2px solid #0f172a; font-size: 18px; font-weight: bold; padding-top: 16px;">
                      Total:
                    </td>
                    <td style="padding: 12px 0; border-top: 2px solid #0f172a; font-size: 18px; font-weight: bold; text-align: right; color: #0f172a; padding-top: 16px;">
                      ${formatCurrency(total)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="font-size: 16px; margin-bottom: 24px;">
            Please review the attached PDF for complete details of the quote, including itemized line items and terms.
          </p>

          <p style="font-size: 16px; margin-bottom: 8px;">
            If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.
          </p>

          <p style="font-size: 16px; margin-top: 0;">
            Best regards,<br />
            <strong>${companyName}</strong>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            This quote is valid until ${formatDate(validUntil)}. Please contact us to accept or discuss any modifications.
          </p>
          <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">
            © ${currentYear} ${companyName}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim()
}
