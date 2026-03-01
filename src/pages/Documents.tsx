import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Plus, Upload, Download, Trash2, Eye, X, FolderOpen, File, Image, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DocCategory {
  key: string;
  label: string;
  icon: string;
  folder: string; // subfolder inside company folder
}

const vehicleDocs: DocCategory[] = [
  { key: 'vehicle-license', label: 'רישיונות רכב', icon: '🚗', folder: 'vehicle-license' },
  { key: 'insurance', label: 'ביטוח חובה', icon: '🛡️', folder: 'insurance' },
  { key: 'comprehensive', label: 'ביטוח מקיף', icon: '📋', folder: 'comprehensive' },
  { key: 'test', label: 'טסט', icon: '✅', folder: 'test' },
];

const driverDocs: DocCategory[] = [
  { key: 'driver-license', label: 'רישיונות נהיגה', icon: '🪪', folder: 'driver-license' },
  { key: 'health', label: 'אישורי בריאות', icon: '🏥', folder: 'health' },
  { key: 'contracts', label: 'הסכמי עבודה', icon: '📝', folder: 'contracts' },
  { key: 'other', label: 'אחר', icon: '📎', folder: 'other' },
];

const expenseDocs: DocCategory[] = [
  { key: 'fuel', label: 'חשבוניות דלק', icon: '⛽', folder: 'fuel' },
  { key: 'maintenance', label: 'חשבוניות תחזוקה', icon: '🔧', folder: 'maintenance' },
  { key: 'vendors', label: 'חשבוניות ספקים', icon: '🏪', folder: 'vendors' },
  { key: 'receipts', label: 'קבלות', icon: '🧾', folder: 'receipts' },
];

const allCategories = [...vehicleDocs, ...driverDocs, ...expenseDocs];

interface StorageFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size?: number; mimetype?: string };
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext || '')) return <Image size={20} className="text-info" />;
  if (['pdf'].includes(ext || '')) return <FileText size={20} className="text-destructive" />;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet size={20} className="text-success" />;
  return <File size={20} className="text-muted-foreground" />;
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const { user } = useAuth();
  const isManager = user?.role === 'fleet_manager' || user?.role === 'super_admin';
  const companyName = user?.company_name || '';

  const [selectedCategory, setSelectedCategory] = useState<DocCategory | null>(null);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load category counts
  const loadCounts = useCallback(async () => {
    if (!companyName) return;
    const counts: Record<string, number> = {};
    for (const cat of allCategories) {
      const { data } = await supabase.storage
        .from('documents')
        .list(`${companyName}/${cat.folder}`, { limit: 1000 });
      counts[cat.key] = data?.filter(f => f.name !== '.emptyFolderPlaceholder').length || 0;
    }
    setCategoryCounts(counts);
  }, [companyName]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Load files for selected category
  const loadFiles = useCallback(async (cat: DocCategory) => {
    if (!companyName) return;
    setLoadingFiles(true);
    const { data, error } = await supabase.storage
      .from('documents')
      .list(`${companyName}/${cat.folder}`, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });
    if (error) {
      toast.error('שגיאה בטעינת מסמכים');
    } else {
      setFiles((data || []).filter(f => f.name !== '.emptyFolderPlaceholder') as StorageFile[]);
    }
    setLoadingFiles(false);
  }, [companyName]);

  const openCategory = (cat: DocCategory) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    loadFiles(cat);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !selectedCategory || !companyName) return;
    setUploading(true);
    const file = e.target.files[0];
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._\u0590-\u05FF-]/g, '_')}`;
    const path = `${companyName}/${selectedCategory.folder}/${safeName}`;

    const { error } = await supabase.storage.from('documents').upload(path, file);
    if (error) {
      toast.error('שגיאה בהעלאת הקובץ: ' + error.message);
    } else {
      toast.success('הקובץ הועלה בהצלחה');
      loadFiles(selectedCategory);
      loadCounts();
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (fileName: string) => {
    if (!selectedCategory || !companyName) return;
    const path = `${companyName}/${selectedCategory.folder}/${fileName}`;
    const { error } = await supabase.storage.from('documents').remove([path]);
    if (error) {
      toast.error('שגיאה במחיקת הקובץ');
    } else {
      toast.success('הקובץ נמחק');
      loadFiles(selectedCategory);
      loadCounts();
    }
  };

  const handleDownload = async (fileName: string) => {
    if (!selectedCategory || !companyName) return;
    const path = `${companyName}/${selectedCategory.folder}/${fileName}`;
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    window.open(data.publicUrl, '_blank');
  };

  const handlePreview = (fileName: string) => {
    if (!selectedCategory || !companyName) return;
    const path = `${companyName}/${selectedCategory.folder}/${fileName}`;
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    setPreviewUrl(data.publicUrl);
  };

  const filteredFiles = files.filter(f =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category list view
  if (!selectedCategory) {
    return (
      <div className="animate-fade-in">
        <h1 className="page-header flex items-center gap-3"><FileText size={28} /> מסמכים</h1>

        <CategorySection title="מסמכי רכב" description="טסט, ביטוח, רישיון רכב" categories={vehicleDocs} counts={categoryCounts} onOpen={openCategory} />
        <CategorySection title="מסמכי נהגים" description="רישיונות נהיגה, תעודות, אישורים" categories={driverDocs} counts={categoryCounts} onOpen={openCategory} />
        <CategorySection title="חשבוניות והוצאות" description="חשבוניות דלק, תחזוקה וספקים" categories={expenseDocs} counts={categoryCounts} onOpen={openCategory} />
      </div>
    );
  }

  // Files list view
  return (
    <div className="animate-fade-in">
      <button onClick={() => { setSelectedCategory(null); setFiles([]); }} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <span className="rotate-180">←</span> חזרה למסמכים
      </button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{selectedCategory.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{selectedCategory.label}</h1>
          <p className="text-sm text-muted-foreground">{filteredFiles.length} מסמכים</p>
        </div>
      </div>

      {/* Search & Upload */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="חיפוש מסמך..."
            className="w-full pr-10 p-3 rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none text-lg"
          />
        </div>
        <label className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold cursor-pointer hover:bg-primary/90 active:scale-95 transition-transform ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload size={20} />
          <span className="hidden sm:inline">{uploading ? 'מעלה...' : 'העלאה'}</span>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv" />
        </label>
      </div>

      {/* Files */}
      {loadingFiles ? (
        <div className="text-center py-12 text-muted-foreground">טוען מסמכים...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-lg">אין מסמכים בקטגוריה זו</p>
          <p className="text-sm text-muted-foreground mt-1">לחץ על "העלאה" כדי להוסיף מסמך</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
            const isPdf = ext === 'pdf';
            const displayName = file.name.replace(/^\d+_/, '');

            return (
              <div key={file.id || file.name} className="card-elevated flex items-center gap-3 p-3">
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{displayName}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {file.metadata?.size && <span>{formatSize(file.metadata.size)}</span>}
                    {file.created_at && <span>{new Date(file.created_at).toLocaleDateString('he-IL')}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {(isImage || isPdf) && (
                    <button onClick={() => handlePreview(file.name)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="תצוגה מקדימה">
                      <Eye size={18} className="text-info" />
                    </button>
                  )}
                  <button onClick={() => handleDownload(file.name)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="הורדה">
                    <Download size={18} className="text-primary" />
                  </button>
                  {isManager && (
                    <button onClick={() => handleDelete(file.name)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="מחיקה">
                      <Trash2 size={18} className="text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) setPreviewUrl(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>תצוגה מקדימה</DialogTitle>
            <DialogDescription className="sr-only">תצוגה מקדימה של מסמך</DialogDescription>
          </DialogHeader>
          {previewUrl && (
            previewUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
              <img src={previewUrl} alt="תצוגה מקדימה" className="w-full max-h-[75vh] object-contain p-4" />
            ) : (
              <iframe src={previewUrl} className="w-full h-[75vh]" title="תצוגה מקדימה" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategorySection({ title, description, categories, counts, onOpen }: {
  title: string;
  description: string;
  categories: DocCategory[];
  counts: Record<string, number>;
  onOpen: (cat: DocCategory) => void;
}) {
  return (
    <div className="card-elevated mb-4">
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => onOpen(cat)}
            className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-3 hover:bg-muted hover:border-primary/30 transition-colors text-right active:scale-[0.98]"
          >
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.label}</p>
              <p className="text-xs text-muted-foreground">{counts[cat.key] || 0} מסמכים</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
