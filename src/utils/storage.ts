import { Appointment, LabResult, PatientProfile, Prescription, VitalSignRecord } from '../types/medical';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_LAB_RESULTS,
  INITIAL_PATIENT,
  INITIAL_PRESCRIPTIONS,
  INITIAL_VITAL_SIGNS,
} from '../data/mockData';

const KEYS = {
  PATIENT: 'medcare_patient_profile_v1',
  APPOINTMENTS: 'medcare_appointments_v1',
  VITALS: 'medcare_vitals_v1',
  PRESCRIPTIONS: 'medcare_prescriptions_v1',
  LABS: 'medcare_labs_v1',
};

export const getStoredPatient = (): PatientProfile => {
  try {
    const data = localStorage.getItem(KEYS.PATIENT);
    return data ? JSON.parse(data) : INITIAL_PATIENT;
  } catch {
    return INITIAL_PATIENT;
  }
};

export const saveStoredPatient = (patient: PatientProfile): void => {
  try {
    localStorage.setItem(KEYS.PATIENT, JSON.stringify(patient));
  } catch (err) {
    console.error('Lỗi lưu thông tin bệnh nhân:', err);
  }
};

export const getStoredAppointments = (): Appointment[] => {
  try {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveStoredAppointments = (appointments: Appointment[]): void => {
  try {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  } catch (err) {
    console.error('Lỗi lưu lịch hẹn:', err);
  }
};

export const getStoredVitals = (): VitalSignRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.VITALS);
    return data ? JSON.parse(data) : INITIAL_VITAL_SIGNS;
  } catch {
    return INITIAL_VITAL_SIGNS;
  }
};

export const saveStoredVitals = (vitals: VitalSignRecord[]): void => {
  try {
    localStorage.setItem(KEYS.VITALS, JSON.stringify(vitals));
  } catch (err) {
    console.error('Lỗi lưu chỉ số sinh tồn:', err);
  }
};

export const getStoredPrescriptions = (): Prescription[] => {
  try {
    const data = localStorage.getItem(KEYS.PRESCRIPTIONS);
    return data ? JSON.parse(data) : INITIAL_PRESCRIPTIONS;
  } catch {
    return INITIAL_PRESCRIPTIONS;
  }
};

export const saveStoredPrescriptions = (prescriptions: Prescription[]): void => {
  try {
    localStorage.setItem(KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  } catch (err) {
    console.error('Lỗi lưu đơn thuốc:', err);
  }
};

export const getStoredLabs = (): LabResult[] => {
  try {
    const data = localStorage.getItem(KEYS.LABS);
    return data ? JSON.parse(data) : INITIAL_LAB_RESULTS;
  } catch {
    return INITIAL_LAB_RESULTS;
  }
};

export const saveStoredLabs = (labs: LabResult[]): void => {
  try {
    localStorage.setItem(KEYS.LABS, JSON.stringify(labs));
  } catch (err) {
    console.error('Lỗi lưu kết quả xét nghiệm:', err);
  }
};

// Formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateBmi = (weightKg: number, heightCm: number) => {
  if (!weightKg || !heightCm) return { bmi: 0, label: 'Chưa đủ dữ liệu', color: 'text-gray-500', bg: 'bg-gray-100' };
  const heightM = heightCm / 100;
  const bmiVal = Number((weightKg / (heightM * heightM)).toFixed(1));

  // Asian-specific BMI standards (WHO WPRO)
  if (bmiVal < 18.5) {
    return { bmi: bmiVal, label: 'Thiếu cân (Gầy)', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  } else if (bmiVal < 23) {
    return { bmi: bmiVal, label: 'Cân đối (Lý tưởng)', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  } else if (bmiVal < 25) {
    return { bmi: bmiVal, label: 'Thừa cân (Tiền béo phì)', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
  } else if (bmiVal < 30) {
    return { bmi: bmiVal, label: 'Béo phì độ 1', color: 'text-red-500', bg: 'bg-red-50 border-red-200' };
  } else {
    return { bmi: bmiVal, label: 'Béo phì độ 2 (Nguy cơ cao)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
  }
};

export const classifyBloodPressure = (systolic: number, diastolic: number) => {
  if (systolic < 120 && diastolic < 80) {
    return { status: 'Tối ưu / Lý tưởng', color: 'text-emerald-700', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' };
  }
  if (systolic <= 129 && diastolic < 80) {
    return { status: 'Bình thường', color: 'text-teal-700', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-800' };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { status: 'Tiền tăng huyết áp', color: 'text-amber-700', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800' };
  }
  if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
    return { status: 'Tăng HA độ 1', color: 'text-orange-700', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-800' };
  }
  return { status: 'Tăng HA độ 2 (Cần can thiệp)', color: 'text-rose-700', bg: 'bg-rose-50', badge: 'bg-rose-100 text-rose-800' };
};
