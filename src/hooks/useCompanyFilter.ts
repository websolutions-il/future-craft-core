import { useAuth } from '@/contexts/AuthContext';
import { useCompanyScope } from '@/contexts/CompanyScopeContext';

/**
 * Returns the company_name to filter by.
 * - If user is impersonating, returns the impersonated user's company.
 * - If user is a regular fleet_manager or driver, returns their company.
 * - If user is super_admin (not impersonating):
 *   - If a company is selected in the scope dropdown, returns that company.
 *   - Otherwise returns null (see all).
 */
export function useCompanyFilter(): string | null {
  const { user, realUser, isImpersonating } = useAuth();
  const { selectedCompany } = useCompanyScope();

  if (isImpersonating) {
    return user?.company_name || null;
  }

  if (user?.role === 'super_admin') {
    return selectedCompany; // null = see all, or filtered to selected company
  }

  return user?.company_name || null;
}

/**
 * Apply company filter to a supabase query builder.
 * If companyFilter is null, no filter is applied (super admin sees all).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyCompanyScope(query: any, companyFilter: string | null) {
  if (companyFilter) {
    return query.eq('company_name', companyFilter);
  }
  return query;
}
