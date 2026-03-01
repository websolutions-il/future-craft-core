import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CompanyOption {
  name: string;
  businessId: string;
}

interface CompanyScopeContextType {
  /** The currently selected company filter for super_admin. null = show all */
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  companyOptions: CompanyOption[];
  loadingCompanies: boolean;
}

const CompanyScopeContext = createContext<CompanyScopeContextType>({
  selectedCompany: null,
  setSelectedCompany: () => {},
  companyOptions: [],
  loadingCompanies: false,
});

export const useCompanyScope = () => useContext(CompanyScopeContext);

export const CompanyScopeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      setCompanyOptions([]);
      setSelectedCompany(null);
      return;
    }

    const load = async () => {
      setLoadingCompanies(true);
      const [profilesRes, customersRes] = await Promise.all([
        supabase.from('profiles').select('company_name'),
        supabase.from('customers').select('company_name, business_id'),
      ]);

      const companies = Array.from(
        new Set(
          (profilesRes.data || [])
            .map(r => r.company_name?.trim())
            .filter((c): c is string => Boolean(c))
        )
      );

      const customerMap = new Map<string, string>();
      (customersRes.data || []).forEach(c => {
        if (c.company_name?.trim()) {
          customerMap.set(c.company_name.trim(), c.business_id?.trim() || '');
        }
      });

      setCompanyOptions(companies.map(name => ({ name, businessId: customerMap.get(name) || '' })));
      setLoadingCompanies(false);
    };

    load();
  }, [user?.role, user?.id]);

  return (
    <CompanyScopeContext.Provider value={{ selectedCompany, setSelectedCompany, companyOptions, loadingCompanies }}>
      {children}
    </CompanyScopeContext.Provider>
  );
};
