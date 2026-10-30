import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Check,
  Video,
  Home,
  Building,
  Star,
  Search,
  Sparkles,
  Phone,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { DEPARTMENTS, DOCTORS } from '../data/mockData';
import { Appointment, ConsultationType, Department, Doctor, PatientProfile, PaymentMethodType } from '../types/medical';
import { formatCurrency } from '../utils/storage';

interface BookingWizardProps {
  patient: PatientProfile;
  initialDepartmentId?: string;
  initialReason?: string;
  onAppointmentCreated: (appointment: Appointment) => void;
  onOpenAIHelp: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  patient,
  initialDepartmentId,
  initialReason,
  onAppointmentCreated,
  onOpenAIHelp,
}) => {
  const [step, setStep] = useState<number>(1);
  const [consultationType, setConsultationType] = useState<ConsultationType>('HOSPITAL');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDepartmentId || 'noi-tong-quat');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [deptSearch, setDeptSearch] = useState<string>('');

  // Generate next 7 days for booking
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<{ dayName: string; dateStr: string; displayDate: string }[]>([]);

  // Patient booking form info
  const [bookingFor, setBookingFor] = useState<'SELF' | 'FAMILY'>('SELF');
  const [patientName, setPatientName] = useState(patient.fullName);
  const [patientPhone, setPatientPhone] = useState(patient.phone);
  const [patientDob, setPatientDob] = useState(patient.birthDate);
  const [patientGender, setPatientGender] = useState<'Nam' | 'Nữ' | 'Khác'>(patient.gender);
  const [patientInsurance, setPatientInsurance] = useState(patient.insuranceNumber);
  const [useInsurance, setUseInsurance] = useState(true);
  const [symptoms, setSymptoms] = useState(initialReason || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('VIETQR');

  // Initialize available dates (today + next 6 days)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;
      const displayDate = `${date}/${month}`;
      dates.push({ dayName, dateStr, displayDate });
    }
    setAvailableDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[1].dateStr); // Default to tomorrow
    }
  }, []);

  // Update initial dept or reason if changed externally (e.g. from AI triage)
  useEffect(() => {
    if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
    }
    if (initialReason) {
      setSymptoms(initialReason);
    }
  }, [initialDepartmentId, initialReason]);

  // Selected Department & Doctor objects
  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  const doctorsInDept = DOCTORS.filter((d) => d.departmentId === selectedDeptId);
  const currentDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || doctorsInDept[0] || DOCTORS[0];

  // Auto select first doctor in department if not selected
  useEffect(() => {
    if (doctorsInDept.length > 0) {
      setSelectedDoctorId(doctorsInDept[0].id);
      if (doctorsInDept[0].timeSlots.length > 0) {
        setSelectedTimeSlot(doctorsInDept[0].timeSlots[0]);
      }
    }
  }, [selectedDeptId]);

  // Calculate pricing
  const getBaseFee = () => {
    if (!currentDoctor) return 300000;
    if (consultationType === 'ONLINE_VIDEO') return currentDoctor.priceOnline;
    if (consultationType === 'HOME_VISIT') return currentDoctor.priceHome;
    return currentDoctor.priceHospital;
  };

  const baseFee = getBaseFee();
  const insuranceDiscount = useInsurance ? 50000 : 0;
  const totalAmount = Math.max(baseFee - insuranceDiscount, 0);

  const filteredDepts = DEPARTMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.commonSymptoms.some((s) => s.toLowerCase().includes(deptSearch.toLowerCase()))
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appointmentCode = `MED-2026-${randomSuffix}`;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      code: appointmentCode,
      patientName: patientName.trim() || patient.fullName,
      phone: patientPhone.trim() || patient.phone,
      email: patient.email,
      birthDate: patientDob || patient.birthDate,
      gender: patientGender,
      insuranceCardNumber: useInsurance ? patientInsurance : undefined,
      symptoms: symptoms.trim() || 'Khám kiểm tra sức khỏe theo chuyên khoa',
      consultationType,
      departmentId: currentDept.id,
      departmentName: currentDept.name,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorTitle: currentDoctor.title,
      doctorAvatar: currentDoctor.avatar,
      hospital:
        consultationType === 'ONLINE_VIDEO'
          ? 'Tư vấn Video Call qua ứng dụng MedCare'
          : consultationType === 'HOME_VISIT'
          ? `Bác sĩ đến tận nhà: ${patient.address}`
          : currentDoctor.hospital,
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot || '08:30',
      fee: baseFee,
      discount: insuranceDiscount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PENDING',
      status: 'UPCOMING',
      createdAt: new Date().toISOString().split('T')[0],
      aiTriageSummary: initialReason ? `Định hướng AI: ${initialReason}` : undefined,
    };

    onAppointmentCreated(newAppointment);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner & AI Recommendation Assist */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Stethoscope className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Quy Trình Đặt Lịch Nhanh Chuẩn Y Khoa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Đặt Lịch Khám Bệnh Trực Tuyến
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Chọn bác sĩ đầu ngành từ các bệnh viện lớn, chọn giờ khám không chờ đợi, thanh toán trực tuyến thuận tiện qua VietQR/MoMo và lưu trữ trọn đời hồ sơ bệnh án.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAIHelp}
              className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Chưa rõ bệnh gì? Hỏi Trợ Lý MedCare AI ngay</span>
            </button>
            <span className="text-xs text-emerald-200">✨ Tư vấn triệu chứng & gợi ý chuyên khoa miễn phí</span>
          </div>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Hình Thức' },
            { num: 2, label: 'Chuyên Khoa' },
            { num: 3, label: 'Bác Sĩ' },
            { num: 4, label: 'Ngày & Giờ' },
            { num: 5, label: 'Bệnh Nhân' },
          ].map((st) => (
            <div key={st.num} className="flex items-center">
              <button
                onClick={() => setStep(st.num)}
                className="flex flex-col sm:flex-row items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === st.num
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                      : step > st.num
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > st.num ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step === st.num ? 'text-emerald-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {st.label}
                </span>
              </button>
              {st.num < 5 && <div className="hidden sm:block w-8 sm:w-16 h-0.5 bg-slate-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Booking Container */}
      <form onSubmit={handleBookingSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
        {/* STEP 1: CONSULTATION TYPE */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  1
                </span>
                Chọn Hình Thức Khám Bệnh
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Linh hoạt theo nhu cầu: đến phòng khám trực tiếp, gọi video trực tuyến hoặc bác sĩ tới nhà
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setConsultationType('HOSPITAL')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  consultationType === 'HOSPITAL'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  {consultationType === 'HOSPITAL' && (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Khám tại Bệnh viện / Phòng khám</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Khám trực tiếp với bác sĩ chuyên khoa, có đầy đủ máy móc xét nghiệm, nội soi, chụp chiếu.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700">
                  Phổ biến nhất • Ưu tiên tiếp đón
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('ONLINE_VIDEO')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  consultationType === 'ONLINE_VIDEO'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  {consultationType === 'ONLINE_VIDEO' && (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Tư Vấn Online Qua Video Call</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Trao đổi 1-1 với bác sĩ qua điện thoại hoặc máy tính, nhận đơn thuốc điện tử ngay sau khám.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-teal-700">
                  Tiện lợi tại nhà • Giảm đến 30% phí
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('HOME_VISIT')}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  consultationType === 'HOME_VISIT'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  {consultationType === 'HOME_VISIT' && (
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Bác Sĩ Đến Tận Nhà Khám</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Phù hợp cho người cao tuổi đi lại khó khăn, trẻ sơ sinh hoặc lấy máu xét nghiệm tại gia.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-700">
                  Chăm sóc tận nơi • Đầy đủ thiết bị
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>Tiếp tục: Chọn Chuyên Khoa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DEPARTMENT SELECTION */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                    2
                  </span>
                  Chọn Chuyên Khoa Phù Hợp
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đang chọn chuyên khoa cho hình thức:{' '}
                  <strong className="text-emerald-700">
                    {consultationType === 'HOSPITAL'
                      ? 'Khám tại Bệnh viện'
                      : consultationType === 'ONLINE_VIDEO'
                      ? 'Khám Online Video'
                      : 'Bác sĩ tới nhà'}
                  </strong>
                </p>
              </div>

              {/* Search Specialty */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder="Tìm chuyên khoa, triệu chứng..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDepts.map((dept) => {
                const isSelected = dept.id === selectedDeptId;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-slate-800">{dept.name}</div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{dept.doctorsCount} bác sĩ tiếp nhận</span>
                      <span className="text-emerald-700 font-medium">Đặt khám →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>Tiếp tục: Chọn Bác Sĩ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DOCTOR SELECTION */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  3
                </span>
                Chọn Bác Sĩ Chuyên Khoa: {currentDept.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Các chuyên gia hàng đầu giàu kinh nghiệm tại các bệnh viện tuyến trung ương
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctorsInDept.map((doc) => {
                const isSelected = doc.id === selectedDoctorId;
                const fee =
                  consultationType === 'ONLINE_VIDEO'
                    ? doc.priceOnline
                    : consultationType === 'HOME_VISIT'
                    ? doc.priceHome
                    : doc.priceHospital;

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex gap-4 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                    />

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase">
                            {doc.title}
                          </span>
                          <h4 className="font-bold text-sm text-slate-800 mt-1 truncate">{doc.name}</h4>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">{doc.hospital}</p>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {doc.rating}
                          <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{doc.experienceYears} năm KN</span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Phí khám:</span>
                        <span className="font-extrabold text-emerald-600 text-sm">
                          {formatCurrency(fee)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>Tiếp tục: Chọn Ngày & Giờ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DATE & TIME SELECTION */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  4
                </span>
                Chọn Ngày & Khung Giờ Khám
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lịch trống của{' '}
                <strong className="text-emerald-700">
                  {currentDoctor.title} {currentDoctor.name}
                </strong>
              </p>
            </div>

            {/* Date Picker Ribbon */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                1. Chọn ngày khám:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {availableDates.map((item) => {
                  const isSelected = item.dateStr === selectedDate;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-medium opacity-90">{item.dayName}</div>
                      <div className="text-base font-extrabold mt-1">{item.displayDate}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                2. Chọn khung giờ khám ({currentDoctor.timeSlots.length} slot khả dụng):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {currentDoctor.timeSlots.map((slot) => {
                  const isSelected = slot === selectedTimeSlot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <span>Tiếp tục: Thông Tin Bệnh Nhân</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PATIENT DETAILS & REVIEW PAYMENT */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  5
                </span>
                Thông Tin Bệnh Nhân & Xác Nhận Đặt Lịch
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng kiểm tra kỹ thông tin trước khi chuyển sang bước thanh toán
              </p>
            </div>

            {/* Quick switcher: Self or family member */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setBookingFor('SELF');
                  setPatientName(patient.fullName);
                  setPatientPhone(patient.phone);
                  setPatientDob(patient.birthDate);
                  setPatientGender(patient.gender);
                  setPatientInsurance(patient.insuranceNumber);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  bookingFor === 'SELF'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👤 Đặt cho Bản thân ({patient.fullName})
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingFor('FAMILY');
                  setPatientName('');
                  setPatientPhone('');
                  setPatientInsurance('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  bookingFor === 'FAMILY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👨‍👩‍👧 Đặt cho Người thân (Bố mẹ, Con nhỏ)
              </button>
            </div>

            {/* Patient Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Họ và tên bệnh nhân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nhập họ và tên có dấu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Số điện thoại liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Ngày tháng năm sinh</label>
                <input
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Giới tính</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Mô tả triệu chứng / Lý do khám bệnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ví dụ: Tôi bị đau họng nuốt vướng, ho húng hắng 2 ngày nay..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Health Insurance Benefit */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="insurance"
                checked={useInsurance}
                onChange={(e) => setUseInsurance(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 text-xs">
                <label htmlFor="insurance" className="font-bold text-emerald-900 cursor-pointer block">
                  Áp dụng Bảo hiểm Y tế (BHYT) / Bảo hiểm bảo lãnh viện phí
                </label>
                <p className="text-emerald-700 mt-0.5">
                  Giảm ngay 50.000đ trực tiếp vào chi phí khám ban đầu khi xuất trình thẻ BHYT hợp lệ tại viện.
                </p>
                {useInsurance && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={patientInsurance}
                      onChange={(e) => setPatientInsurance(e.target.value)}
                      placeholder="Nhập 15 ký tự thẻ BHYT (ví dụ: DN4790123456789)"
                      className="bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs font-mono w-full sm:w-72"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fee Breakdown Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-sm">Chi Tiết Lịch Hẹn & Chi Phí</div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Dịch vụ khám:</span>
                <span className="font-bold text-slate-800">
                  {currentDept.name} • {currentDoctor.name}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Thời gian:</span>
                <span className="font-bold text-emerald-700">
                  {selectedTimeSlot} ngày {selectedDate}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Giá niêm yết:</span>
                <span>{formatCurrency(baseFee)}</span>
              </div>

              {useInsurance && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                  <span>Hỗ trợ giảm trừ BHYT:</span>
                  <span>- {formatCurrency(insuranceDiscount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Tổng thanh toán:</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit & Payment Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Tiến Hành Thanh Toán Trực Tuyến</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
