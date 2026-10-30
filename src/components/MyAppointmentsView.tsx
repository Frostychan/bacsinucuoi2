import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  QrCode,
  CreditCard,
  Building,
  Video,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  FileText,
  Search,
} from 'lucide-react';
import { Appointment } from '../types/medical';
import { formatCurrency } from '../utils/storage';

interface MyAppointmentsViewProps {
  appointments: Appointment[];
  onOpenPayment: (appointment: Appointment) => void;
  onCancelAppointment: (id: string) => void;
  onNewBooking: () => void;
}

export const MyAppointmentsView: React.FC<MyAppointmentsViewProps> = ({
  appointments,
  onOpenPayment,
  onCancelAppointment,
  onNewBooking,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Appointment | null>(null);

  const filtered = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Danh Sách Lịch Hẹn Khám Bệnh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý lịch khám, biên lai thanh toán trực tuyến và mã QR check-in tiếp đón ưu tiên
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Đặt Thêm Lịch Khám</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'ALL', label: `Tất cả (${appointments.length})` },
          { key: 'UPCOMING', label: `Sắp tới (${appointments.filter((a) => a.status === 'UPCOMING').length})` },
          { key: 'COMPLETED', label: `Đã khám (${appointments.filter((a) => a.status === 'COMPLETED').length})` },
          { key: 'CANCELLED', label: `Đã hủy (${appointments.filter((a) => a.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-700 text-base">Chưa có lịch hẹn nào trong mục này</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Bạn có thể dễ dàng đặt lịch khám với các chuyên gia y tế hàng đầu bất cứ lúc nào.
          </p>
          <button
            onClick={onNewBooking}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đặt lịch khám ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const isPaid = apt.paymentStatus === 'PAID';
            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                      {apt.code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        apt.status === 'UPCOMING'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {apt.status === 'UPCOMING'
                        ? 'Sắp diễn ra'
                        : apt.status === 'COMPLETED'
                        ? 'Đã hoàn thành'
                        : 'Đã hủy'}
                    </span>
                    {isPaid ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã thanh toán ({apt.paymentMethod})
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Chờ thanh toán
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">Ngày đặt: {apt.createdAt}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Doctor Info */}
                  <div className="md:col-span-2 flex items-start gap-4">
                    <img
                      src={apt.doctorAvatar}
                      alt={apt.doctorName}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase">{apt.departmentName}</div>
                      <h4 className="font-bold text-sm text-slate-800">
                        {apt.doctorTitle} {apt.doctorName}
                      </h4>
                      <p className="text-slate-500 text-[11px]">{apt.hospital}</p>
                      <div className="text-slate-600 mt-1">
                        Bệnh nhân: <strong className="text-slate-900">{apt.patientName}</strong> ({apt.gender})
                      </div>
                    </div>
                  </div>

                  {/* Appointment Time & Fee */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 md:text-right">
                    <div className="flex md:justify-end items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {apt.timeSlot} • {apt.appointmentDate}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px]">
                      Hình thức:{' '}
                      <strong className="text-slate-700">
                        {apt.consultationType === 'HOSPITAL'
                          ? 'Tại Bệnh viện'
                          : apt.consultationType === 'ONLINE_VIDEO'
                          ? 'Online Video'
                          : 'Tại nhà'}
                      </strong>
                    </div>

                    <div className="text-slate-700 pt-1 border-t border-slate-200/60 font-semibold">
                      Tổng tiền: <span className="font-extrabold text-emerald-600">{formatCurrency(apt.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 italic max-w-md truncate">
                    Triệu chứng: {apt.symptoms}
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === 'UPCOMING' && (
                      <button
                        onClick={() => onCancelAppointment(apt.id)}
                        className="px-3 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Hủy lịch hẹn
                      </button>
                    )}

                    {!isPaid ? (
                      <button
                        onClick={() => onOpenPayment(apt)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh Toán Ngay ({formatCurrency(apt.totalAmount)})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTicket(apt)}
                        className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mã Check-in & Vé Khám</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TICKET POPUP MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                PHIẾU KHÁM ĐIỆN TỬ ƯU TIÊN
              </span>
              <h3 className="font-extrabold text-lg text-slate-800">Mã Tiếp Đón Bệnh Viện</h3>
              <p className="text-xs text-slate-500">Xuất trình mã này tại quầy tiếp đón MedCare để vào thẳng phòng khám</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MEDCARE-CHECKIN-${selectedTicket.code}`}
                alt="QR Pass"
                className="w-40 h-40 mx-auto rounded-xl bg-white p-2 border border-slate-200"
              />
              <div>
                <span className="text-[10px] font-bold text-slate-400">MÃ ĐẶT CHỖ</span>
                <div className="font-mono font-extrabold text-emerald-700 text-base">{selectedTicket.code}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Bệnh nhân:</span>
                <span className="font-bold text-slate-800">{selectedTicket.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian khám:</span>
                <span className="font-bold text-emerald-700">
                  {selectedTicket.timeSlot} • {selectedTicket.appointmentDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bác sĩ:</span>
                <span className="font-bold text-slate-800">
                  {selectedTicket.doctorTitle} {selectedTicket.doctorName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Địa điểm:</span>
                <span className="font-bold text-slate-700 text-right max-w-[200px] truncate">{selectedTicket.hospital}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> In Phiếu
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
