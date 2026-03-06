export const ORDERED_STATUSES = [
  'created',
  'sent_to_driver',
  'pending_driver_approval',
  'driver_approved',
  'in_progress',
  'completed',
  'closed',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  created: 'נוצרה',
  sent_to_driver: 'נשלחה לנהג',
  pending_driver_approval: 'ממתינה לאישור נהג',
  driver_approved: 'אושרה ע״י הנהג',
  in_progress: 'בביצוע',
  completed: 'הושלמה',
  closed: 'נסגרה',
};

export const STATUS_COLORS: Record<string, string> = {
  created: 'status-new',
  sent_to_driver: 'status-pending',
  pending_driver_approval: 'status-pending',
  driver_approved: 'status-active',
  in_progress: 'status-urgent',
  completed: 'status-active',
  closed: 'status-inactive',
};
