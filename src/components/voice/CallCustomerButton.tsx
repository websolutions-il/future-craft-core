import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VoiceAgentDialer from './VoiceAgentDialer';

interface Props {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  vehiclePlate?: string;
  flowType?: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export default function CallCustomerButton({
  customerId,
  customerName,
  customerPhone,
  vehiclePlate,
  flowType = 'customer_call',
  variant = 'full',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-all ${className}`}
        title="התקשר באמצעות Voice AI"
      >
        <Phone size={16} />
        {variant === 'full' && <span className="text-sm">התקשר AI</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>שיחת Voice AI</DialogTitle>
          </DialogHeader>
          <VoiceAgentDialer
            customerId={customerId}
            customerName={customerName}
            customerPhone={customerPhone}
            vehiclePlate={vehiclePlate}
            flowType={flowType}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
