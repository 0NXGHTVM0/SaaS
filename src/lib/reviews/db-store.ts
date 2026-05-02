import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import {
  invoiceExceptions,
  invoiceLineItems,
  invoiceReferenceItems,
  invoices,
} from "@/lib/db/schema";
import type { ReviewCase } from "@/lib/types";

export async function insertReviewCaseDb(reviewCase: ReviewCase) {
  if (!hasDatabaseUrl()) {
    return false;
  }

  const db = getDb();
  await db.insert(invoices).values({
    id: reviewCase.id,
    orgId: reviewCase.orgId,
    supplierId: null,
    documentId: reviewCase.invoiceDocumentId,
    referenceDocumentId: reviewCase.referenceDocumentId,
    invoiceNumber: reviewCase.invoiceNumber,
    invoiceDate: reviewCase.invoiceDate,
    dueDate: reviewCase.dueDate,
    currency: reviewCase.currency ?? "EUR",
    subtotal: toNumeric(reviewCase.subtotal),
    taxAmount: toNumeric(reviewCase.taxAmount),
    totalAmount: toNumeric(reviewCase.totalAmount),
    paymentTerms: reviewCase.paymentTerms,
    bankAccount: reviewCase.bankAccount,
    status: reviewCase.status,
    exceptionScore: toNumeric(reviewCase.exceptionScore),
    createdAt: new Date(reviewCase.uploadedAt),
  });

  if (reviewCase.lineItems.length) {
    await db.insert(invoiceLineItems).values(
      reviewCase.lineItems.map((item) => ({
        invoiceId: reviewCase.id,
        description: item.description,
        quantity: toNumeric(item.quantity),
        unitPrice: toNumeric(item.unitPrice),
        taxRate: toNumeric(item.taxRate),
        lineTotal: toNumeric(item.lineTotal),
        matchedReference: null,
      })),
    );
  }

  const referenceItems = reviewCase.reference.expectedLineItems;
  if (referenceItems.length) {
    await db.insert(invoiceReferenceItems).values(
      referenceItems.map((item) => ({
        invoiceId: reviewCase.id,
        description: item.description,
        quantity: toNumeric(item.quantity),
        unitPrice: toNumeric(item.unitPrice),
        expectedTotal: toNumeric(item.expectedTotal),
      })),
    );
  }

  if (reviewCase.exceptions.length) {
    await db.insert(invoiceExceptions).values(
      reviewCase.exceptions.map((exception) => ({
        invoiceId: reviewCase.id,
        exceptionType: exception.type,
        severity: exception.severity,
        title: exception.title,
        explanation: exception.explanation,
        evidence: exception.evidence,
        suggestedAction: exception.suggestedAction,
      })),
    );
  }

  return true;
}

export async function readReviewCasesDb(orgId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const rows = await getDb().query.invoices.findMany({
    where: eq(invoices.orgId, orgId),
    orderBy: desc(invoices.createdAt),
    with: {
      lineItems: true,
      referenceItems: true,
      exceptions: true,
    },
  });

  return rows.map((invoice): ReviewCase => {
    const exceptions = invoice.exceptions.map((exception) => ({
      type: exception.exceptionType,
      severity: exception.severity as ReviewCase["exceptions"][number]["severity"],
      title: exception.title,
      explanation: exception.explanation,
      evidence: exception.evidence as ReviewCase["exceptions"][number]["evidence"],
      suggestedAction:
        exception.suggestedAction as ReviewCase["exceptions"][number]["suggestedAction"],
    }));

    return {
      id: invoice.id,
      orgId: invoice.orgId,
      supplierId: invoice.supplierId ?? "supplier-demo",
      supplierRisk: exceptions.some((item) => item.severity === "critical")
        ? "high"
        : "normal",
      status: invoice.status as ReviewCase["status"],
      exceptionScore: Number(invoice.exceptionScore ?? 0),
      supplierName: null,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      currency: invoice.currency,
      subtotal: toNumber(invoice.subtotal),
      taxAmount: toNumber(invoice.taxAmount),
      totalAmount: toNumber(invoice.totalAmount),
      paymentTerms: invoice.paymentTerms,
      bankAccount: invoice.bankAccount,
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        quantity: toNumber(item.quantity),
        unitPrice: toNumber(item.unitPrice),
        taxRate: toNumber(item.taxRate),
        lineTotal: toNumber(item.lineTotal),
      })),
      reference: {
        documentType: "po",
        supplierName: null,
        expectedCurrency: invoice.currency,
        expectedPaymentTerms: null,
        expectedLineItems: invoice.referenceItems.map((item) => ({
          description: item.description,
          quantity: toNumber(item.quantity),
          unitPrice: toNumber(item.unitPrice),
          expectedTotal: toNumber(item.expectedTotal),
        })),
      },
      exceptions,
      uploadedAt: invoice.createdAt.toISOString(),
      detectedAt: invoice.createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      invoiceDocumentId: invoice.documentId,
      referenceDocumentId: invoice.referenceDocumentId,
      extractedInvoiceText: "",
      extractedReferenceText: null,
    };
  });
}

function toNumeric(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : null;
}

function toNumber(value: string | null) {
  return value === null ? null : Number(value);
}
