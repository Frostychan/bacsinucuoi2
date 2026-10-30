import React from 'react';
import {
  Calendar,
  FileText,
  Bot,
  UserCheck,
  Phone,
  Clock,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { PatientProfile } from '../types/medical';

interface HeaderProps {
  activeTab: 'booking' | 'ai-chat' | 'records' | 'my-appointments' | 'doctors';
  setActiveTab: (tab: 'booking' | 'ai-chat' | 'records' | 'my-appointments' | 'doctors') => void;
  patient: PatientProfile;
  onOpenBooking: () => void;
  appointmentsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  patient,
  onOpenBooking,
  appointmentsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              Tổng đài Cấp cứu & Đặt hẹn 24/7:{' '}
              <a href="tel:19008888" className="font-bold underline hover:text-emerald-200">
                1900 8888
              </a>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-100">
              <Clock className="w-3.5 h-3.5" /> Khám bệnh tất cả các ngày: 07:00 - 20:30
            </span>
          </div>
          <div className="flex items-center gap-3 text-emerald-100">
            <span className="flex items-center gap-1 text-[11px] bg-emerald-600/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Thanh toán VietQR & MoMo chuẩn y tế
            </span>
            <span className="hidden sm:inline">Bảo hiểm Y tế & Bảo lãnh viện phí áp dụng toàn quốc</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo brand */}
          <button
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  MedCare<span className="text-emerald-600">Plus</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  Y TẾ SỐ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Đặt Lịch Khám & Hồ Sơ Bệnh Án</p>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              Đặt Lịch Khám
            </button>

            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'ai-chat'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-teal-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              </div>
              Trợ Lý AI Y Tế
              <span className="text-[10px] bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                AI Sàng Lọc
              </span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'records'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Hồ Sơ Bệnh Án
            </button>

            <button
              onClick={() => setActiveTab('my-appointments')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'my-appointments'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Lịch Hẹn Của Tôi
              {appointmentsCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-emerald-600 rounded-full">
                  {appointmentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Đội Ngũ Bác Sĩ
            </button>
          </nav>

          {/* User profile & action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('records')}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/70 hover:bg-emerald-50/30 transition-all text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {patient.fullName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{patient.fullName}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span className="text-emerald-600 font-semibold">Nhóm {patient.bloodType}</span> • BHYT sẵn sàng
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenBooking}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Đặt Khám Nhanh</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
              activeTab === 'booking' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📅 Đặt Khám
          </button>
          <button
            onClick={() => setActiveTab('ai-chat')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg flex items-center gap-1 cursor-pointer ${
              activeTab === 'ai-chat' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" /> Trợ Lý AI
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
              activeTab === 'records' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📁 Hồ Sơ Y Tế
          </button>
          <button
            onClick={() => setActiveTab('my-appointments')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
              activeTab === 'my-appointments' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            📋 Lịch Hẹn ({appointmentsCount})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-lg cursor-pointer ${
              activeTab === 'doctors' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            👨‍⚕️ Bác Sĩ
          </button>
        </div>
      </div>
    </header>
  );
};
