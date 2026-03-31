export type CsvCell = string | number | boolean | null | undefined;

function escapeCsvCell(value: CsvCell): string {
  const normalized = value == null ? "" : String(value);
  const escaped = normalized.replaceAll('"', '""');
  const requiresQuotes = /[",\n\r]/.test(escaped);
  return requiresQuotes ? `"${escaped}"` : escaped;
}

export function buildCsvContent(rows: CsvCell[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: CsvCell[][], fileName: string): void {
  const csvContent = buildCsvContent(rows);
  // Prefix with UTF-8 BOM for better compatibility with spreadsheet tools.
  downloadFile(`\uFEFF${csvContent}`, fileName, "text/csv;charset=utf-8;");
}

