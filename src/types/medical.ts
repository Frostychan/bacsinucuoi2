export type ConsultationType = 'HOSPITAL' | 'ONLINE_VIDEO' | 'HOME_VISIT';

export type PaymentMethodType = 'VIETQR' | 'MOMO' | 'VNPAY' | 'CREDIT_CARD';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type AppointmentStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface Doctor {
  id: string;
  name: string;
  title: string; // PGS.TS, BSCKII, ThS.BS, etc.
  departmentId: string;
  departmentName: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  bio: string;
  specialties: string[];
  priceHospital: number;
  priceOnline: number;
  priceHome: number;
  availableDays: string[]; // ['Monday', 'Tuesday', ...]
  timeSlots: string[]; // ['08:00', '08:30', ...]
}

export interface Department {
  id: string;
  name: string;
  iconName: string;
  description: string;
  commonSymptoms: string[];
  doctorsCount: number;
  color: string;
}

export interface Appointment {
  id: string;
  code: string;
  patientName: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  cccd?: string;
  insuranceCardNumber?: string;
  symptoms: string;
  consultationType: ConsultationType;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorTitle: string;
  doctorAvatar: string;
  hospital: string;
  appointmentDate: string;
  timeSlot: string;
  fee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  transactionRef?: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string;
  aiTriageSummary?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
  usageInstruction: string;
  timing: {
    morning?: boolean;
    noon?: boolean;
    evening?: boolean;
    night?: boolean;
  };
}

export interface Prescription {
  id: string;
  code: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medications: MedicationItem[];
  doctorAdvice: string;
  recheckDate?: string;
}

export interface LabResult {
  id: string;
  code: string;
  testName: string;
  category: 'Xét nghiệm máu' | 'Sinh hóa' | 'Chẩn đoán hình ảnh' | 'Nước tiểu' | 'Khác';
  date: string;
  orderedByDoctor: string;
  resultSummary: string;
  status: 'NORMAL' | 'ATTENTION' | 'ABNORMAL';
  detailedParameters?: {
    param: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal?: boolean;
  }[];
  attachmentUrl?: string;
}

export interface VitalSignRecord {
  id: string;
  date: string;
  systolicBP: number; // Tâm thu
  diastolicBP: number; // Tâm trương
  heartRate: number; // bpm
  bloodSugar: number; // mg/dL
  spo2: number; // %
  weight: number; // kg
  height: number; // cm
  temperature: number; // °C
  notes?: string;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  relation: 'Bản thân' | 'Bố' | 'Mẹ' | 'Con' | 'Người thân';
  phone: string;
  email: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  address: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height: number; // cm
  weight: number; // kg
  cccd: string;
  insuranceNumber: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  urgency?: 'NORMAL' | 'RECOMMENDED_SOON' | 'EMERGENCY';
  suggestedDepartment?: string;
  suggestedAction?: string;
}
