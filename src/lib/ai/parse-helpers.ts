export function parseMoney(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function findCurrency(text: string) {
  return (
    text.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|DKK|SEK|NOK)\b/i)?.[1]?.toUpperCase() ??
    null
  );
}

export function findDateAfter(label: string, text: string) {
  const pattern = new RegExp(
    `${label}\\s*[:#-]?\\s*(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4})`,
    "i",
  );
  return normalizeDate(text.match(pattern)?.[1] ?? null);
}

export function findAmountAfter(label: string, text: string) {
  const pattern = new RegExp(
    `${label}\\s*[:#-]?\\s*(?:EUR|USD|GBP|CHF)?\\s*([\\d.,]+)`,
    "i",
  );
  return parseMoney(text.match(pattern)?.[1]);
}

export function findPaymentTerms(text: string) {
  return text.match(/\bNet\s*\d{1,3}\b/i)?.[0].replace(/\s+/, " ") ?? null;
}

export function findBankAccount(text: string) {
  return text.match(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i)?.[0] ?? null;
}

export function findSupplierName(text: string, fallback: string | null = null) {
  const explicit = text.match(
    /(?:supplier|vendor|from|bill from)\s*[:#-]\s*([\s\S]*?)(?=\s+(?:invoice|purchase order|po|quote|contract|date|due|net|iban|subtotal|total|tax|vat)\b|[\n\r]|$)/i,
  )?.[1];

  if (explicit) {
    return cleanupText(explicit);
  }

  const firstUsefulLine = text
    .split(/\r?\n/)
    .map((line) => cleanupText(line))
    .find(
      (line) =>
        line.length > 2 &&
        !/^(invoice|quote|purchase order|po|contract|delivery note)$/i.test(
          line,
        ) &&
        !/^(total|subtotal|tax|vat|date|due)/i.test(line),
    );

  return firstUsefulLine ?? fallback;
}

export function extractLineItems(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => cleanupText(line))
    .map((line) => {
      const match = line.match(
        /^(.{3,}?)\s+(?:qty\s*)?(\d+(?:[.,]\d+)?)\s+(?:x|@)?\s*(?:EUR|USD|GBP)?\s*([\d.,]+)\s+(?:EUR|USD|GBP)?\s*([\d.,]+)$/i,
      );

      if (!match) {
        return null;
      }

      return {
        description: cleanupText(match[1]),
        quantity: parseMoney(match[2]),
        unitPrice: parseMoney(match[3]),
        total: parseMoney(match[4]),
      };
    })
    .filter((item) => item !== null);
}

export function cleanupText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeDate(value: string | null) {
  if (!value) {
    return null;
  }

  const iso = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) {
    return value;
  }

  const parts = value.split(/[./-]/);
  if (parts.length !== 3) {
    return value;
  }

  const [day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
