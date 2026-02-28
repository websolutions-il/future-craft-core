import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  label: string;
  required?: boolean;
  imageUrl: string | null;
  onImageUploaded: (url: string | null) => void;
  folder: string; // e.g. 'expenses' or 'accidents'
}

export default function ImageUpload({ label, required, imageUrl, onImageUploaded, folder }: ImageUploadProps) {
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
    onImageUploaded(publicUrl);
    setUploading(false);
  };

  const removeImage = () => {
    onImageUploaded(null);
  };

  return (
    <div className="card-elevated">
      <h2 className="text-lg font-bold mb-4 text-primary">
        {label} {required && <span className="text-destructive">(חובה)</span>}
      </h2>
      {!imageUrl ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-input bg-muted/50 text-xl font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={28} className="animate-spin" /> מעלה...</>
          ) : (
            <><Camera size={28} /> 📸 צלם / בחר תמונה</>
          )}
        </button>
      ) : (
        <div className="relative">
          <img src={imageUrl} alt={label} className="w-full rounded-xl max-h-64 object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 left-2 p-2 rounded-full bg-destructive text-destructive-foreground"
          >
            <X size={20} />
          </button>
        </div>
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
