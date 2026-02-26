import { demoExpenses, expenseCategories } from '@/data/demo-data';
import { FileText, Search, Upload } from 'lucide-react';
import { useState } from 'react';

export default function Documents() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = demoExpenses.filter(e => {
    const matchSearch = e.driverName.includes(search) || e.vehiclePlate.includes(search) || e.vendor.includes(search);
    const matchCat = !filterCategory || e.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="animate-fade-in">
      <h1 className="page-header">מסמכים והוצאות</h1>

      <div className="relative mb-4">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי נהג, רכב או ספק..."
          className="w-full pr-12 p-4 text-lg rounded-xl border-2 border-input bg-background focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${!filterCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          הכל
        </button>
        {expenseCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
            className={`px-5 py-3 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="card-elevated">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText size={28} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xl font-bold">{e.category}</p>
                  <span className="text-xl font-bold text-primary">₪{e.amount.toLocaleString()}</span>
                </div>
                <p className="text-muted-foreground">ספק: {e.vendor} • חשבונית: {e.invoiceNumber}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>🚗 {e.vehiclePlate}</span>
                  <span>👤 {e.driverName}</span>
                  <span>📅 {e.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">אין מסמכים להצגה</p>
        </div>
      )}
    </div>
  );
}
