import { useState, useRef } from 'react';
import { Expense, FaultAttachment, expenseCategories, demoVehicles, demoDrivers } from '@/data/demo-data';
import { ArrowRight, Camera, X, Plus } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  onCancel: () => void;
}

const paymentMethods = [
  { key: 'credit' as const, text: 'אשראי' },
  { key: 'cash' as const, text: 'מזומן' },
  { key: 'fuel_card' as const, text: 'דלקן' },
];

export default function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'cash' | 'fuel_card'>('credit');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<FaultAttachment | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptImage({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    });
    e.target.value = '';
  };

  const removeReceipt = () => {
    if (receiptImage) URL.revokeObjectURL(receiptImage.url);
    setReceiptImage(null);
  };

  const isValid = driverName && vehiclePlate && category && vendor && invoiceNumber && invoiceDate && amount && receiptImage;

  const handleSubmit = () => {
    if (!isValid) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      driverName,
      vehiclePlate,
      category,
      vendor,
      invoiceNumber,
      invoiceDate,
      amount: parseFloat(amount),
      odometer: parseInt(odometer) || 0,
      paymentMethod,
      notes: notes || undefined,
      receiptImage: receiptImage || undefined,
    };
    onSubmit(expense);
  };

  const inputClass = "w-full p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none";

  return (
    <div className="animate-fade-in">
      <button onClick={onCancel} className="flex items-center gap-2 text-primary text-lg font-medium mb-4 min-h-[48px]">
        <ArrowRight size={20} />
        חזרה לרשימת הוצאות
      </button>

      <h1 className="text-2xl font-bold mb-6">דיווח הוצאה</h1>

      <div className="space-y-5">
        {/* Section: Driver & Vehicle */}
        <div className="card-elevated">
          <h2 className="text-lg font-bold mb-4 text-primary">פרטי נהג ורכב</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium mb-2">שם הנהג</label>
              <select value={driverName} onChange={e => setDriverName(e.target.value)} className={inputClass}>
                <option value="">בחר נהג...</option>
                {demoDrivers.map(d => (
                  <option key={d.id} value={d.fullName}>{d.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">מספר רכב</label>
              <select value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className={inputClass}>
                <option value="">בחר רכב...</option>
                {demoVehicles.map(v => (
                  <option key={v.id} value={v.licensePlate}>{v.licensePlate} - {v.manufacturer} {v.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">קילומטראז'</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder="הכנס קילומטראז' נוכחי..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section: Invoice Details */}
        <div className="card-elevated">
          <h2 className="text-lg font-bold mb-4 text-primary">פרטי החשבונית</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium mb-2">קטגוריה</label>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-3 rounded-xl text-lg font-medium transition-colors ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">שם הספק</label>
              <input
                type="text"
                value={vendor}
                onChange={e => setVendor(e.target.value)}
                placeholder="הכנס שם ספק..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">מספר חשבונית</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="הכנס מספר חשבונית..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">תאריך חשבונית</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">סכום בשקלים</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="₪ הכנס סכום..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">אמצעי תשלום</label>
              <div className="flex gap-2">
                {paymentMethods.map(pm => (
                  <button
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`flex-1 py-4 rounded-xl text-lg font-medium border-2 transition-colors ${paymentMethod === pm.key ? 'border-primary/40 bg-primary/5 font-bold' : 'bg-muted text-muted-foreground border-transparent'}`}
                  >
                    {pm.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Receipt Photo */}
        <div className="card-elevated">
          <h2 className="text-lg font-bold mb-4 text-primary">צילום חשבונית <span className="text-destructive">(חובה)</span></h2>
          {!receiptImage ? (
            <button
              onClick={() => cameraRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-input bg-muted/50 text-xl font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Camera size={28} />
              📸 פתח מצלמה
            </button>
          ) : (
            <div className="relative">
              <img src={receiptImage.url} alt="חשבונית" className="w-full rounded-xl max-h-64 object-cover" />
              <button
                onClick={removeReceipt}
                className="absolute top-2 left-2 p-2 rounded-full bg-destructive text-destructive-foreground"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-lg font-medium mb-2">הערות</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="הערות נוספות..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-5 rounded-xl text-xl font-bold transition-colors ${isValid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
        >
          <Plus size={24} className="inline ml-2" />
          שליחה
        </button>
      </div>
    </div>
  );
}
