import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyFilter } from '@/hooks/useCompanyFilter';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const companyFilter = useCompanyFilter();
  const [settings, setSettings] = useState<{ whatsapp_phone: string; whatsapp_enabled: boolean; whatsapp_button_color: string; whatsapp_button_text: string } | null>(null);

  useEffect(() => {
    if (!companyFilter) return;
    supabase.from('company_settings').select('whatsapp_phone, whatsapp_enabled, whatsapp_button_color, whatsapp_button_text').eq('company_name', companyFilter).maybeSingle().then(({ data }) => {
      if (data) setSettings(data);
    });
  }, [companyFilter]);

  if (!settings?.whatsapp_enabled || !settings?.whatsapp_phone) return null;

  const phone = settings.whatsapp_phone.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${phone}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white font-bold text-sm transition-transform hover:scale-105"
      style={{ backgroundColor: settings.whatsapp_button_color || '#25D366' }}
    >
      <MessageCircle size={22} />
      {settings.whatsapp_button_text || 'וואטסאפ למוקד'}
    </a>
  );
}
