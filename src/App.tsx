import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Bot,
  UserCheck,
  Stethoscope,
  Phone,
  ShieldCheck,
  Heart,
  MessageSquare,
  Sparkles,
  X,
  Clock,
  MapPin,
  Building2,
  Mail,
} from 'lucide-react';
import { Header } from './components/Header';
import { BookingWizard } from './components/BookingWizard';
import { AIChatBot } from './components/AIChatBot';
import { MedicalRecordsView } from './components/MedicalRecordsView';
import { MyAppointmentsView } from './components/MyAppointmentsView';
import { DoctorsDirectory } from './components/DoctorsDirectory';
import { PaymentModal } from './components/PaymentModal';
import {
  Appointment,
  PatientProfile,
  VitalSignRecord,
} from './types/medical';
import {
  getStoredAppointments,
  getStoredLabs,
  getStoredPatient,
  getStoredPrescriptions,
  getStoredVitals,
  saveStoredAppointments,
  saveStoredPatient,
  saveStoredVitals,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'ai-chat' | 'records' | 'my-appointments' | 'doctors'>('booking');

  // Application persistent state
  const [patient, setPatient] = useState<PatientProfile>(getStoredPatient());
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [vitals, setVitals] = useState<VitalSignRecord[]>(getStoredVitals());
  const [prescriptions] = useState(getStoredPrescriptions());
  const [labs] = useState(getStoredLabs());

  // Booking pre-fills from AI or Doctor directory
  const [preselectedDept, setPreselectedDept] = useState<string>('noi-tong-quat');
  const [preselectedReason, setPreselectedReason] = useState<string>('');

  // Payment Modal state
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null);

  // Floating AI quick-chat widget
  const [isFloatingAIOpen, setIsFloatingAIOpen] = useState<boolean>(false);

  // Handlers
  const handleUpdatePatient = (updated: PatientProfile) => {
    setPatient(updated);
    saveStoredPatient(updated);
  };

  const handleAddVital = (newVital: VitalSignRecord) => {
    const updated = [newVital, ...vitals];
    setVitals(updated);
    saveStoredVitals(updated);
  };

  const handleAppointmentCreated = (newApt: Appointment) => {
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    saveStoredAppointments(updated);
    // Open payment modal right away for seamless online payment
    setPaymentAppointment(newApt);
  };

  const handlePaymentSuccess = (updatedApt: Appointment) => {
    const updated = appointments.map((a) => (a.id === updatedApt.id ? updatedApt : a));
    // If not found in array, add it
    if (!updated.some((a) => a.id === updatedApt.id)) {
      updated.unshift(updatedApt);
    }
    setAppointments(updated);
    saveStoredAppointments(updated);
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn khám này không?')) {
      const updated = appointments.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a));
      setAppointments(updated);
      saveStoredAppointments(updated);
    }
  };

  const handleBookSpecialtyFromAI = (deptId: string, _deptName: string, reason: string) => {
    setPreselectedDept(deptId);
    setPreselectedReason(reason);
    setActiveTab('booking');
    setIsFloatingAIOpen(false);
  };

  const handleSelectDoctorForBooking = (deptId: string, _doctorId: string) => {
    setPreselectedDept(deptId);
    setActiveTab('booking');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Sticky Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patient={patient}
        onOpenBooking={() => setActiveTab('booking')}
        appointmentsCount={appointments.filter((a) => a.status === 'UPCOMING').length}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'booking' && (
          <BookingWizard
            patient={patient}
            initialDepartmentId={preselectedDept}
            initialReason={preselectedReason}
            onAppointmentCreated={handleAppointmentCreated}
            onOpenAIHelp={() => setActiveTab('ai-chat')}
          />
        )}

        {activeTab === 'ai-chat' && (
          <div className="space-y-4">
            <div className="text-center max-w-2xl mx-auto space-y-1 mb-6">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                TRỢ LÝ Y TẾ AI MEDCARE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Tư Vấn Triệu Chứng & Định Hướng Chuyên Khoa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Mô tả bất kỳ cảm giác khó chịu hay triệu chứng nào để được AI phân tích sơ bộ và gợi ý phòng khám thích hợp
              </p>
            </div>
            <AIChatBot
              patient={patient}
              onBookSpecialty={handleBookSpecialtyFromAI}
            />
          </div>
        )}

        {activeTab === 'records' && (
          <MedicalRecordsView
            patient={patient}
            vitals={vitals}
            prescriptions={prescriptions}
            labs={labs}
            onUpdatePatient={handleUpdatePatient}
            onAddVital={handleAddVital}
          />
        )}

        {activeTab === 'my-appointments' && (
          <MyAppointmentsView
            appointments={appointments}
            onOpenPayment={(apt) => setPaymentAppointment(apt)}
            onCancelAppointment={handleCancelAppointment}
            onNewBooking={() => setActiveTab('booking')}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsDirectory
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
          />
        )}
      </main>

      {/* FLOATING AI QUICK CHAT WIDGET (ACCESSIBLE ANYWHERE) */}
      {activeTab !== 'ai-chat' && (
        <div className="fixed bottom-6 right-6 z-40">
          {isFloatingAIOpen ? (
            <div className="w-[92vw] sm:w-[440px] h-[600px] shadow-2xl rounded-3xl overflow-hidden border border-slate-300 animate-in fade-in slide-in-from-bottom-5">
              <AIChatBot
                patient={patient}
                onBookSpecialty={handleBookSpecialtyFromAI}
                isFloatingModal={true}
                onCloseFloating={() => setIsFloatingAIOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setIsFloatingAIOpen(true)}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40"
            >
              <div className="relative">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold leading-none flex items-center gap-1">
                  <span>Bác Sĩ MedCare AI</span>
                  <Sparkles className="w-3 h-3 text-amber-300" />
                </div>
                <div className="text-[10px] text-emerald-100 font-medium leading-tight mt-0.5">
                  Tư vấn triệu chứng 24/7
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ONLINE PAYMENT MODAL */}
      {paymentAppointment && (
        <PaymentModal
          appointment={paymentAppointment}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setPaymentAppointment(null)}
        />
      )}

      {/* Professional Medical Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base text-slate-900">
                  MedCare<span className="text-emerald-600">Plus</span>
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Nền tảng y tế số tiên phong tại Việt Nam, kết nối trực tiếp bệnh nhân với mạng lưới giáo sư, tiến sĩ và các bệnh viện uy tín.
              </p>
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Bảo mật y tế theo chuẩn HIPAA & Bộ Y Tế</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Hệ Thống Cơ Sở Khám</h4>
              <ul className="space-y-1.5 text-slate-500 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>CS 1: 120 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. HCM</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>CS 2: 78 Giải Phóng, Phường Phương Mai, Đống Đa, Hà Nội</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>CS 3: 45 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng</span>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Cổng Thanh Toán Hỗ Trợ</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Tích hợp chuyển khoản tự động VietQR (Vietcombank, MB, BIDV, Techcombank), Ví điện tử MoMo, Cổng VNPay và Thẻ thanh toán quốc tế Visa/Mastercard.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-700">
                <span className="bg-slate-100 px-2 py-0.5 rounded">VietQR</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Ví MoMo</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">VNPay-QR</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded">Visa/Mastercard</span>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Liên Hệ & Cấp Cứu</h4>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tổng đài cấp cứu: <strong className="text-red-600 text-xs">1900 8888</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email hỗ trợ: hotro@medcareplus.vn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Giờ làm việc: 07:00 - 20:30 (Thứ 2 - Chủ Nhật)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>© 2026 MedCare Plus. Giấy phép hoạt động khám chữa bệnh số 492/BYT-GPHĐ.</div>
            <div className="text-center sm:text-right">
              Tuyên bố miễn trừ: Tư vấn AI chỉ mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
