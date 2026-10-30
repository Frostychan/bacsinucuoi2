import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  User,
  RefreshCw,
  PhoneCall,
  Info,
} from 'lucide-react';
import { ChatMessage, PatientProfile } from '../types/medical';

interface AIChatBotProps {
  patient: PatientProfile;
  onBookSpecialty: (departmentId: string, departmentName: string, reason: string) => void;
  isFloatingModal?: boolean;
  onCloseFloating?: () => void;
}

const SAMPLE_QUESTIONS = [
  'Tôi bị đau đầu vùng trán và nghẹt mũi suốt 3 ngày nay',
  'Bị đau âm ỉ vùng thượng vị sau khi ăn đồ chua cay',
  'Đau nhói ngực trái khi hít thở sâu hoặc đi bộ nhanh',
  'Nổi mẩn đỏ ngứa khắp người sau khi ăn tôm cua',
  'Trẻ nhỏ sốt 38.5 độ kèm ho khan, biếng ăn',
  'Đau mỏi vùng thắt lưng và tê dọc xuống chân trái',
];

export const AIChatBot: React.FC<AIChatBotProps> = ({
  patient,
  onBookSpecialty,
  isFloatingModal = false,
  onCloseFloating,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào **${patient.fullName}**! Tôi là **Trợ lý Y tế Thông minh MedCare AI** 🩺.

Tôi có thể giúp bạn:
- 🔍 **Sàng lọc triệu chứng** bạn đang gặp phải.
- 💡 **Đưa ra lời khuyên chăm sóc ban đầu** an toàn tại nhà.
- 🚨 **Cảnh báo mức độ khẩn cấp** nếu có nguy cơ.
- 🏥 **Gợi ý chuyên khoa & bác sĩ** phù hợp để bạn đặt lịch khám ngay.

*Bạn đang cảm thấy khó chịu hoặc có triệu chứng gì trong người? Hãy mô tả chi tiết cho tôi nhé!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          history: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            text: m.content,
          })),
          patientProfile: {
            fullName: patient.fullName,
            age: 38,
            gender: patient.gender,
            allergies: patient.allergies.join(', '),
            chronicConditions: patient.chronicConditions.join(', '),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ trợ lý AI.');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Xin lỗi, tôi chưa thể đưa ra câu trả lời lúc này.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgency: data.urgency,
        suggestedDepartment: data.suggestedDepartment,
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Rất tiếc, đã có sự cố gián đoạn kết nối y tế: ${err?.message || 'Vui lòng thử lại sau.'} 
        
Bạn có thể gọi trực tiếp tổng đài **1900 8888** hoặc bấm vào nút **"Đặt lịch khám"** ở góc trên để chọn chuyên khoa khám ngay.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const mapSpecialtyNameToId = (name: string): string => {
    const normalized = name.toLowerCase();
    if (normalized.includes('tim')) return 'tim-mach';
    if (normalized.includes('tai') || normalized.includes('họng') || normalized.includes('xoang')) return 'tai-mui-hong';
    if (normalized.includes('tiêu hóa') || normalized.includes('dạ dày') || normalized.includes('gan')) return 'tieu-hoa';
    if (normalized.includes('thần kinh') || normalized.includes('đầu')) return 'than-kinh';
    if (normalized.includes('khớp') || normalized.includes('xương') || normalized.includes('cơ')) return 'co-xuong-khop';
    if (normalized.includes('nhi') || normalized.includes('trẻ')) return 'nhi-khoa';
    if (normalized.includes('da')) return 'da-lieu';
    if (normalized.includes('sản') || normalized.includes('phụ')) return 'san-phu-khoa';
    return 'noi-tong-quat';
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${
        isFloatingModal ? 'w-full h-full' : 'max-w-5xl mx-auto h-[740px]'
      }`}
    >
      {/* Top Header of Chat */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-emerald-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-tight">MedCare AI - Bác Sĩ Sàng Lọc Sức Khỏe</h2>
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/20">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <span>Đang kết nối với hồ sơ: <strong>{patient.fullName}</strong></span>
              <span>•</span>
              <span className="text-emerald-300">Phản hồi 24/7 tức thì</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  content: `Xin chào ${patient.fullName}! Cuộc trò chuyện đã được làm mới. Hãy mô tả bất kỳ triệu chứng nào bạn đang gặp phải nhé.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            title="Làm mới đoạn chat"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isFloatingModal && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold px-2.5 cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            AI hỗ trợ định hướng sơ bộ & phân luồng chuyên khoa. Trong trường hợp nguy hiểm tính mạng, vui lòng gọi{' '}
            <strong className="underline text-red-600">115</strong> ngay!
          </span>
        </div>
        <a
          href="tel:19008888"
          className="hidden sm:flex items-center gap-1 bg-amber-200/80 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded-md font-bold text-[11px]"
        >
          <PhoneCall className="w-3 h-3 text-red-600" /> Cấp cứu: 1900 8888
        </a>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-slate-700 to-slate-900'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Markdown formatted text */}
                  <div className="whitespace-pre-line space-y-2">
                    {message.content.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Urgency Badge if Assistant */}
                  {!isUser && message.urgency && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      {message.urgency === 'EMERGENCY' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> CẢNH BÁO: CẦN KHÁM CẤP CỨU
                        </span>
                      )}
                      {message.urgency === 'RECOMMENDED_SOON' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> NÊN KHÁM SỚM TRONG 1-2 NGÀY
                        </span>
                      )}
                      {message.urgency === 'NORMAL' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TÌNH TRẠNG THEO DÕI ĐƯỢC
                        </span>
                      )}
                    </div>
                  )}

                  {/* Suggestion to Book Appointment Button */}
                  {!isUser && message.suggestedDepartment && (
                    <div className="mt-3 pt-2">
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Chuyên khoa khuyến nghị: {message.suggestedDepartment}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            Hệ thống đã chuẩn bị sẵn thông tin bác sĩ & khung giờ còn trống.
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const deptId = mapSpecialtyNameToId(message.suggestedDepartment!);
                            onBookSpecialty(deptId, message.suggestedDepartment!, input || 'Tư vấn từ MedCare AI');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Đặt Khám Ngay</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs text-slate-500 font-medium">Bác sĩ AI đang phân tích dữ liệu lâm sàng...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">Gợi ý:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-xs text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-slate-200/60 hover:border-emerald-200 transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mô tả triệu chứng của bạn (ví dụ: đau họng, sốt nhẹ, đau tức ngực...)"
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi Tư Vấn</span>
          </button>
        </form>
      </div>
    </div>
  );
};
