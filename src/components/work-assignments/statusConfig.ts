export const ORDERED_STATUSES = [
  'created',
  'sent_for_approval',
  'pending_driver_approval',
  'pending_manager_approval',
  'approved',
  'active',
  'in_progress',
  'completed',
  'rejected',
  'revision',
  'closed',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  created: 'נוצר',
  sent_for_approval: 'נשלח לאישור',
  pending_driver_approval: 'ממתין לאישור נהג',
  pending_manager_approval: 'ממתין לאישור מנהל צי',
  approved: 'אושר ע״י שני הצדדים',
  active: 'פעיל',
  in_progress: 'בביצוע',
  completed: 'הושלם',
  rejected: 'נדחה',
  revision: 'בתיקון',
  closed: 'נסגר',
};

export const STATUS_COLORS: Record<string, string> = {
  created: 'status-new',
  sent_for_approval: 'status-pending',
  pending_driver_approval: 'status-pending',
  pending_manager_approval: 'status-pending',
  approved: 'status-active',
  active: 'status-active',
  in_progress: 'status-urgent',
  completed: 'status-active',
  rejected: 'status-inactive',
  revision: 'status-pending',
  closed: 'status-inactive',
};
