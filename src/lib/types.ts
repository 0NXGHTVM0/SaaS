export type Severity = "low" | "medium" | "high" | "critical";

export type SuggestedAction =
  | "approve"
  | "ask_supplier"
  | "reject"
  | "manual_review";

export type ExtractedInvoice = {
  supplierName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  currency: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  paymentTerms: string | null;
  bankAccount: string | null;
  lineItems: {
    description: string;
    quantity: number | null;
    unitPrice: number | null;
    taxRate: number | null;
    lineTotal: number | null;
  }[];
};

export type ExtractedReference = {
  documentType: "po" | "quote" | "contract" | "delivery_note";
  supplierName: string | null;
  expectedCurrency: string | null;
  expectedPaymentTerms: string | null;
  expectedBankAccount?: string | null;
  expectedLineItems: {
    description: string;
    quantity: number | null;
    unitPrice: number | null;
    expectedTotal: number | null;
  }[];
};

export type InvoiceException = {
  type: string;
  severity: Severity;
  title: string;
  explanation: string;
  evidence: {
    invoiceValue: string | number | null;
    expectedValue: string | number | null;
    source: "invoice" | "reference" | "history" | "rule";
  };
  suggestedAction: SuggestedAction;
};

export type InvoiceStatus =
  | "review_required"
  | "approved"
  | "disputed"
  | "paid"
  | "rejected";

export type DemoInvoice = ExtractedInvoice & {
  id: string;
  supplierId: string;
  supplierRisk: "low" | "normal" | "high";
  status: InvoiceStatus;
  exceptionScore: number;
  reference: ExtractedReference;
  exceptions: InvoiceException[];
  uploadedAt: string;
  detectedAt: string;
};

export type ReviewCase = DemoInvoice & {
  orgId: string;
  invoiceDocumentId: string;
  referenceDocumentId: string | null;
  extractedInvoiceText: string;
  extractedReferenceText: string | null;
};
