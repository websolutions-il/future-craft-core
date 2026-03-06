export const ORDERED_STATUSES = [
  'created',
  'pending_approval',
  'driver_approved',
  'customer_approved',
  'approved',
  'in_progress',
  'completed',
  'rejected',
  'revision',
  'closed',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  created: 'נוצר',
  pending_approval: 'ממתין לאישור',
  driver_approved: 'אושר ע״י נהג',
  customer_approved: 'אושר ע״י לקוח',
  approved: 'מאושר',
  in_progress: 'בביצוע',
  completed: 'הושלם',
  rejected: 'נדחה',
  revision: 'בתיקון',
  closed: 'נסגר',
};

export const STATUS_COLORS: Record<string, string> = {
  created: 'status-new',
  pending_approval: 'status-pending',
  driver_approved: 'status-pending',
  customer_approved: 'status-pending',
  approved: 'status-active',
  in_progress: 'status-urgent',
  completed: 'status-active',
  rejected: 'status-inactive',
  revision: 'status-pending',
  closed: 'status-inactive',
};
