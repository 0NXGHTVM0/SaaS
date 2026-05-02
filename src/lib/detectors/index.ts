import type {
  ExtractedInvoice,
  ExtractedReference,
  InvoiceException,
} from "@/lib/types";

type DetectorContext = {
  invoice: ExtractedInvoice;
  reference: ExtractedReference;
  history?: {
    invoiceNumbers?: string[];
    bankAccounts?: string[];
  };
};

const money = (value: number | null | undefined, currency = "EUR") =>
  typeof value === "number" ? `${currency} ${value.toFixed(2)}` : null;

const normalize = (value: string | null | undefined) =>
  value?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";

const findReferenceLine = (
  description: string,
  reference: ExtractedReference,
) => {
  const descriptionKey = normalize(description);

  return reference.expectedLineItems.find((line) => {
    const referenceKey = normalize(line.description);
    return (
      referenceKey.includes(descriptionKey.slice(0, 12)) ||
      descriptionKey.includes(referenceKey.slice(0, 12))
    );
  });
};

export function detectInvoiceExceptions({
  invoice,
  reference,
  history,
}: DetectorContext): InvoiceException[] {
  const exceptions: InvoiceException[] = [];
  const currency = invoice.currency ?? reference.expectedCurrency ?? "EUR";

  if (
    invoice.invoiceNumber &&
    history?.invoiceNumbers?.includes(invoice.invoiceNumber)
  ) {
    exceptions.push({
      type: "duplicate_invoice",
      severity: "critical",
      title: "Duplicate invoice number",
      explanation:
        "This invoice number has already appeared for the same supplier, so payment should be held until the supplier confirms it is not a duplicate.",
      evidence: {
        invoiceValue: invoice.invoiceNumber,
        expectedValue: "No prior invoice with this number",
        source: "history",
      },
      suggestedAction: "reject",
    });
  }

  if (
    invoice.supplierName &&
    reference.supplierName &&
    normalize(invoice.supplierName) !== normalize(reference.supplierName)
  ) {
    exceptions.push({
      type: "supplier_name_mismatch",
      severity: "high",
      title: "Supplier name does not match reference",
      explanation:
        "The invoice supplier differs from the uploaded PO, quote, contract, or delivery note.",
      evidence: {
        invoiceValue: invoice.supplierName,
        expectedValue: reference.supplierName,
        source: "reference",
      },
      suggestedAction: "manual_review",
    });
  }

  if (
    invoice.paymentTerms &&
    reference.expectedPaymentTerms &&
    normalize(invoice.paymentTerms) !== normalize(reference.expectedPaymentTerms)
  ) {
    exceptions.push({
      type: "terms_mismatch",
      severity: "high",
      title: "Payment terms changed",
      explanation:
        "The invoice asks for payment terms that differ from the agreed reference document.",
      evidence: {
        invoiceValue: invoice.paymentTerms,
        expectedValue: reference.expectedPaymentTerms,
        source: "reference",
      },
      suggestedAction: "ask_supplier",
    });
  }

  if (
    invoice.bankAccount &&
    history?.bankAccounts?.length &&
    !history.bankAccounts.includes(invoice.bankAccount)
  ) {
    exceptions.push({
      type: "bank_changed",
      severity: "critical",
      title: "Bank account changed",
      explanation:
        "The supplier bank account is different from the account used historically. This is high-risk and should be verified outside the invoice thread.",
      evidence: {
        invoiceValue: invoice.bankAccount,
        expectedValue: history.bankAccounts[0],
        source: "history",
      },
      suggestedAction: "manual_review",
    });
  }

  for (const item of invoice.lineItems) {
    const matchedLine = findReferenceLine(item.description, reference);

    if (!matchedLine) {
      exceptions.push({
        type: "unknown_extra_line_item",
        severity: "medium",
        title: `Unexpected line item: ${item.description}`,
        explanation:
          "This invoice line item could not be matched to the uploaded reference document.",
        evidence: {
          invoiceValue: item.description,
          expectedValue: "Line item from reference document",
          source: "reference",
        },
        suggestedAction: "ask_supplier",
      });
      continue;
    }

    if (
      item.unitPrice !== null &&
      matchedLine.unitPrice !== null &&
      Math.abs(item.unitPrice - matchedLine.unitPrice) > 0.01
    ) {
      exceptions.push({
        type: "price_mismatch",
        severity: item.unitPrice > matchedLine.unitPrice ? "high" : "medium",
        title: `Unit price mismatch: ${item.description}`,
        explanation:
          "The invoiced unit price differs from the agreed price in the supporting document.",
        evidence: {
          invoiceValue: money(item.unitPrice, currency),
          expectedValue: money(matchedLine.unitPrice, currency),
          source: "reference",
        },
        suggestedAction: "ask_supplier",
      });
    }

    if (
      item.quantity !== null &&
      matchedLine.quantity !== null &&
      Math.abs(item.quantity - matchedLine.quantity) > 0.001
    ) {
      exceptions.push({
        type: "quantity_mismatch",
        severity: item.quantity > matchedLine.quantity ? "high" : "medium",
        title: `Quantity mismatch: ${item.description}`,
        explanation:
          "The invoice quantity differs from the quantity in the PO, quote, contract, or delivery note.",
        evidence: {
          invoiceValue: item.quantity,
          expectedValue: matchedLine.quantity,
          source: "reference",
        },
        suggestedAction: "ask_supplier",
      });
    }
  }

  const expectedTotal = reference.expectedLineItems.reduce(
    (sum, item) => sum + (item.expectedTotal ?? 0),
    0,
  );

  if (
    invoice.totalAmount !== null &&
    expectedTotal > 0 &&
    Math.abs(invoice.totalAmount - expectedTotal) > 1
  ) {
    exceptions.push({
      type: "total_amount_mismatch",
      severity: invoice.totalAmount > expectedTotal ? "high" : "medium",
      title: "Total amount does not match reference",
      explanation:
        "The invoice total differs from the expected total calculated from the supporting document.",
      evidence: {
        invoiceValue: money(invoice.totalAmount, currency),
        expectedValue: money(expectedTotal, currency),
        source: "reference",
      },
      suggestedAction: "manual_review",
    });
  }

  if (
    (invoice.taxAmount === null || invoice.taxAmount === 0) &&
    invoice.lineItems.some((item) => item.taxRate && item.taxRate > 0)
  ) {
    exceptions.push({
      type: "vat_issue",
      severity: "medium",
      title: "VAT amount missing or suspicious",
      explanation:
        "Line items include tax rates, but the extracted invoice tax amount is missing or zero.",
      evidence: {
        invoiceValue: invoice.taxAmount,
        expectedValue: "Tax amount consistent with VAT-rated lines",
        source: "invoice",
      },
      suggestedAction: "manual_review",
    });
  }

  return exceptions;
}
