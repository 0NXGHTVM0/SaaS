import {
  boolean,
  char,
  date,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ...timestamps,
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role").notNull().default("member"),
    ...timestamps,
  },
  (table) => [index("users_org_id_idx").on(table.orgId)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    vatId: text("vat_id"),
    defaultCurrency: char("default_currency", { length: 3 })
      .notNull()
      .default("EUR"),
    riskLevel: text("risk_level").notNull().default("normal"),
    ...timestamps,
  },
  (table) => [
    index("suppliers_org_id_idx").on(table.orgId),
    index("suppliers_risk_level_idx").on(table.riskLevel),
  ],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    documentType: text("document_type").notNull(),
    fileUrl: text("file_url").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    extractedText: text("extracted_text"),
    extractionStatus: text("extraction_status").notNull().default("pending"),
    uploadedBy: uuid("uploaded_by").references(() => users.id),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("documents_org_id_idx").on(table.orgId),
    index("documents_supplier_id_idx").on(table.supplierId),
  ],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoice_number"),
    invoiceDate: date("invoice_date"),
    dueDate: date("due_date"),
    currency: char("currency", { length: 3 }).notNull().default("EUR"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    paymentTerms: text("payment_terms"),
    bankAccount: text("bank_account"),
    status: text("status").notNull().default("review_required"),
    exceptionScore: numeric("exception_score", { precision: 4, scale: 3 }),
    ...timestamps,
  },
  (table) => [
    index("invoices_org_id_idx").on(table.orgId),
    index("invoices_supplier_id_idx").on(table.supplierId),
    index("invoices_invoice_number_idx").on(table.invoiceNumber),
    index("invoices_status_idx").on(table.status),
    index("invoices_exception_score_idx").on(table.exceptionScore),
  ],
);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
    lineTotal: numeric("line_total", { precision: 12, scale: 2 }),
    matchedReference: text("matched_reference"),
    ...timestamps,
  },
  (table) => [index("invoice_line_items_invoice_id_idx").on(table.invoiceId)],
);

export const supplierRules = pgTable(
  "supplier_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    ruleType: text("rule_type").notNull(),
    config: jsonb("config").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("supplier_rules_org_id_idx").on(table.orgId),
    index("supplier_rules_supplier_id_idx").on(table.supplierId),
  ],
);

export const invoiceExceptions = pgTable(
  "invoice_exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    exceptionType: text("exception_type").notNull(),
    severity: text("severity").notNull(),
    title: text("title").notNull(),
    explanation: text("explanation").notNull(),
    evidence: jsonb("evidence").notNull(),
    suggestedAction: text("suggested_action").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("invoice_exceptions_invoice_id_idx").on(table.invoiceId)],
);

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewer_id").references(() => users.id),
    decision: text("decision").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (table) => [index("approvals_invoice_id_idx").on(table.invoiceId)],
);

export const disputeDrafts = pgTable(
  "dispute_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("dispute_drafts_invoice_id_idx").on(table.invoiceId),
    index("dispute_drafts_supplier_id_idx").on(table.supplierId),
  ],
);
