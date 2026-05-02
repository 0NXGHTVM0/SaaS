import { z } from "zod";
import {
  extractLineItems,
  findCurrency,
  findPaymentTerms,
  findSupplierName,
  parseMoney,
} from "@/lib/ai/parse-helpers";

export const extractedReferenceSchema = z.object({
  documentType: z.enum(["po", "quote", "contract", "delivery_note"]),
  supplierName: z.string().nullable(),
  expectedCurrency: z.string().length(3).nullable(),
  expectedPaymentTerms: z.string().nullable(),
  expectedLineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().nullable(),
      unitPrice: z.number().nullable(),
      expectedTotal: z.number().nullable(),
    }),
  ),
});

export type ExtractedReferenceResult = z.infer<
  typeof extractedReferenceSchema
>;

export async function extractReferenceFields(
  extractedText: string,
  documentType: ExtractedReferenceResult["documentType"],
  fallbackSupplierName: string | null = null,
): Promise<ExtractedReferenceResult> {
  const lineItems = extractLineItems(extractedText);
  const total = parseMoney(
    extractedText.match(/\b(?:expected\s*)?total\b[^\d]{0,12}([\d.,]+)/i)?.[1],
  );

  return extractedReferenceSchema.parse({
    documentType,
    supplierName: findSupplierName(extractedText, fallbackSupplierName),
    expectedCurrency: findCurrency(extractedText) ?? "EUR",
    expectedPaymentTerms: findPaymentTerms(extractedText),
    expectedLineItems:
      lineItems.length > 0
        ? lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            expectedTotal: item.total,
          }))
        : [
            {
              description: "Expected document total",
              quantity: 1,
              unitPrice: total,
              expectedTotal: total,
            },
          ],
  });
}
