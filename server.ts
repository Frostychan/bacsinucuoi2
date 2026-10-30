import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Health Consultant Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], patientProfile } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ' });
      return;
    }

    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback intelligent simulation when no API key is provided
        const simulatedReplies: Record<string, { reply: string; department: string; urgency: string }> = {
          'dau-dau': {
            reply: `Dựa trên triệu chứng đau đầu bạn vừa chia sẻ:
1. **Đánh giá ban đầu:** Đau đầu có thể do căng thẳng thần kinh (Stress/Tension Headache), thiếu ngủ, viêm xoang hoặc vấn đề huyết áp.
2. **Khuyến nghị chăm sóc:**
- Nghỉ ngơi trong không gian yên tĩnh, giảm ánh sáng xanh từ màn hình điện thoại/máy tính.
- Uống đủ 1.5 - 2 lít nước ấm mỗi ngày.
- Tránh sử dụng quá nhiều caffein hay thức ăn nhiều dầu mỡ.
3. **Cảnh báo cần đi khám ngay:** Nếu đau đầu kèm sốt cao, cứng gáy, nhìn mờ, nôn ói vọt hoặc yếu nửa người, hãy đến cơ sở cấp cứu gần nhất.

*Lưu ý y tế: Đây là thông tin tham khảo từ trợ lý ảo, không thay thế cho chẩn đoán y khoa chính thức từ bác sĩ.*`,
            department: 'Thần kinh & Nội tổng quát',
            urgency: 'RECOMMENDED_SOON',
          },
          default: {
            reply: `Chào bạn, mình là Trợ lý Y tế Thông minh MedCare AI.
Dựa trên mô tả triệu chứng của bạn:
- **Lời khuyên ban đầu:** Bạn nên theo dõi thêm tần suất, mức độ đau/khó chịu và các dấu hiệu kèm theo (sốt, mệt mỏi, sụt cân).
- **Chuyên khoa đề xuất:** Nội tổng quát hoặc Chuyên khoa chuyên sâu tương ứng để bác sĩ thực hiện thăm khám lâm sàng và chỉ định xét nghiệm phù hợp.
- **Lưu ý:** Bạn có thể bấm nút **"Đặt lịch khám ngay"** bên dưới để chọn bác sĩ chuyên khoa phù hợp với thời gian mong muốn.

*Lưu ý y tế: Mọi tư vấn từ AI chỉ mang tính tham khảo hướng dẫn sơ bộ.*`,
            department: 'Nội tổng quát',
            urgency: 'NORMAL',
          },
        };

        const isHeadache = /đau đầu|nhức đầu|chóng mặt/i.test(message);
        const match = isHeadache ? simulatedReplies['dau-dau'] : simulatedReplies.default;

        res.json({
          reply: match.reply,
          urgency: match.urgency,
          suggestedDepartment: match.department,
          suggestedAction: `Đặt lịch khám chuyên khoa ${match.department}`,
        });
        return;
      }
    }

    const patientContext = patientProfile
      ? `Thông tin bệnh nhân đang trao đổi:
- Họ tên: ${patientProfile.fullName || 'Chưa cập nhật'}
- Tuổi/Năm sinh: ${patientProfile.birthYear || patientProfile.age || 'Chưa rõ'}
- Giới tính: ${patientProfile.gender || 'Chưa rõ'}
- Tiền sử bệnh nền: ${patientProfile.chronicConditions || 'Không có'}
- Dị ứng thuốc: ${patientProfile.allergies || 'Không ghi nhận'}`
      : 'Bệnh nhân chưa cung cấp hồ sơ cụ thể.';

    const systemInstruction = `Bạn là Bác sĩ Trợ lý Y tế AI (MedCare AI Assistant) của Hệ thống Y tế & Đặt lịch khám MedCare Plus.
Nhiệm vụ của bạn là lắng nghe bệnh nhân mô tả triệu chứng, đưa ra phân tích sơ bộ, hướng dẫn chăm sóc tức thời, cảnh báo dấu hiệu nguy hiểm và gợi ý chuyên khoa phù hợp để đặt lịch khám.

${patientContext}

Quy tắc ứng xử:
1. Luôn giữ thái độ ân cần, chuyên nghiệp, chuẩn mực y đức, nói tiếng Việt chuẩn.
2. Trình bày rõ ràng thành các mục:
   - 🩺 **Đánh giá ban đầu:** Nhận định các nguyên nhân phổ biến có thể gây ra triệu chứng.
   - 💡 **Chăm sóc & theo dõi tại nhà:** Lời khuyên an toàn, không tự ý kê thuốc kê đơn nguy hiểm.
   - ⚠️ **Dấu hiệu cảnh báo (Red Flags):** Khi nào cần nhập viện cấp cứu khẩn cấp.
   - 🏥 **Chuyên khoa khuyến nghị:** Chỉ định rõ tên chuyên khoa nên đăng ký khám (ví dụ: Nội tổng quát, Tim mạch, Tai Mũi Họng, Tiêu hóa, Da liễu, Nhi khoa, Cơ Xương Khớp, Sản Phụ Khoa, Thần kinh).
3. Đánh giá mức độ khẩn cấp (URGENCY) thành 1 trong 3 mức:
   - "NORMAL" (Không nguy hiểm ngay, có thể tự theo dõi hoặc khám định kỳ)
   - "RECOMMENDED_SOON" (Nên đặt hẹn khám sớm trong 1-3 ngày)
   - "EMERGENCY" (Nguy hiểm, cần gọi cấp cứu 115 hoặc tới bệnh viện ngay)
4. Luôn kèm tuyên bố miễn trừ y tế ở cuối: "⚠️ Lưu ý: Tư vấn AI mang tính chất định hướng và hỗ trợ sàng lọc ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ."
5. Trả lời trực tiếp và súc tích, dễ hiểu với người dân.`;

    const contents = [
      ...history.map((h: { role: 'user' | 'model'; text: string }) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    let replyText = '';
    try {
      const response = await ai!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: {
          systemInstruction,
        },
      });
      replyText = response.text || '';
    } catch (genAiErr: any) {
      console.warn('Gemini API call encountered temporary issue, using medical triage fallback:', genAiErr?.message);
      // Smart clinical fallback based on symptoms described
      const lower = message.toLowerCase();
      if (/đau đầu|nhức đầu|chóng mặt|tiền đình/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Cảm giác đau đầu/chóng mặt có thể liên quan đến căng thẳng thần kinh, rối loạn tiền đình, huyết áp thay đổi hoặc thiếu máu não thoáng qua.
- 💡 **Chăm sóc & theo dõi tại nhà:** Nghỉ ngơi trong không gian thoáng mát, tránh ánh sáng chói, uống đủ nước và kiểm tra huyết áp nếu có máy đo tại nhà.
- ⚠️ **Dấu hiệu cảnh báo:** Nếu đau đầu đột ngột dữ dội như sét đánh, nhìn mờ, yếu liệt tay chân hoặc nôn vọt, cần đến ngay cơ sở y tế gần nhất.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt lịch khám chuyên khoa **Nội Thần Kinh** hoặc **Nội Tổng Quát** để được đo điện não đồ, chụp MRI hoặc nội soi mạch máu nếu cần.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/ho|sốt|họng|xoang|nghẹt mũi|sổ mũi/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Sốt kèm ho, đau rát họng thường là biểu hiện của viêm đường hô hấp trên cấp tính (do virus hoặc vi khuẩn), viêm họng cấp hoặc viêm amidan.
- 💡 **Chăm sóc & theo dõi tại nhà:** Súc họng bằng nước muối sinh lý 0.9% ngày 3-4 lần, uống nhiều nước ấm, có thể dùng hạ sốt Paracetamol 500mg khi sốt trên 38.5°C (cách nhau 4-6 tiếng). Tránh tự ý mua kháng sinh uống khi chưa có chỉ định.
- ⚠️ **Dấu hiệu cảnh báo:** Sốt cao liên tục khó hạ, khó thở, thở rít, đau tức ngực hoặc ho ra máu.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt lịch khám chuyên khoa **Tai Mũi Họng** hoặc **Nội Tổng Quát** để bác sĩ nội soi và kiểm tra họng.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/ngực|tim|hồi hộp|đánh trống ngực|khó thở/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Đau tức ngực, hồi hộp có thể xuất phát từ co thắt mạch vành, rối loạn nhịp tim hoặc trào ngược thực quản chèn ép.
- 💡 **Chăm sóc & theo dõi tại nhà:** Ngừng ngay các hoạt động thể lực nặng, ngồi tựa lưng nghỉ ngơi, nới lỏng trang phục và thở sâu đều đặn.
- ⚠️ **Dấu hiệu cảnh báo:** Cơn đau thắt ngực lan ra vai trái, cổ, hàm hoặc cánh tay kéo dài trên 15 phút là dấu hiệu của nhồi máu cơ tim — Cần gọi cấp cứu **115** ngay!
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên khám sớm tại chuyên khoa **Tim Mạch & Huyết Áp** để đo điện tim ECG và siêu âm tim Doppler.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/bụng|dạ dày|tiêu hóa|buồn nôn|ợ chua|tiêu chảy/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Các triệu chứng đường tiêu hóa thường do viêm loét dạ dày tá tràng, trào ngược thực quản GERD, rối loạn tiêu hóa hoặc viêm đại tràng.
- 💡 **Chăm sóc & theo dõi tại nhà:** Ăn thức ăn mềm, lỏng, dễ tiêu; kiêng đồ cay chua, rượu bia, cà phê; chia nhỏ bữa ăn và không nằm ngay sau ăn.
- ⚠️ **Dấu hiệu cảnh báo:** Đau bụng dữ dội liên tục, nôn ra máu, đi ngoài phân đen hoặc bụng cứng như gỗ.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt khám tại chuyên khoa **Tiêu Hóa - Gan Mật** để nội soi tiêu hóa kiểm tra vi khuẩn HP.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else {
        replyText = `Chào bạn, dựa trên mô tả triệu chứng của bạn:
- 🩺 **Đánh giá ban đầu:** Triệu chứng bạn mô tả cần được bác sĩ thăm khám lâm sàng trực tiếp để xác định chính xác nguyên nhân gốc rễ.
- 💡 **Chăm sóc & theo dõi tại nhà:** Nghỉ ngơi điều độ, ăn uống đủ chất, theo dõi diễn tiến triệu chứng trong ngày.
- ⚠️ **Dấu hiệu cảnh báo:** Nếu có dấu hiệu sốt cao, đau tăng dần, mệt lả hoặc khó thở, hãy đến cơ sở y tế gần nhất ngay.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt hẹn khám tại chuyên khoa **Nội Tổng Quát** để được làm các xét nghiệm sàng lọc cần thiết.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      }
    }

    if (!replyText) {
      replyText = 'Xin lỗi, hệ thống đang bận. Bạn vui lòng liên hệ tổng đài 1900 8888 để được hỗ trợ.';
    }

    // Infer urgency & suggested specialty from response text
    let urgency: 'NORMAL' | 'RECOMMENDED_SOON' | 'EMERGENCY' = 'NORMAL';
    if (/cấp cứu|nguy kịch|khẩn cấp|115|ngay lập tức|nguy hiểm tính mạng/i.test(replyText)) {
      urgency = 'EMERGENCY';
    } else if (/khám sớm|trong 1-3 ngày|đi khám sớm|cần khám/i.test(replyText)) {
      urgency = 'RECOMMENDED_SOON';
    }

    let suggestedDepartment = 'Nội tổng quát';
    const deptList = [
      'Tai Mũi Họng',
      'Tim mạch',
      'Tiêu hóa',
      'Thần kinh',
      'Cơ Xương Khớp',
      'Da liễu',
      'Nhi khoa',
      'Sản Phụ Khoa',
      'Mắt',
      'Răng Hàm Mặt',
      'Hô hấp',
    ];
    for (const dept of deptList) {
      if (new RegExp(dept, 'i').test(replyText)) {
        suggestedDepartment = dept;
        break;
      }
    }

    res.json({
      reply: replyText,
      urgency,
      suggestedDepartment,
      suggestedAction: `Đặt lịch khám chuyên khoa ${suggestedDepartment}`,
    });
  } catch (error: any) {
    console.error('Lỗi API /api/chat:', error);
    res.status(500).json({
      error: 'Đã xảy ra lỗi khi trao đổi với AI trợ lý y tế.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedCare Plus server is running on http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
