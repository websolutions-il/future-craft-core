import React, { useState } from 'react';
import { Eye, EyeOff, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AppRole } from '@/contexts/AuthContext';

interface CreateUserFormState {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName: string;
  role: AppRole;
  isActive: boolean;
  userNumber: string;
}

interface CreateUserModalProps {
  form: CreateUserFormState;
  setForm: React.Dispatch<React.SetStateAction<CreateUserFormState>>;
  showCreatePassword: boolean;
  setShowCreatePassword: (v: boolean) => void;
  createCompanyOptions: { name: string; businessId: string }[];
  createCompanyPickerOpen: boolean;
  setCreateCompanyPickerOpen: (v: boolean) => void;
  creatingUser: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  callerRole: 'super_admin' | 'fleet_manager';
  onCompanyCreated?: (name: string) => void;
}

export default function CreateUserModal({
  form, setForm, showCreatePassword, setShowCreatePassword,
  createCompanyOptions, createCompanyPickerOpen, setCreateCompanyPickerOpen,
  creatingUser, onSubmit, onClose, callerRole, onCompanyCreated,
}: CreateUserModalProps) {
  const isSuperAdmin = callerRole === 'super_admin';
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerBusinessId, setNewCustomerBusinessId] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      toast({ title: 'שגיאה', description: 'יש למלא שם חברה', variant: 'destructive' });
      return;
    }
    setCreatingCustomer(true);
    const { error } = await supabase.from('customers').insert({
      name: newCustomerName.trim(),
      company_name: newCustomerName.trim(),
      business_id: newCustomerBusinessId.trim() || null,
    });
    setCreatingCustomer(false);
    if (error) {
      toast({ title: 'שגיאה', description: 'לא ניתן ליצור חברה', variant: 'destructive' });
      return;
    }
    toast({ title: '✅ חברה נוצרה', description: `${newCustomerName} נוספה בהצלחה` });
    onCompanyCreated?.(newCustomerName.trim());
    setNewCustomerName('');
    setNewCustomerBusinessId('');
    setShowNewCustomerDialog(false);
  };

  const inputClass = "w-full p-3 rounded-xl border border-input bg-background text-right";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg p-5">
          <h2 className="text-xl font-bold mb-4">פתיחת משתמש חדש</h2>
          {!isSuperAdmin && (
            <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700 dark:text-amber-300">
              ⚠️ המשתמש ייווצר בסטטוס "ממתין לאישור". רק מנהל על יוכל לאשר ולהפעיל אותו.
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto">
            <input
              value={form.userNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, userNumber: e.target.value }))}
              placeholder="מספר משתמש (מזהה ייחודי)"
              className={inputClass}
            />
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="שם מלא"
              className={inputClass}
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="אימייל"
              className={cn(inputClass, "text-left")}
              dir="ltr"
              required
            />
            <div className="relative">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="סיסמה"
                className={cn(inputClass, "pl-10")}
                required
              />
              <button type="button" onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="מספר טלפון"
              className={cn(inputClass, "text-left")}
              dir="ltr"
            />

            {/* Company picker - hidden for private customers */}
            {form.role !== 'private_customer' ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  {isSuperAdmin ? (
                    <Popover open={createCompanyPickerOpen} onOpenChange={setCreateCompanyPickerOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full p-3 rounded-xl border border-input bg-background flex items-center justify-between text-right"
                        >
                          <ChevronsUpDown size={16} className="text-muted-foreground shrink-0" />
                          <span className="flex-1 text-right">
                            {form.companyName || 'בחר חברה...'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[60]" align="start">
                        <Command dir="rtl">
                          <CommandInput placeholder="חיפוש חברה..." />
                          <CommandList>
                            <CommandEmpty>לא נמצאו חברות</CommandEmpty>
                            <CommandGroup>
                              {createCompanyOptions.map((option) => (
                                <CommandItem
                                  key={option.name}
                                  value={`${option.name} ${option.businessId}`}
                                  onSelect={() => {
                                    setForm((prev) => ({ ...prev, companyName: option.name }));
                                    setCreateCompanyPickerOpen(false);
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <Check size={16} className={cn("shrink-0", form.companyName === option.name ? "opacity-100" : "opacity-0")} />
                                  <div className="flex-1 text-right">
                                    <span className="font-medium">{option.name}</span>
                                    {option.businessId && (
                                      <span className="text-xs text-muted-foreground mr-2">({option.businessId})</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="w-full p-3 rounded-xl border border-input bg-muted text-right text-muted-foreground">
                      {form.companyName || 'החברה שלך'}
                    </div>
                  )}
                </div>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerDialog(true)}
                    className="p-3 rounded-xl border border-input bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 whitespace-nowrap text-sm font-bold"
                  >
                    <Plus size={16} />
                    לקוח חדש
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full p-3 rounded-xl border border-input bg-muted/50 text-right text-muted-foreground text-sm">
                👤 לקוח פרטי – ללא שיוך לחברה
              </div>
            )}

            <select
              value={form.role}
              onChange={(e) => {
                const role = e.target.value as AppRole;
                setForm((prev) => ({
                  ...prev,
                  role,
                  // Clear company for private customers
                  companyName: role === 'private_customer' ? '' : prev.companyName,
                }));
              }}
              className={inputClass}
            >
              <option value="fleet_manager">מנהל צי</option>
              <option value="driver">נהג</option>
              <option value="private_customer">לקוח פרטי</option>
              {isSuperAdmin && <option value="super_admin">מנהל על</option>}
            </select>

            {/* Active toggle - only for super_admin */}
            {isSuperAdmin && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-input bg-background">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-bold transition-colors",
                    form.isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {form.isActive ? 'כן' : 'לא'}
                </button>
                <span className="font-medium">משתמש פעיל</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-input bg-background"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={creatingUser}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60"
              >
                {creatingUser ? 'יוצר...' : 'צור משתמש'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Customer Dialog - super_admin only */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת לקוח / חברה חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">שם חברה *</label>
              <input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="שם החברה"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ח.פ / מספר עוסק</label>
              <input
                value={newCustomerBusinessId}
                onChange={(e) => setNewCustomerBusinessId(e.target.value)}
                placeholder="מספר עוסק"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={handleCreateCustomer}
              disabled={creatingCustomer}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60"
            >
              {creatingCustomer ? 'יוצר...' : '✅ צור חברה'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { CreateUserFormState };
