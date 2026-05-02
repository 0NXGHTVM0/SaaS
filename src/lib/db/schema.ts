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
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const authUsers = pgTable(
  "auth_user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("auth_user_email_idx").on(table.email)],
);

export const authSessions = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("auth_session_token_idx").on(table.token),
    index("auth_session_user_id_idx").on(table.userId),
  ],
);

export const authAccounts = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("auth_account_user_id_idx").on(table.userId)],
);

export const authVerifications = pgTable("auth_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    authUserId: text("auth_user_id").references(() => authUsers.id, {
      onDelete: "set null",
    }),
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
    fileSize: numeric("file_size", { precision: 14, scale: 0 }),
    storagePath: text("storage_path"),
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
    referenceDocumentId: uuid("reference_document_id").references(
      () => documents.id,
      { onDelete: "set null" },
    ),
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

export const invoiceReferenceItems = pgTable(
  "invoice_reference_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }),
    unitPrice: numeric("unit_price", { precision: 12, scale: 4 }),
    expectedTotal: numeric("expected_total", { precision: 12, scale: 2 }),
    ...timestamps,
  },
  (table) => [index("invoice_reference_items_invoice_id_idx").on(table.invoiceId)],
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

export const invoiceReferenceItemsRelations = relations(
  invoiceReferenceItems,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [invoiceReferenceItems.invoiceId],
      references: [invoices.id],
    }),
  }),
);

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

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

export const invoiceExceptionsRelations = relations(invoiceExceptions, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceExceptions.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ many }) => ({
  referenceItems: many(invoiceReferenceItems),
  lineItems: many(invoiceLineItems),
  exceptions: many(invoiceExceptions),
}));

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
