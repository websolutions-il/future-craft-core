import { useState, useRef } from 'react';
import { Camera, X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MultiImageUploadProps {
  label: string;
  required?: boolean;
  imageUrls: string[];
  onImagesChanged: (urls: string[]) => void;
  folder: string;
  max?: number;
}

export default function MultiImageUpload({ label, required, imageUrls, onImagesChanged, folder, max = 10 }: MultiImageUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from('documents').upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);
    onImagesChanged([...imageUrls, publicUrl]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onImagesChanged(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="card-elevated">
      <h2 className="text-lg font-bold mb-4 text-primary">
        {label} {required && <span className="text-destructive">(חובה)</span>}
      </h2>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`${label} ${i + 1}`} className="w-full rounded-xl h-36 object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1.5 left-1.5 p-1.5 rounded-full bg-destructive text-destructive-foreground"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {imageUrls.length < max && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-xl border-2 border-dashed border-input bg-muted/50 text-lg font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={24} className="animate-spin" /> מעלה...</>
          ) : (
            <>{imageUrls.length === 0 ? <Camera size={24} /> : <Plus size={24} />} {imageUrls.length === 0 ? '📸 צלם / בחר תמונה' : 'הוסף תמונה'}</>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
