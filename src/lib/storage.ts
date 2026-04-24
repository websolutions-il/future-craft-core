// Helpers for safe Supabase Storage paths.
// Storage object keys must avoid spaces, special chars and non-ASCII characters
// (otherwise upload returns "Invalid key"). We sanitize both the folder
// segments (e.g. company name in Hebrew) and the file name itself.

export function sanitizeStorageSegment(input: string | null | undefined, fallback = 'misc'): string {
  if (!input) return fallback;
  const cleaned = input
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '_') // keep only safe ascii
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const safeBase = base
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'file';
  return ext ? `${safeBase}.${ext}` : safeBase;
}

// Build a safe storage path. Uses user.id (UUID) as the root folder so
// Hebrew/special characters in company names never break the upload.
export function buildStoragePath(userId: string, folder: string, fileName: string): string {
  const safeUser = sanitizeStorageSegment(userId, 'anon');
  const safeFolder = sanitizeStorageSegment(folder, 'misc');
  const safeFile = sanitizeFileName(fileName);
  return `${safeUser}/${safeFolder}/${Date.now()}_${safeFile}`;
}
