/**
 * Export data as CSV file with BOM for proper Hebrew display in Excel/Google Sheets.
 */
export function exportToCsv(
  filename: string,
  headers: { key: string; label: string }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[]
) {
  const BOM = '\uFEFF';
  const headerLine = headers.map((h) => `"${h.label}"`).join(',');
  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csv = BOM + [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
