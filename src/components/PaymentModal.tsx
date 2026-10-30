import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  QrCode,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  Printer,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Appointment, PaymentMethodType } from '../types/medical';
import { formatCurrency } from '../utils/storage';

interface PaymentModalProps {
  appointment: Appointment;
  onPaymentSuccess: (updatedAppointment: Appointment) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  appointment,
  onPaymentSuccess,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(appointment.paymentMethod || 'VIETQR');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaid, setIsPaid] = useState(appointment.paymentStatus === 'PAID');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(900); // 15 mins expiry
  const [creditCardData, setCreditCardData] = useState({
    cardNumber: '4532 •••• •••• 8892',
    holderName: appointment.patientName.toUpperCase(),
    expiry: '09/28',
    cvv: '888',
  });

  // Mock bank transfer details
  const bankDetails = {
    bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
    accountNumber: '990188899999',
    accountName: 'HE THONG Y TE MEDCARE PLUS VN',
    amount: appointment.totalAmount,
    transferContent: `MEDCARE ${appointment.code}`,
  };

  useEffect(() => {
    if (isPaid) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaid]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsPaid(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const updated: Appointment = {
        ...appointment,
        paymentStatus: 'PAID',
        paymentMethod: selectedMethod,
        paymentDate: new Date().toLocaleString('vi-VN'),
        transactionRef: `${selectedMethod}-${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'UPCOMING',
      };
      onPaymentSuccess(updated);
    }, 1400);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {isPaid ? 'Đặt Lịch & Thanh Toán Thành Công' : 'Cổng Thanh Toán Trực Tuyến Y Tế'}
              </h3>
              <p className="text-xs text-emerald-100">
                Mã lịch hẹn: <span className="font-mono font-bold text-white">{appointment.code}</span>
              </p>
            </div>
          </div>
          {!isPaid && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isPaid ? (
            /* SUCCESS E-TICKET VIEW */
            <div className="space-y-6">
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Xác Nhận Đặt Lịch Thành Công!</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Biên lai điện tử và mã QR tiếp đón ưu tiên đã được cấp. Bạn không cần bốc số hay chờ đợi tại quầy thu ngân.
                </p>
              </div>

              {/* E-Ticket Card */}
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  ĐÃ THANH TOÁN
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
                  {/* QR Code Check-in */}
                  <div className="sm:col-span-1 flex flex-col items-center text-center p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=MEDCARE-CHECKIN-${appointment.code}`}
                      alt="QR Checkin"
                      className="w-32 h-32 rounded-lg"
                    />
                    <span className="text-[10px] font-bold text-slate-500 mt-2">MÃ CHECK-IN TẠI VIỆN</span>
                    <span className="text-xs font-mono font-bold text-emerald-700">{appointment.code}</span>
                  </div>

                  {/* Appointment info */}
                  <div className="sm:col-span-2 space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Bệnh nhân</span>
                      <div className="font-bold text-slate-800 text-base">{appointment.patientName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Thời gian khám:</span>
                        <div className="font-bold text-emerald-700">
                          {appointment.timeSlot} - {appointment.appointmentDate}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Hình thức:</span>
                        <div className="font-bold text-slate-700">
                          {appointment.consultationType === 'HOSPITAL'
                            ? 'Khám tại Bệnh viện'
                            : appointment.consultationType === 'ONLINE_VIDEO'
                            ? 'Khám Online Video'
                            : 'Bác sĩ tới nhà'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400">Bác sĩ phụ trách:</span>
                      <div className="font-bold text-slate-800">
                        {appointment.doctorTitle} {appointment.doctorName}
                      </div>
                      <div className="text-slate-500 text-[11px]">{appointment.hospital}</div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Số tiền đã quyết toán:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(appointment.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  In Phiếu Khám
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Xem Danh Sách Lịch Hẹn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT SELECTION & TRANSFER VIEW */
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-500">Dịch vụ khám:</span>
                  <div className="font-bold text-slate-800 text-sm">
                    {appointment.departmentName} - {appointment.doctorName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {appointment.timeSlot}, {appointment.appointmentDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Số tiền cần thanh toán</span>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {formatCurrency(appointment.totalAmount)}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    Hết hạn sau: {formatCountdown(countdown)}
                  </div>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Chọn Phương Thức Thanh Toán:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('VIETQR')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'VIETQR'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 font-bold text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      QR
                    </div>
                    <span className="text-xs">Chuyển VietQR</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tự động 24/7</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('MOMO')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'MOMO'
                        ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-500/20 font-bold text-pink-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                      M
                    </div>
                    <span className="text-xs">Ví MoMo</span>
                    <span className="text-[10px] text-pink-600 font-semibold">Quét mã MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('VNPAY')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'VNPAY'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 font-bold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      VN
                    </div>
                    <span className="text-xs">Cổng VNPay</span>
                    <span className="text-[10px] text-blue-600 font-semibold">40+ ngân hàng</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('CREDIT_CARD')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'CREDIT_CARD'
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 font-bold text-indigo-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-7 h-7 text-indigo-600" />
                    <span className="text-xs">Thẻ Visa/Master</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">Quốc tế & ATM</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: VIETQR (Most popular in Vietnam) */}
              {selectedMethod === 'VIETQR' && (
                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Visual QR Code */}
                    <div className="flex flex-col items-center text-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="relative">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=2|99|0912345678|${appointment.patientName}|${appointment.totalAmount}|0|0|MEDCARE%20${appointment.code}`}
                          alt="VietQR code"
                          className="w-44 h-44 rounded-lg object-contain"
                        />
                        <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-lg pointer-events-none animate-pulse" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Quét bằng App Ngân Hàng bất kỳ
                      </span>
                      <span className="text-[11px] text-slate-400">Vietcombank, Techcombank, BIDV, MB, v.v.</span>
                    </div>

                    {/* Transfer Details with quick copy */}
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                        <div className="text-slate-400 text-[11px]">Ngân hàng thụ hưởng</div>
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Vietcombank (Sở giao dịch)</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-[11px]">Số tài khoản</div>
                          <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                            {bankDetails.accountNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankDetails.accountNumber, 'acc')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedField === 'acc' ? 'Đã chép!' : 'Chép'}
                        </button>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-[11px]">Chủ tài khoản</div>
                          <div className="font-bold text-slate-800 text-xs mt-0.5">{bankDetails.accountName}</div>
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div>
                          <div className="text-emerald-700 text-[11px] font-semibold">Nội dung chuyển khoản (Bắt buộc)</div>
                          <div className="font-mono font-extrabold text-emerald-900 text-sm mt-0.5">
                            {bankDetails.transferContent}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankDetails.transferContent, 'content')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedField === 'content' ? 'Đã chép!' : 'Chép'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: MOMO */}
              {selectedMethod === 'MOMO' && (
                <div className="bg-pink-50/40 border border-pink-200 rounded-2xl p-5 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=2|99|0912345678|MoMo-MedCare|${appointment.totalAmount}|0|0|${appointment.code}`}
                      alt="MoMo QR"
                      className="w-40 h-40 mx-auto rounded-xl border border-pink-200 bg-white p-2"
                    />
                    <div className="text-xs font-bold text-pink-900">Mở ứng dụng MoMo để quét mã thanh toán</div>
                    <p className="text-[11px] text-pink-700">
                      Giao dịch được đối soát tự động ngay lập tức sau khi quét thành công.
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 3: VNPAY */}
              {selectedMethod === 'VNPAY' && (
                <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-5 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=VNPAY-QR|MEDCARE|${appointment.code}|${appointment.totalAmount}`}
                      alt="VNPay QR"
                      className="w-40 h-40 mx-auto rounded-xl border border-blue-200 bg-white p-2"
                    />
                    <div className="text-xs font-bold text-blue-900">Quét mã VNPay-QR trên ứng dụng ngân hàng</div>
                    <p className="text-[11px] text-blue-700">
                      Hỗ trợ hơn 40 ứng dụng ngân hàng: Vietcombank, Agribank, VietinBank, BIDV, v.v.
                    </p>
                  </div>
                </div>
              )}

              {/* METHOD 4: CREDIT CARD */}
              {selectedMethod === 'CREDIT_CARD' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">Số thẻ tín dụng / ghi nợ</label>
                    <input
                      type="text"
                      value={creditCardData.cardNumber}
                      onChange={(e) => setCreditCardData({ ...creditCardData, cardNumber: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 font-medium block mb-1">Họ tên chủ thẻ</label>
                      <input
                        type="text"
                        value={creditCardData.holderName}
                        onChange={(e) => setCreditCardData({ ...creditCardData, holderName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-500 font-medium block mb-1">Hết hạn</label>
                        <input
                          type="text"
                          value={creditCardData.expiry}
                          onChange={(e) => setCreditCardData({ ...creditCardData, expiry: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm text-center font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-medium block mb-1">CVV/CVC</label>
                        <input
                          type="password"
                          value={creditCardData.cvv}
                          onChange={(e) => setCreditCardData({ ...creditCardData, cvv: e.target.value })}
                          maxLength={4}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm text-center font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-cyan-800 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiểm tra giao dịch từ ngân hàng...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-200" />
                      <span>Xác Nhận Đã Chuyển Khoản ({formatCurrency(appointment.totalAmount)})</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mã hóa bảo mật 256-bit SSL tiêu chuẩn Ngân Hàng Nhà Nước Việt Nam
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
