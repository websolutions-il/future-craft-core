// Demo data for Dalia Fleet Management System - Simple test data

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
  { id: '2', username: 'menahel1.hevra1@gmail.com', name: 'מנהל 1', phone: '0100000001', email: 'menahel1.hevra1@gmail.com', role: 'fleet_manager', companyName: 'חברה 1', isActive: true },
  { id: '3', username: 'menahel1.hevra2@gmail.com', name: 'מנהל 2', phone: '0200000001', email: 'menahel1.hevra2@gmail.com', role: 'fleet_manager', companyName: 'חברה 2', isActive: true },
  { id: '4', username: 'nahag1.hevra1@gmail.com', name: 'נהג 1', phone: '0100000011', email: 'nahag1.hevra1@gmail.com', role: 'driver', companyName: 'חברה 1', isActive: true },
  { id: '5', username: 'nahag2.hevra1@gmail.com', name: 'נהג 2', phone: '0100000012', email: 'nahag2.hevra1@gmail.com', role: 'driver', companyName: 'חברה 1', isActive: true },
  { id: '6', username: 'nahag1.hevra2@gmail.com', name: 'נהג 3', phone: '0200000011', email: 'nahag1.hevra2@gmail.com', role: 'driver', companyName: 'חברה 2', isActive: true },
  { id: '7', username: 'nahag2.hevra2@gmail.com', name: 'נהג 4', phone: '0200000012', email: 'nahag2.hevra2@gmail.com', role: 'driver', companyName: 'חברה 2', isActive: true },
];

export const demoVehicles: Vehicle[] = [
  { id: '1', licensePlate: '1000001', manufacturer: 'יצרן 1', model: 'דגם א', year: 2024, vehicleType: 'פרטי', odometer: 10000, status: 'active', assignedDriverName: 'נהג 1', companyName: 'חברה 1', testExpiry: '2026-01-01', insuranceExpiry: '2026-01-01', notes: 'רכב 1 - חברה 1' },
  { id: '2', licensePlate: '1000002', manufacturer: 'יצרן 1', model: 'דגם ב', year: 2023, vehicleType: 'פרטי', odometer: 20000, status: 'active', assignedDriverName: 'נהג 2', companyName: 'חברה 1', testExpiry: '2026-06-01', insuranceExpiry: '2026-06-01', notes: 'רכב 2 - חברה 1' },
  { id: '3', licensePlate: '2000001', manufacturer: 'יצרן 2', model: 'דגם א', year: 2025, vehicleType: 'מסחרי', odometer: 5000, status: 'active', assignedDriverName: 'נהג 3', companyName: 'חברה 2', testExpiry: '2026-01-01', insuranceExpiry: '2026-01-01', notes: 'רכב 3 - חברה 2' },
  { id: '4', licensePlate: '2000002', manufacturer: 'יצרן 2', model: 'דגם ב', year: 2024, vehicleType: 'מסחרי', odometer: 15000, status: 'in_service', companyName: 'חברה 2', testExpiry: '2026-03-01', insuranceExpiry: '2026-03-01', notes: 'רכב 4 - חברה 2' },
];

export const demoDrivers: Driver[] = [
  { id: '1', fullName: 'נהג 1', licenseNumber: '100001', licenseExpiry: '2026-01-01', licenseTypes: ['B פרטי'], email: 'nahag1.hevra1@gmail.com', phone: '0100000011', city: 'עיר 1', street: 'רחוב 1', status: 'active', assignedVehicleId: '1', notes: 'נהג 1 - חברה 1' },
  { id: '2', fullName: 'נהג 2', licenseNumber: '100002', licenseExpiry: '2026-01-01', licenseTypes: ['B פרטי', 'C משאית'], email: 'nahag2.hevra1@gmail.com', phone: '0100000012', city: 'עיר 1', street: 'רחוב 2', status: 'active', assignedVehicleId: '2', notes: 'נהג 2 - חברה 1' },
  { id: '3', fullName: 'נהג 3', licenseNumber: '200001', licenseExpiry: '2026-01-01', licenseTypes: ['B פרטי'], email: 'nahag1.hevra2@gmail.com', phone: '0200000011', city: 'עיר 2', street: 'רחוב 1', status: 'active', assignedVehicleId: '3', notes: 'נהג 3 - חברה 2' },
  { id: '4', fullName: 'נהג 4', licenseNumber: '200002', licenseExpiry: '2026-01-01', licenseTypes: ['B פרטי'], email: 'nahag2.hevra2@gmail.com', phone: '0200000012', city: 'עיר 2', street: 'רחוב 2', status: 'active', assignedVehicleId: '4', notes: 'נהג 4 - חברה 2' },
];

export const demoCustomers: Customer[] = [
  { id: '1', name: 'לקוח 1 חברה 1', contactPerson: 'איש קשר 1', phone: '0100000101', email: 'lakuah1.hevra1@gmail.com', customerType: 'company', status: 'active', createdAt: '2026-01-01', notes: 'לקוח 1 של חברה 1' },
  { id: '2', name: 'לקוח 2 חברה 1', contactPerson: 'איש קשר 2', phone: '0100000102', email: 'lakuah2.hevra1@gmail.com', customerType: 'private', status: 'active', createdAt: '2026-01-01', notes: 'לקוח 2 של חברה 1' },
  { id: '3', name: 'לקוח 1 חברה 2', contactPerson: 'איש קשר 3', phone: '0200000101', email: 'lakuah1.hevra2@gmail.com', customerType: 'company', status: 'active', createdAt: '2026-01-01', notes: 'לקוח 1 של חברה 2' },
];

export const demoRoutes: Route[] = [
  { id: '1', name: 'מסלול 1 חברה 1', origin: 'מוצא 1', destination: 'יעד 1', stops: ['תחנה א'], serviceType: 'daily', daysOfWeek: ['א', 'ב', 'ג'], startTime: '08:00', endTime: '09:00', customerName: 'לקוח 1 חברה 1', driverName: 'נהג 1', vehiclePlate: '1000001', status: 'active', distanceKm: 50 },
  { id: '2', name: 'מסלול 2 חברה 1', origin: 'מוצא 2', destination: 'יעד 2', stops: [], serviceType: 'one_time', daysOfWeek: [], startTime: '10:00', endTime: '11:00', customerName: 'לקוח 2 חברה 1', driverName: 'נהג 2', vehiclePlate: '1000002', status: 'active', distanceKm: 30 },
  { id: '3', name: 'מסלול 1 חברה 2', origin: 'מוצא 3', destination: 'יעד 3', stops: ['תחנה ב', 'תחנה ג'], serviceType: 'daily', daysOfWeek: ['א', 'ב', 'ג', 'ד', 'ה'], startTime: '07:00', endTime: '08:30', customerName: 'לקוח 1 חברה 2', driverName: 'נהג 3', vehiclePlate: '2000001', status: 'active', distanceKm: 40 },
];

export const demoFaults: Fault[] = [
  { id: 'TK-001', date: '2026-02-01', driverName: 'נהג 1', vehiclePlate: '1000001', faultType: 'מנוע', description: 'תקלה 1 - בעיית מנוע', urgency: 'urgent', status: 'new', notes: 'תקלה 1 נהג 1 חברה 1' },
  { id: 'TK-002', date: '2026-02-05', driverName: 'נהג 2', vehiclePlate: '1000002', faultType: 'חשמל', description: 'תקלה 2 - בעיית חשמל', urgency: 'normal', status: 'new', notes: 'תקלה 2 נהג 2 חברה 1' },
  { id: 'TK-003', date: '2026-02-10', driverName: 'נהג 3', vehiclePlate: '2000001', faultType: 'פנצ\'ר', description: 'תקלה 3 - פנצ\'ר', urgency: 'critical', status: 'new', notes: 'תקלה 3 נהג 3 חברה 2' },
];

export const demoExpenses: Expense[] = [
  { id: '1', date: '2026-02-01', driverName: 'נהג 1', vehiclePlate: '1000001', category: 'דלק', vendor: 'תחנת דלק 1', invoiceNumber: 'INV-001', invoiceDate: '2026-02-01', amount: 200, odometer: 10100, paymentMethod: 'fuel_card', notes: 'הוצאה 1 נהג 1 חברה 1' },
  { id: '2', date: '2026-02-10', driverName: 'נהג 3', vehiclePlate: '2000001', category: 'תיקון', vendor: 'מוסך 1', invoiceNumber: 'INV-002', invoiceDate: '2026-02-10', amount: 500, odometer: 5200, paymentMethod: 'credit', notes: 'הוצאה 1 נהג 3 חברה 2' },
];

export const demoAccidents: Accident[] = [
  { id: '1', date: '2026-01-15', vehiclePlate: '1000001', driverName: 'נהג 1', location: 'צומת 1', description: 'תאונה 1 - פגיעה קלה', hasInsurance: true, thirdParty: false, estimatedCost: 1000, status: 'open' },
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
