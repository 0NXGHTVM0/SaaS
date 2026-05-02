import { z } from "zod";

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
): Promise<ExtractedInvoiceResult> {
  // MVP hook: replace this deterministic placeholder with structured LLM output.
  return extractedInvoiceSchema.parse({
    supplierName: "Global Office Supplies Ltd.",
    invoiceNumber: extractedText.match(/INV-\d{4}-\d+/)?.[0] ?? null,
    invoiceDate: null,
    dueDate: null,
    currency: "EUR",
    subtotal: null,
    taxAmount: null,
    totalAmount: null,
    paymentTerms: null,
    bankAccount: null,
    lineItems: [],
  });
}
