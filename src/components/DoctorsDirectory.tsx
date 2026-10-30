import React, { useState } from 'react';
import {
  Search,
  Star,
  Award,
  Calendar,
  Building,
  CheckCircle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { DOCTORS, DEPARTMENTS } from '../data/mockData';
import { formatCurrency } from '../utils/storage';

interface DoctorsDirectoryProps {
  onSelectDoctorForBooking: (departmentId: string, doctorId: string) => void;
}

export const DoctorsDirectory: React.FC<DoctorsDirectoryProps> = ({
  onSelectDoctorForBooking,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesDept = selectedDept === 'ALL' || doc.departmentId === selectedDept;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đội Ngũ Chuyên Gia Đầu Ngành</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Danh Sách Bác Sĩ & Chuyên Khoa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Hội tụ các Phó Giáo sư, Tiến sĩ, Bác sĩ Chuyên khoa II từ Bệnh viện Bạch Mai, Chợ Rẫy, Đại học Y Dược, 108 và các cơ sở y tế quốc tế hàng đầu.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bác sĩ, bệnh viện hoặc bệnh lý..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tất Cả Chuyên Khoa ({DOCTORS.length})</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex gap-4">
              <img
                src={doc.avatar}
                alt={doc.name}
                className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
              />

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                    {doc.title}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-800 leading-snug">{doc.name}</h3>
                <div className="text-xs text-emerald-800 font-semibold">{doc.departmentName}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.hospital}</span>
                </div>
              </div>
            </div>

            {/* Doctor Bio & Specialties */}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{doc.bio}</p>

            <div className="flex flex-wrap gap-1.5">
              {doc.specialties.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Schedule & Price & Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Phí khám tại viện</span>
                <span className="text-base font-black text-emerald-600">
                  {formatCurrency(doc.priceHospital)}
                </span>
              </div>

              <button
                onClick={() => onSelectDoctorForBooking(doc.departmentId, doc.id)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt Khám Ngay</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
