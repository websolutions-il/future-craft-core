import { useState, useEffect } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense } from '@/data/demo-data';
import { toast } from 'sonner';

interface ExpenseRow {
  id: string;
  date: string;
  driver_name: string;
  vehicle_plate: string;
  category: string;
  vendor: string;
  invoice_number: string;
  amount: number;
  odometer: number;
  notes: string;
}

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const loadExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (data) setExpenses(data as ExpenseRow[]);
  };

  useEffect(() => { loadExpenses(); }, []);

  const filtered = expenses.filter(e =>
    e.driver_name?.includes(search) || e.vehicle_plate?.includes(search) || e.category?.includes(search)
  );

  const handleNewExpense = async (expense: Expense) => {
    const { error } = await supabase.from('expenses').insert({
      driver_name: expense.driverName,
      vehicle_plate: expense.vehiclePlate,
      category: expense.category,
      vendor: expense.vendor,
      invoice_number: expense.invoiceNumber,
      invoice_date: expense.invoiceDate,
      amount: expense.amount,
      odometer: expense.odometer,
      notes: expense.notes || '',
      company_name: user?.company_name || '',
      created_by: user?.id,
    });
    if (error) {
      toast.error('שגיאה בשמירת ההוצאה');
      console.error(error);
    } else {
      toast.success('ההוצאה נשמרה בהצלחה');
      setShowForm(false);
      loadExpenses();
    }
  };

  if (showForm) {
    return (
      <div className="animate-fade-in">
        <ExpenseForm onSubmit={handleNewExpense} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-header mb-0">דלק וחשבוניות</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-lg font-bold min-h-[48px]">
          <Plus size={22} />
          הוצאה חדשה
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none" />
      </div>

      <div className="space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="card-elevated">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xl font-bold">{e.category}</p>
              <span className="text-xl font-black text-primary">₪{(e.amount || 0).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>🚗 {e.vehicle_plate}</span>
              <span>👤 {e.driver_name}</span>
              <span>📅 {new Date(e.date).toLocaleDateString('he-IL')}</span>
              <span>🏪 {e.vendor}</span>
            </div>
            {e.notes && <p className="text-sm text-muted-foreground mt-2">{e.notes}</p>}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין הוצאות רשומות</p>
        </div>
      )}
    </div>
  );
}
