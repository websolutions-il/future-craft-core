// Demo data for Dalia Fleet Management System

export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  role: 'driver' | 'fleet_manager' | 'super_admin';
  companyName: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  vehicleType: string;
  odometer: number;
  status: 'active' | 'in_service' | 'out_of_service';
  assignedDriverId?: string;
  assignedDriverName?: string;
  companyName: string;
  testExpiry?: string;
  insuranceExpiry?: string;
  notes?: string;
}

export interface Driver {
  id: string;
  fullName: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseTypes: string[];
  email: string;
  phone: string;
  city: string;
  street: string;
  status: 'active' | 'inactive';
  assignedVehicleId?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  customerType: 'company' | 'private';
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: string[];
  serviceType: 'one_time' | 'daily' | 'monthly' | 'fixed';
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  customerId?: string;
  customerName?: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  status: 'active' | 'inactive';
  distanceKm?: number;
}

export interface FaultAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Fault {
  id: string;
  date: string;
  driverName: string;
  vehiclePlate: string;
  faultType: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  notes?: string;
  attachments?: FaultAttachment[];
}

export interface Expense {
  id: string;
  date: string;
  driverName: string;
  vehiclePlate: string;
  category: string;
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  odometer: number;
  paymentMethod: 'credit' | 'cash' | 'fuel_card';
  notes?: string;
  receiptImage?: FaultAttachment;
}

export interface Accident {
  id: string;
  date: string;
  vehiclePlate: string;
  driverName: string;
  location: string;
  description: string;
  hasInsurance: boolean;
  thirdParty: boolean;
  estimatedCost: number;
  status: 'open' | 'in_progress' | 'closed';
}

export const demoUsers: User[] = [
  { id: '1', username: 'orin1607@gmail.com', name: 'יוני אטיאס', phone: '0534338601', email: 'orin1607@gmail.com', role: 'super_admin', companyName: 'מוסך יוני', isActive: true },
  { id: '2', username: 'ilanayoni22@gmail.com', name: 'אילנה אטיאס', phone: '0508420210', email: 'ilanayoni22@gmail.com', role: 'driver', companyName: 'מוסך יוני', isActive: true },
  { id: '3', username: 'yoni191177@gmail.com', name: 'יוסף כהן', phone: '0508420210', email: 'yoni191177@gmail.com', role: 'fleet_manager', companyName: 'מוסך יוני', isActive: true },
  { id: '4', username: 'yomi122222@gmail.com', name: 'משה לוי', phone: '0555555555', email: 'yomi122222@gmail.com', role: 'driver', companyName: 'מוסך יוני', isActive: true },
];

export const demoVehicles: Vehicle[] = [
  { id: '1', licensePlate: '1212121', manufacturer: 'יונדאי', model: 'I20', year: 2024, vehicleType: 'פרטי', odometer: 15230, status: 'active', assignedDriverId: '2', assignedDriverName: 'אילנה אטיאס', companyName: 'מוסך יוני', testExpiry: '2026-06-15', insuranceExpiry: '2026-08-20', notes: '' },
  { id: '2', licensePlate: '3334455', manufacturer: 'טויוטה', model: 'קורולה', year: 2025, vehicleType: 'פרטי', odometer: 5100, status: 'active', assignedDriverId: '4', assignedDriverName: 'משה לוי', companyName: 'מוסך יוני', testExpiry: '2026-09-01', insuranceExpiry: '2026-11-15' },
  { id: '3', licensePlate: '8888888', manufacturer: 'מזדה', model: '3', year: 2023, vehicleType: 'פרטי', odometer: 42000, status: 'in_service', companyName: 'מוסך יוני', testExpiry: '2026-03-10', notes: 'בטיפול תקופתי' },
  { id: '4', licensePlate: '5555555', manufacturer: 'קיה', model: 'ספורטאז\'', year: 2022, vehicleType: 'SUV', odometer: 68500, status: 'active', assignedDriverId: '3', assignedDriverName: 'יוסף כהן', companyName: 'מוסך יוני' },
];

export const demoDrivers: Driver[] = [
  { id: '1', fullName: 'יוני אטיאס', licenseNumber: '8966', licenseExpiry: '2028-12-01', licenseTypes: ['C משאית', 'D אוטובוס'], email: 'orin1607@gmail.com', phone: '0534338601', city: 'חולון', street: 'גרינברג 9', status: 'active' },
  { id: '2', fullName: 'אילנה אטיאס', licenseNumber: '555555', licenseExpiry: '2027-05-25', licenseTypes: ['A אופנוע'], email: 'ilanayoni22@gmail.com', phone: '0508420210', city: 'חולון', street: 'רחוב הנרקיסים 3', status: 'active', assignedVehicleId: '1' },
  { id: '3', fullName: 'יוסף כהן', licenseNumber: '123456', licenseExpiry: '2027-10-15', licenseTypes: ['B פרטי', 'C משאית'], email: 'yoni191177@gmail.com', phone: '0508420210', city: 'רחובות', street: 'הרצל 45', status: 'active', assignedVehicleId: '4' },
  { id: '4', fullName: 'משה לוי', licenseNumber: '789012', licenseExpiry: '2028-03-20', licenseTypes: ['B פרטי'], email: 'yomi122222@gmail.com', phone: '0555555555', city: 'תל אביב', street: 'דיזנגוף 100', status: 'active', assignedVehicleId: '2' },
];

export const demoCustomers: Customer[] = [
  { id: '1', name: 'חברת אלפא הסעות', contactPerson: 'דני כהן', phone: '03-5551234', email: 'info@alpha.co.il', customerType: 'company', status: 'active', createdAt: '2025-01-15', notes: 'לקוח VIP' },
  { id: '2', name: 'בית ספר אורט', contactPerson: 'מיכל לוי', phone: '03-5559876', email: 'michal@ort.org.il', customerType: 'company', status: 'active', createdAt: '2025-03-20' },
  { id: '3', name: 'דוד ישראלי', contactPerson: 'דוד ישראלי', phone: '050-1234567', email: 'david@gmail.com', customerType: 'private', status: 'active', createdAt: '2025-06-10' },
  { id: '4', name: 'מפעלי ים המלח', contactPerson: 'רחל שמעוני', phone: '08-6543210', email: 'rachel@deadsea.co.il', customerType: 'company', status: 'inactive', createdAt: '2024-11-05', notes: 'הסכם הושהה' },
];

export const demoRoutes: Route[] = [
  { id: '1', name: 'תל אביב - חיפה בוקר', origin: 'תל אביב, תחנה מרכזית', destination: 'חיפה, מרכזית', stops: ['הרצליה', 'נתניה', 'חדרה'], serviceType: 'daily', daysOfWeek: ['א', 'ב', 'ג', 'ד', 'ה'], startTime: '07:00', endTime: '09:30', customerId: '1', customerName: 'חברת אלפא הסעות', driverId: '2', driverName: 'אילנה אטיאס', vehicleId: '1', vehiclePlate: '1212121', status: 'active', distanceKm: 95 },
  { id: '2', name: 'הסעת תלמידים בוקר', origin: 'שכונת רמות, ירושלים', destination: 'בית ספר אורט, ירושלים', stops: ['גבעת שאול', 'בית הכרם'], serviceType: 'daily', daysOfWeek: ['א', 'ב', 'ג', 'ד', 'ה'], startTime: '07:30', endTime: '08:15', customerId: '2', customerName: 'בית ספר אורט', driverId: '4', driverName: 'משה לוי', vehicleId: '2', vehiclePlate: '3334455', status: 'active', distanceKm: 12 },
  { id: '3', name: 'שינוע חד פעמי באר שבע', origin: 'תל אביב', destination: 'באר שבע', stops: [], serviceType: 'one_time', daysOfWeek: [], startTime: '10:00', endTime: '12:00', customerId: '3', customerName: 'דוד ישראלי', status: 'active', distanceKm: 110 },
];

export const demoFaults: Fault[] = [
  { id: 'ID-634860', date: '2026-02-08', driverName: 'אורין', vehiclePlate: '123456879', faultType: 'פנצ\'ר', description: 'פנצ\'ר בגלגל קדמי ימני', urgency: 'urgent', status: 'new', notes: '' },
  { id: 'ID-582270', date: '2026-02-09', driverName: 'מישל', vehiclePlate: '8888888', faultType: 'חשמל', description: 'תקלת חשמל - אורות לא עובדים', urgency: 'normal', status: 'new' },
  { id: 'ID-534189', date: '2026-02-16', driverName: 'יוני', vehiclePlate: '5555555', faultType: 'חשמל', description: 'בעיה במערכת חשמל', urgency: 'urgent', status: 'new' },
  { id: 'ID-990348', date: '2026-02-16', driverName: 'יוסף', vehiclePlate: '5555555', faultType: 'חשמל', description: 'תקלה חשמלית חוזרת', urgency: 'critical', status: 'new' },
];

export const demoExpenses: Expense[] = [
  { id: '1', date: '2026-02-10', driverName: 'יוני אטיאס', vehiclePlate: '1212121', category: 'דלק', vendor: 'פז', invoiceNumber: 'INV-001', invoiceDate: '2026-02-10', amount: 350, odometer: 15200, paymentMethod: 'fuel_card' },
  { id: '2', date: '2026-02-12', driverName: 'אילנה אטיאס', vehiclePlate: '3334455', category: 'תיקון', vendor: 'מוסך המרכז', invoiceNumber: 'INV-002', invoiceDate: '2026-02-12', amount: 1200, odometer: 5050, paymentMethod: 'credit' },
  { id: '3', date: '2026-02-15', driverName: 'משה לוי', vehiclePlate: '8888888', category: 'דלק', vendor: 'סונול', invoiceNumber: 'INV-003', invoiceDate: '2026-02-15', amount: 280, odometer: 41800, paymentMethod: 'cash' },
];

export const demoAccidents: Accident[] = [
  { id: '1', date: '2026-02-05', vehiclePlate: '1212121', driverName: 'אילנה אטיאס', location: 'כביש 4 צומת גלילות', description: 'פגיעה קלה בפגוש אחורי', hasInsurance: true, thirdParty: true, estimatedCost: 3500, status: 'in_progress' },
];

export const faultTypes = ['מנוע', 'חשמל', 'פנצ\'ר', 'מיזוג', 'אחר'];
export const urgencyLevels = ['normal', 'urgent', 'critical'] as const;
export const expenseCategories = ['דלק', 'תיקון', 'רכישה', 'ביטוח', 'טסט', 'אחר'];
export const serviceTypes = { one_time: 'חד פעמי', daily: 'יומי', monthly: 'חודשי', fixed: 'קבוע' };

export const roleLabels: Record<string, string> = {
  driver: 'נהג',
  fleet_manager: 'מנהל צי',
  super_admin: 'מנהל על',
};
