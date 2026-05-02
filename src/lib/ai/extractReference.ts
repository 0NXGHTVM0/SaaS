import { z } from "zod";

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
): Promise<ExtractedReferenceResult> {
  // MVP hook: replace this placeholder with structured LLM output.
  return extractedReferenceSchema.parse({
    documentType,
    supplierName: extractedText.includes("Global Office")
      ? "Global Office Supplies Ltd."
      : null,
    expectedCurrency: "EUR",
    expectedPaymentTerms: "Net 30",
    expectedLineItems: [],
  });
}
