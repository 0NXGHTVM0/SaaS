import { detectInvoiceExceptions } from "@/lib/detectors";
import type { DemoInvoice, ExtractedInvoice, ExtractedReference } from "@/lib/types";

const references: Record<string, ExtractedReference> = {
  office: {
    documentType: "po",
    supplierName: "Global Office Supplies Ltd.",
    expectedCurrency: "EUR",
    expectedPaymentTerms: "Net 30",
    expectedLineItems: [
      {
        description: "Ergonomic desk chairs",
        quantity: 24,
        unitPrice: 299,
        expectedTotal: 7176,
      },
      {
        description: "Monitor arms",
        quantity: 24,
        unitPrice: 79,
        expectedTotal: 1896,
      },
      {
        description: "Install and delivery",
        quantity: 1,
        unitPrice: 650,
        expectedTotal: 650,
      },
    ],
  },
  techparts: {
    documentType: "quote",
    supplierName: "TechParts Manufacturing",
    expectedCurrency: "EUR",
    expectedPaymentTerms: "Net 45",
    expectedLineItems: [
      {
        description: "Aluminum sensor housing",
        quantity: 400,
        unitPrice: 31.8,
        expectedTotal: 12720,
      },
      {
        description: "Precision gasket kit",
        quantity: 400,
        unitPrice: 8.4,
        expectedTotal: 3360,
      },
    ],
  },
  logistics: {
    documentType: "contract",
    supplierName: "EU Logistics GmbH",
    expectedCurrency: "EUR",
    expectedPaymentTerms: "Net 30",
    expectedLineItems: [
      {
        description: "Warehouse handling",
        quantity: 1,
        unitPrice: 6800,
        expectedTotal: 6800,
      },
      {
        description: "Outbound parcel surcharge",
        quantity: 3200,
        unitPrice: 1.2,
        expectedTotal: 3840,
      },
    ],
  },
};

const invoices: (ExtractedInvoice & {
  id: string;
  supplierId: string;
  supplierRisk: DemoInvoice["supplierRisk"];
  status: DemoInvoice["status"];
  exceptionScore: number;
  reference: ExtractedReference;
  uploadedAt: string;
  detectedAt: string;
})[] = [
  {
    id: "inv-11567",
    supplierId: "sup-office",
    supplierRisk: "high",
    supplierName: "Global Office Supplies Ltd.",
    invoiceNumber: "INV-2025-11567",
    invoiceDate: "2025-05-07",
    dueDate: "2025-05-21",
    currency: "EUR",
    subtotal: 20882.35,
    taxAmount: 3967.65,
    totalAmount: 24850,
    paymentTerms: "Net 14",
    bankAccount: "DE89370400440532013001",
    lineItems: [
      {
        description: "Ergonomic desk chairs",
        quantity: 24,
        unitPrice: 349,
        taxRate: 19,
        lineTotal: 8376,
      },
      {
        description: "Monitor arms",
        quantity: 24,
        unitPrice: 79,
        taxRate: 19,
        lineTotal: 1896,
      },
      {
        description: "Install and delivery",
        quantity: 1,
        unitPrice: 650,
        taxRate: 19,
        lineTotal: 650,
      },
      {
        description: "Priority handling fee",
        quantity: 1,
        unitPrice: 1200,
        taxRate: 19,
        lineTotal: 1200,
      },
    ],
    status: "review_required",
    exceptionScore: 0.98,
    reference: references.office,
    uploadedAt: "2025-05-13 09:21",
    detectedAt: "May 13, 09:21",
  },
  {
    id: "inv-11234",
    supplierId: "sup-techparts",
    supplierRisk: "normal",
    supplierName: "TechParts Manufacturing",
    invoiceNumber: "INV-2025-11234",
    invoiceDate: "2025-05-06",
    dueDate: "2025-06-20",
    currency: "EUR",
    subtotal: 15782.5,
    taxAmount: 2998.68,
    totalAmount: 18781.18,
    paymentTerms: "Net 45",
    bankAccount: "DE12500105170648489890",
    lineItems: [
      {
        description: "Aluminum sensor housing",
        quantity: 400,
        unitPrice: 33.2,
        taxRate: 19,
        lineTotal: 13280,
      },
      {
        description: "Precision gasket kit",
        quantity: 410,
        unitPrice: 8.4,
        taxRate: 19,
        lineTotal: 3444,
      },
    ],
    status: "review_required",
    exceptionScore: 0.82,
    reference: references.techparts,
    uploadedAt: "2025-05-13 08:47",
    detectedAt: "May 13, 08:47",
  },
  {
    id: "inv-11392",
    supplierId: "sup-blue-sky",
    supplierRisk: "normal",
    supplierName: "Blue Sky Services",
    invoiceNumber: "INV-2025-11392",
    invoiceDate: "2025-05-08",
    dueDate: "2025-05-29",
    currency: "EUR",
    subtotal: 6428.57,
    taxAmount: 1221.43,
    totalAmount: 7650,
    paymentTerms: "Net 21",
    bankAccount: "DE75512108001245126199",
    lineItems: [
      {
        description: "Creative media retainer",
        quantity: 1,
        unitPrice: 6428.57,
        taxRate: 19,
        lineTotal: 6428.57,
      },
    ],
    status: "disputed",
    exceptionScore: 0.74,
    reference: {
      documentType: "contract",
      supplierName: "Blue Sky Services",
      expectedCurrency: "EUR",
      expectedPaymentTerms: "Net 30",
      expectedLineItems: [
        {
          description: "Creative media retainer",
          quantity: 1,
          unitPrice: 5900,
          expectedTotal: 5900,
        },
      ],
    },
    uploadedAt: "2025-05-13 08:31",
    detectedAt: "May 13, 08:31",
  },
  {
    id: "inv-11411",
    supplierId: "sup-logistics",
    supplierRisk: "high",
    supplierName: "EU Logistics GmbH",
    invoiceNumber: "INV-2025-11411",
    invoiceDate: "2025-05-07",
    dueDate: "2025-06-06",
    currency: "EUR",
    subtotal: 10440,
    taxAmount: 0,
    totalAmount: 12420,
    paymentTerms: "Net 30",
    bankAccount: "DE02120300000000202051",
    lineItems: [
      {
        description: "Warehouse handling",
        quantity: 1,
        unitPrice: 6800,
        taxRate: 19,
        lineTotal: 6800,
      },
      {
        description: "Outbound parcel surcharge",
        quantity: 3200,
        unitPrice: 1.2,
        taxRate: 19,
        lineTotal: 3840,
      },
    ],
    status: "review_required",
    exceptionScore: 0.69,
    reference: references.logistics,
    uploadedAt: "2025-05-13 08:12",
    detectedAt: "May 13, 08:12",
  },
];

export const demoInvoices: DemoInvoice[] = invoices.map((invoice) => ({
  ...invoice,
  exceptions: detectInvoiceExceptions({
    invoice,
    reference: invoice.reference,
    history: {
      invoiceNumbers:
        invoice.id === "inv-11567" ? ["INV-2025-11567"] : ["INV-2025-09876"],
      bankAccounts:
        invoice.id === "inv-11567"
          ? ["DE44500105175407324931"]
          : [invoice.bankAccount ?? ""],
    },
  }),
}));

export const suppliers = [
  {
    id: "sup-office",
    name: "Global Office Supplies Ltd.",
    riskLevel: "high",
    exceptions: 23,
    invoiceVolume: "186 invoices",
    defaultCurrency: "EUR",
  },
  {
    id: "sup-techparts",
    name: "TechParts Manufacturing",
    riskLevel: "normal",
    exceptions: 8,
    invoiceVolume: "74 invoices",
    defaultCurrency: "EUR",
  },
  {
    id: "sup-logistics",
    name: "EU Logistics GmbH",
    riskLevel: "high",
    exceptions: 14,
    invoiceVolume: "112 invoices",
    defaultCurrency: "EUR",
  },
];

export const getInvoiceById = (id: string) =>
  demoInvoices.find((invoice) => invoice.id === id) ?? demoInvoices[0];
