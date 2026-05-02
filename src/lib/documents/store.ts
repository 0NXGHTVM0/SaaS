import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { insertDocumentsDb } from "@/lib/documents/db-store";

export type DocumentType =
  | "invoice"
  | "po"
  | "quote"
  | "contract"
  | "delivery_note";

export type ExtractionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type StoredDocument = {
  id: string;
  orgId: string;
  supplierId: string | null;
  supplierName: string | null;
  documentType: DocumentType;
  fileUrl: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  extractedText: string | null;
  extractionStatus: ExtractionStatus;
  extractionError: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
};

const dataDir = path.join(process.cwd(), ".data");
const uploadsDir = path.join(dataDir, "uploads");
const documentsPath = path.join(dataDir, "documents.json");

export async function ensureDocumentStore() {
  await mkdir(uploadsDir, { recursive: true });
}

export function getUploadPath(id: string, fileName: string) {
  return path.join(uploadsDir, `${id}-${safeFileName(fileName)}`);
}

export function getUploadUrl(id: string, fileName: string) {
  return `/api/documents/${id}/file?name=${encodeURIComponent(fileName)}`;
}

export async function readDocuments(): Promise<StoredDocument[]> {
  await ensureDocumentStore();

  try {
    const raw = await readFile(documentsPath, "utf8");
    return JSON.parse(raw) as StoredDocument[];
  } catch {
    return [];
  }
}

export async function writeDocuments(documents: StoredDocument[]) {
  await ensureDocumentStore();
  await writeFile(documentsPath, JSON.stringify(documents, null, 2));
}

export async function insertDocuments(newDocuments: StoredDocument[]) {
  if (await insertDocumentsDb(newDocuments)) {
    return newDocuments;
  }

  const documents = await readDocuments();
  documents.unshift(...newDocuments);
  await writeDocuments(documents);
  return newDocuments;
}

export async function getDocument(id: string) {
  const documents = await readDocuments();
  return documents.find((document) => document.id === id) ?? null;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}
