import { desc, eq } from "drizzle-orm";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import type { StoredDocument } from "@/lib/documents/store";

export async function insertDocumentsDb(newDocuments: StoredDocument[]) {
  if (!hasDatabaseUrl() || !newDocuments.length) {
    return false;
  }

  const db = getDb();
  await db.insert(documents).values(
    newDocuments.map((document) => ({
      id: document.id,
      orgId: document.orgId,
      supplierId: document.supplierId,
      documentType: document.documentType,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: String(document.fileSize),
      storagePath: document.storagePath,
      extractedText: document.extractedText,
      extractionStatus: document.extractionStatus,
      uploadedBy:
        document.uploadedBy && document.uploadedBy !== "demo-user"
          ? document.uploadedBy
          : null,
      uploadedAt: new Date(document.uploadedAt),
    })),
  );

  return true;
}

export async function readDocumentsDb(orgId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const rows = await getDb()
    .select()
    .from(documents)
    .where(eq(documents.orgId, orgId))
    .orderBy(desc(documents.uploadedAt));

  return rows.map((document) => ({
    id: document.id,
    orgId: document.orgId,
    supplierId: document.supplierId,
    supplierName: null,
    documentType: document.documentType as StoredDocument["documentType"],
    fileUrl: document.fileUrl,
    storagePath: document.storagePath ?? "",
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: Number(document.fileSize ?? 0),
    extractedText: document.extractedText,
    extractionStatus:
      document.extractionStatus as StoredDocument["extractionStatus"],
    extractionError: null,
    uploadedBy: document.uploadedBy,
    uploadedAt: document.uploadedAt.toISOString(),
  }));
}
