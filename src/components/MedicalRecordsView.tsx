import React, { useState } from 'react';
import {
  FileText,
  Activity,
  Pill,
  Heart,
  Droplet,
  Printer,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Shield,
  Edit2,
  Save,
  X,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import {
  PatientProfile,
  VitalSignRecord,
  Prescription,
  LabResult,
} from '../types/medical';
import {
  calculateBmi,
  classifyBloodPressure,
  saveStoredPatient,
  saveStoredVitals,
} from '../utils/storage';

interface MedicalRecordsViewProps {
  patient: PatientProfile;
  vitals: VitalSignRecord[];
  prescriptions: Prescription[];
  labs: LabResult[];
  onUpdatePatient: (updated: PatientProfile) => void;
  onAddVital: (vital: VitalSignRecord) => void;
}

export const MedicalRecordsView: React.FC<MedicalRecordsViewProps> = ({
  patient,
  vitals,
  prescriptions,
  labs,
  onUpdatePatient,
  onAddVital,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'vitals' | 'prescriptions' | 'labs'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<PatientProfile>(patient);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);

  // New vital sign form state
  const [newVital, setNewVital] = useState({
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 75,
    bloodSugar: 99,
    spo2: 98,
    weight: patient.weight || 68,
    height: patient.height || 172,
    temperature: 36.6,
    notes: 'Đo định kỳ tại nhà',
  });

  const latestVital = vitals[0] || {
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 75,
    bloodSugar: 98,
    spo2: 98,
    weight: patient.weight,
    height: patient.height,
  };

  const bmiInfo = calculateBmi(latestVital.weight, latestVital.height);
  const bpInfo = classifyBloodPressure(latestVital.systolicBP, latestVital.diastolicBP);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient(profileForm);
    saveStoredPatient(profileForm);
    setIsEditingProfile(false);
  };

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    const createdVital: VitalSignRecord = {
      id: `vital-${Date.now()}`,
      date: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...newVital,
    };
    onAddVital(createdVital);
    setShowAddVitalModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
              {patient.fullName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  {patient.fullName}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Nhóm Máu {patient.bloodType}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                  {patient.gender} • {new Date().getFullYear() - parseInt(patient.birthDate.split('-')[0]) || 38} tuổi
                </span>
              </div>

              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Số điện thoại: <strong className="text-slate-700">{patient.phone}</strong></span>
                <span>•</span>
                <span>Thẻ BHYT: <strong className="text-slate-700 font-mono">{patient.insuranceNumber}</strong></span>
                <span>•</span>
                <span>CCCD: <strong className="text-slate-700 font-mono">{patient.cccd}</strong></span>
              </div>

              <div className="text-xs text-slate-500 truncate max-w-xl">
                Địa chỉ: {patient.address}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/40 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Sửa Thông Tin
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              In Bản Y Bạ
            </button>
          </div>
        </div>

        {/* Allergies & Chronic Conditions Flags */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-900 block">Tiền sử Dị ứng ghi nhận:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {patient.allergies.map((al, idx) => (
                  <span key={idx} className="bg-white/80 text-red-800 border border-red-200 px-2 py-0.5 rounded-md font-medium">
                    {al}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-900 block">Bệnh lý nền & Mãn tính:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {patient.chronicConditions.map((cond, idx) => (
                  <span key={idx} className="bg-white/80 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Tổng Quan Sức Khỏe', icon: Heart },
          { key: 'vitals', label: `Chỉ Số Sinh Tồn (${vitals.length})`, icon: Activity },
          { key: 'prescriptions', label: `Đơn Thuốc Điện Tử (${prescriptions.length})`, icon: Pill },
          { key: 'labs', label: `Xét Nghiệm & CĐHA (${labs.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Realtime Vital cards metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Huyết Áp Gần Nhất</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {latestVital.systolicBP}/{latestVital.diastolicBP}{' '}
                <span className="text-xs font-medium text-slate-400">mmHg</span>
              </div>
              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${bpInfo.badge}`}>
                {bpInfo.status}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Nhịp Tim</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {latestVital.heartRate}{' '}
                <span className="text-xs font-medium text-slate-400">bpm</span>
              </div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Nhịp xoang đều
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Chỉ Số Thể Trọng (BMI)</span>
                <TrendingUp className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {bmiInfo.bmi}{' '}
                <span className="text-xs font-medium text-slate-400">kg/m²</span>
              </div>
              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${bmiInfo.bg} ${bmiInfo.color}`}>
                {bmiInfo.label}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Đường Huyết (Đói)</span>
                <Droplet className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {latestVital.bloodSugar}{' '}
                <span className="text-xs font-medium text-slate-400">mg/dL</span>
              </div>
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Bình thường
              </span>
            </div>
          </div>

          {/* Quick Doctor Notes & Recent Consultation Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-6 border border-emerald-200/70">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-800 text-sm">Lời Dặn Bác Sĩ & Kế Hoạch Theo Dõi Gần Nhất</h3>
              </div>
              <span className="text-xs font-medium text-emerald-800">Bệnh viện Chợ Rẫy (15/10/2026)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &quot;Bệnh nhân đáp ứng tốt với phác đồ ức chế bơm proton PPI (Nexium 40mg). Hang vị dạ dày chỉ còn trợt nhẹ, vi khuẩn HP âm tính. Tiếp tục duy trì chế độ ăn đúng bữa, hạn chế cà phê và gia vị cay nóng. Tái khám sau 4 tuần để đánh giá lại niêm mạc.&quot;
            </p>
            <div className="mt-3 text-[11px] text-emerald-900 font-bold flex items-center gap-2">
              <span>Bác sĩ phụ trách: TS. BS Lê Hoàng Long</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Hẹn tái khám: 15/11/2026</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: VITAL SIGNS */}
      {activeSubTab === 'vitals' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Nhật Ký Đo Chỉ Số Sinh Tồn</h3>
              <p className="text-xs text-slate-500">Lưu lại huyết áp, đường huyết, cân nặng để bác sĩ tiện theo dõi từ xa</p>
            </div>
            <button
              onClick={() => setShowAddVitalModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Số Đo Mới
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Thời Gian</th>
                    <th className="p-3.5">Huyết Áp (mmHg)</th>
                    <th className="p-3.5">Nhịp Tim (bpm)</th>
                    <th className="p-3.5">Đường Huyết</th>
                    <th className="p-3.5">SpO2</th>
                    <th className="p-3.5">Cân Nặng / BMI</th>
                    <th className="p-3.5">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vitals.map((v) => {
                    const bp = classifyBloodPressure(v.systolicBP, v.diastolicBP);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-medium whitespace-nowrap">{v.date}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{v.systolicBP}/{v.diastolicBP}</span>{' '}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ml-1.5 ${bp.badge}`}>
                            {bp.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{v.heartRate} bpm</td>
                        <td className="p-3.5">{v.bloodSugar} mg/dL</td>
                        <td className="p-3.5 font-bold text-emerald-700">{v.spo2}%</td>
                        <td className="p-3.5">
                          {v.weight} kg <span className="text-slate-400">({(v.weight / ((v.height / 100) * (v.height / 100))).toFixed(1)})</span>
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">{v.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: PRESCRIPTIONS */}
      {activeSubTab === 'prescriptions' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Đơn Thuốc Điện Tử Đang Dùng</h3>
            <p className="text-xs text-slate-500">Tra cứu tên thuốc, liều lượng và lịch uống theo chỉ dẫn bác sĩ</p>
          </div>

          <div className="space-y-4">
            {prescriptions.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <span className="text-xs text-slate-400">Ngày kê: {p.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 mt-1">{p.doctorName}</h4>
                  </div>
                  {p.recheckDate && (
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-xl">
                      Hẹn tái khám: {p.recheckDate}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs">
                  <span className="text-slate-400">Chẩn đoán:</span>{' '}
                  <strong className="text-slate-800">{p.diagnosis}</strong>
                </div>

                {/* Medication table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">Danh mục thuốc:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {p.medications.map((med) => (
                      <div key={med.id} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{med.name}</span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {med.quantity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hàm lượng: <strong className="text-slate-700">{med.dosage}</strong>
                        </div>
                        <div className="text-xs text-emerald-800 bg-white p-2 rounded-lg border border-slate-200/60 font-medium">
                          💊 {med.usageInstruction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  <strong>Lời dặn của bác sĩ:</strong> {p.doctorAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: LABS & IMAGING */}
      {activeSubTab === 'labs' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Kết Quả Xét Nghiệm & Chẩn Đoán Hình Ảnh</h3>
            <p className="text-xs text-slate-500">Phiếu kết quả được đồng bộ tự động từ phòng xét nghiệm bệnh viện</p>
          </div>

          <div className="space-y-4">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {lab.code}
                      </span>
                      <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        {lab.category}
                      </span>
                      <span className="text-xs text-slate-400">{lab.date}</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900 mt-1">{lab.testName}</h4>
                  </div>
                  <div>
                    {lab.status === 'NORMAL' && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bình Thường
                      </span>
                    )}
                    {lab.status === 'ATTENTION' && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Cần Lưu Ý
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400">Kết luận tổng quát:</div>
                  <div className="font-bold text-slate-800 leading-relaxed">{lab.resultSummary}</div>
                </div>

                {lab.detailedParameters && lab.detailedParameters.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="p-2.5">Chỉ số xét nghiệm</th>
                          <th className="p-2.5">Kết quả</th>
                          <th className="p-2.5">Đơn vị</th>
                          <th className="p-2.5">Khoảng tham chiếu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lab.detailedParameters.map((param, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-medium text-slate-800">{param.param}</td>
                            <td className="p-2.5">
                              <span
                                className={`font-bold ${
                                  param.isAbnormal ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-slate-900'
                                }`}
                              >
                                {param.value}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-500">{param.unit}</td>
                            <td className="p-2.5 text-slate-500">{param.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Cập Nhật Hồ Sơ Bệnh Nhân</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Nhóm máu</label>
                  <select
                    value={profileForm.bloodType}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    value={profileForm.height}
                    onChange={(e) => setProfileForm({ ...profileForm, height: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm({ ...profileForm, weight: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VITAL SIGN MODAL */}
      {showAddVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Ghi Nhận Chỉ Số Đo Tại Nhà</h3>
              <button
                onClick={() => setShowAddVitalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Huyết áp tâm thu (Trên)</label>
                  <input
                    type="number"
                    required
                    value={newVital.systolicBP}
                    onChange={(e) => setNewVital({ ...newVital, systolicBP: Number(e.target.value) })}
                    placeholder="120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Huyết áp tâm trương (Dưới)</label>
                  <input
                    type="number"
                    required
                    value={newVital.diastolicBP}
                    onChange={(e) => setNewVital({ ...newVital, diastolicBP: Number(e.target.value) })}
                    placeholder="80"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Nhịp tim (bpm)</label>
                  <input
                    type="number"
                    required
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({ ...newVital, heartRate: Number(e.target.value) })}
                    placeholder="75"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Đường huyết (mg/dL)</label>
                  <input
                    type="number"
                    value={newVital.bloodSugar}
                    onChange={(e) => setNewVital({ ...newVital, bloodSugar: Number(e.target.value) })}
                    placeholder="99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={newVital.spo2}
                    onChange={(e) => setNewVital({ ...newVital, spo2: Number(e.target.value) })}
                    placeholder="98"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Ghi chú lúc đo</label>
                <input
                  type="text"
                  value={newVital.notes}
                  onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                  placeholder="Ví dụ: Đo sau bữa ăn sáng 1h, cảm giác bình thường"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVitalModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Lưu Số Đo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
