import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Users, Shield, KeyRound, Loader2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface ManagedUser {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  is_active: boolean;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'מנהל על',
  fleet_manager: 'מנהל צי',
  driver: 'נהג',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-destructive/10 text-destructive border-destructive/30',
  fleet_manager: 'bg-primary/10 text-primary border-primary/30',
  driver: 'bg-muted text-muted-foreground border-border',
};

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, phone, company_name, is_active');

    if (profErr) {
      toast({ title: 'שגיאה', description: 'לא ניתן לטעון משתמשים', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));

    const mapped: ManagedUser[] = (profiles || []).map((p) => ({
      id: p.id,
      full_name: p.full_name || '',
      email: '',
      company_name: p.company_name || '',
      phone: p.phone || '',
      is_active: p.is_active ?? true,
      role: roleMap.get(p.id) || 'driver',
    }));

    setUsers(mapped);
    setLoading(false);
  };

  const companies = useMemo(() => {
    const set = new Set(users.map((u) => u.company_name).filter(Boolean));
    return Array.from(set).sort();
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.company_name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchCompany = companyFilter === 'all' || u.company_name === companyFilter;
      return matchSearch && matchCompany;
    });
  }, [users, search, companyFilter]);

  const openResetDialog = (u: ManagedUser) => {
    setSelectedUser(u);
    setNewPassword('');
    setResetDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast({ title: 'שגיאה', description: 'סיסמה חייבת להכיל לפחות 6 תווים', variant: 'destructive' });
      return;
    }
    setResetting(true);
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: { action: 'reset-password-by-id', user_id: selectedUser.id, password: newPassword },
    });
    setResetting(false);
    if (error || data?.error) {
      toast({ title: 'שגיאה', description: data?.error || 'לא ניתן לאפס סיסמה', variant: 'destructive' });
      return;
    }
    toast({ title: '✅ סיסמה אופסה', description: `הסיסמה של ${selectedUser.full_name} עודכנה בהצלחה` });
    setResetDialogOpen(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: { action: 'update-role', user_id: userId, role: newRole },
    });
    if (error || data?.error) {
      toast({ title: 'שגיאה', description: data?.error || 'לא ניתן לעדכן תפקיד', variant: 'destructive' });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast({ title: '✅ תפקיד עודכן', description: `התפקיד שונה ל${ROLE_LABELS[newRole] || newRole}` });
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const newActive = !currentActive;
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: { action: 'toggle-active', user_id: userId, is_active: newActive },
    });
    if (error || data?.error) {
      toast({ title: 'שגיאה', description: data?.error || 'לא ניתן לעדכן סטטוס', variant: 'destructive' });
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: newActive } : u)));
    toast({ title: newActive ? '✅ חשבון הופעל' : '⛔ חשבון הושבת', description: `המשתמש ${newActive ? 'הופעל' : 'הושבת'} בהצלחה` });
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="text-center py-12">
        <Shield size={48} className="mx-auto mb-4 text-destructive" />
        <p className="text-lg font-bold text-foreground">אין לך הרשאה לצפות בעמוד זה</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Users size={24} className="text-primary" />
          ניהול משתמשים
        </h1>
        <Badge variant="outline" className="text-sm">{filtered.length} משתמשים</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם, חברה או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter size={14} className="ml-2" />
            <SelectValue placeholder="כל החברות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל החברות</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={32} className="mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">טוען משתמשים...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">חברה</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">תפקיד</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    לא נמצאו משתמשים
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold text-foreground">{u.full_name || '—'}</TableCell>
                    <TableCell>{u.company_name || '—'}</TableCell>
                    <TableCell dir="ltr" className="text-right">{u.phone || '—'}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="driver">{ROLE_LABELS.driver}</SelectItem>
                          <SelectItem value="fleet_manager">{ROLE_LABELS.fleet_manager}</SelectItem>
                          <SelectItem value="super_admin">{ROLE_LABELS.super_admin}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={u.is_active}
                          onCheckedChange={() => handleToggleActive(u.id, u.is_active)}
                        />
                        <span className={`text-xs font-bold ${u.is_active ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                          {u.is_active ? 'פעיל' : 'מושבת'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openResetDialog(u)}
                        className="gap-1.5"
                      >
                        <KeyRound size={14} />
                        איפוס סיסמה
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={18} className="text-primary" />
              איפוס סיסמה – {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">סיסמה חדשה</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleResetPassword} disabled={resetting || newPassword.length < 6}>
              {resetting ? <Loader2 size={14} className="animate-spin ml-2" /> : <KeyRound size={14} className="ml-2" />}
              אפס סיסמה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
