import { z } from "zod";
import {
  extractLineItems,
  findAmountAfter,
  findBankAccount,
  findCurrency,
  findDateAfter,
  findPaymentTerms,
  findSupplierName,
  parseMoney,
} from "@/lib/ai/parse-helpers";

export const extractedInvoiceSchema = z.object({
  supplierName: z.string().nullable(),
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  currency: z.string().length(3).nullable(),
  subtotal: z.number().nullable(),
  taxAmount: z.number().nullable(),
  totalAmount: z.number().nullable(),
  paymentTerms: z.string().nullable(),
  bankAccount: z.string().nullable(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().nullable(),
      unitPrice: z.number().nullable(),
      taxRate: z.number().nullable(),
      lineTotal: z.number().nullable(),
    }),
  ),
});

export type ExtractedInvoiceResult = z.infer<typeof extractedInvoiceSchema>;

export async function extractInvoiceFields(
  extractedText: string,
  fallbackSupplierName: string | null = null,
): Promise<ExtractedInvoiceResult> {
  const lineItems = extractLineItems(extractedText);
  const totalAmount =
    findAmountAfter("total(?: amount)?", extractedText) ??
    parseMoney(extractedText.match(/\btotal\b[^\d]{0,12}([\d.,]+)/i)?.[1]);
  const subtotal = findAmountAfter("subtotal", extractedText);
  const taxAmount =
    findAmountAfter("(?:tax|vat)(?: amount)?", extractedText) ?? null;

  return extractedInvoiceSchema.parse({
    supplierName: findSupplierName(extractedText, fallbackSupplierName),
    invoiceNumber:
      extractedText.match(/invoice\s*(?:number|no\.?|#)\s*[:#-]?\s*([A-Z0-9-]+)/i)?.[1] ??
      extractedText.match(/\bINV-[A-Z0-9-]+\b/i)?.[0] ??
      null,
    invoiceDate: findDateAfter("invoice date|date", extractedText),
    dueDate: findDateAfter("due date|due", extractedText),
    currency: findCurrency(extractedText) ?? "EUR",
    subtotal,
    taxAmount,
    totalAmount,
    paymentTerms: findPaymentTerms(extractedText),
    bankAccount: findBankAccount(extractedText),
    lineItems:
      lineItems.length > 0
        ? lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: taxAmount && subtotal ? (taxAmount / subtotal) * 100 : null,
            lineTotal: item.total,
          }))
        : [
            {
              description: "Extracted invoice total",
              quantity: 1,
              unitPrice: totalAmount,
              taxRate: taxAmount && subtotal ? (taxAmount / subtotal) * 100 : null,
              lineTotal: totalAmount,
            },
          ],
  });
}
