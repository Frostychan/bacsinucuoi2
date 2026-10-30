interface EventContext {
  request: Request;
  env: Record<string, string>;
}

export const onRequestPost = async (context: EventContext) => {
  try {
    const body: any = await context.request.json();
    const { message, patientProfile } = body || {};

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Nội dung tin nhắn không hợp lệ' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.GEMINI_API_KEY;
    let replyText = '';

    if (apiKey) {
      try {
        const patientContext = patientProfile
          ? `Bệnh nhân: ${patientProfile.fullName || 'Khách'}, giới tính: ${patientProfile.gender || 'Chưa rõ'}, tiền sử: ${patientProfile.chronicConditions || 'Không'}, dị ứng: ${patientProfile.allergies || 'Không'}`
          : 'Chưa có hồ sơ.';

        const systemInstruction = `Bạn là Bác sĩ Trợ lý Y tế AI (MedCare AI) của MedCare Plus.
Nhiệm vụ: phân tích triệu chứng sơ bộ, đưa ra hướng dẫn chăm sóc tức thời, cảnh báo nguy hiểm (Red Flags), và gợi ý chuyên khoa phù hợp để đặt khám.
${patientContext}
Cung cấp câu trả lời chuẩn mực, ân cần bằng tiếng Việt và kết thúc bằng lưu ý miễn trừ y tế.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemInstruction}\n\nNgười bệnh hỏi: ${message}` }],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const resData: any = await geminiRes.json();
          replyText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (e) {
        console.warn('Gemini Cloudflare fetch failed, fallback to medical heuristics', e);
      }
    }

    // Heuristics fallback if API key is absent or temporary network issue
    if (!replyText) {
      const lower = message.toLowerCase();
      if (/đau đầu|nhức đầu|chóng mặt|tiền đình/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Cảm giác đau đầu/chóng mặt có thể liên quan đến căng thẳng thần kinh, rối loạn tiền đình, huyết áp thay đổi hoặc thiếu máu não thoáng qua.
- 💡 **Chăm sóc & theo dõi tại nhà:** Nghỉ ngơi trong không gian thoáng mát, tránh ánh sáng chói, uống đủ nước và kiểm tra huyết áp nếu có máy đo tại nhà.
- ⚠️ **Dấu hiệu cảnh báo:** Nếu đau đầu đột ngột dữ dội, nhìn mờ, yếu liệt tay chân hoặc nôn vọt, cần đến ngay cơ sở y tế gần nhất.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt lịch khám chuyên khoa **Nội Thần Kinh** hoặc **Nội Tổng Quát**.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/ho|sốt|họng|xoang|nghẹt mũi|sổ mũi/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Sốt kèm ho, đau rát họng thường là biểu hiện của viêm đường hô hấp trên cấp tính, viêm họng cấp hoặc viêm amidan.
- 💡 **Chăm sóc & theo dõi tại nhà:** Súc họng bằng nước muối sinh lý 0.9% ngày 3-4 lần, uống nhiều nước ấm, có thể dùng hạ sốt Paracetamol 500mg khi sốt trên 38.5°C.
- ⚠️ **Dấu hiệu cảnh báo:** Sốt cao liên tục khó hạ, khó thở, thở rít, đau tức ngực hoặc ho ra máu.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt lịch khám chuyên khoa **Tai Mũi Họng** hoặc **Nội Tổng Quát**.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/ngực|tim|hồi hộp|đánh trống ngực|khó thở/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Đau tức ngực, hồi hộp có thể xuất phát từ co thắt mạch vành, rối loạn nhịp tim hoặc trào ngược thực quản chèn ép.
- 💡 **Chăm sóc & theo dõi tại nhà:** Ngừng ngay các hoạt động thể lực nặng, ngồi tựa lưng nghỉ ngơi, nới lỏng trang phục và thở sâu đều đặn.
- ⚠️ **Dấu hiệu cảnh báo:** Cơn đau thắt ngực lan ra vai trái, cổ, hàm hoặc cánh tay kéo dài trên 15 phút là dấu hiệu của nhồi máu cơ tim — Cần gọi cấp cứu **115** ngay!
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên khám sớm tại chuyên khoa **Tim Mạch & Huyết Áp**.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else if (/bụng|dạ dày|tiêu hóa|buồn nôn|ợ chua|tiêu chảy/i.test(lower)) {
        replyText = `Chào bạn, dựa trên triệu chứng bạn vừa chia sẻ:
- 🩺 **Đánh giá ban đầu:** Các triệu chứng đường tiêu hóa thường do viêm loét dạ dày tá tràng, trào ngược thực quản GERD, rối loạn tiêu hóa hoặc viêm đại tràng.
- 💡 **Chăm sóc & theo dõi tại nhà:** Ăn thức ăn mềm, lỏng, dễ tiêu; kiêng đồ cay chua, rượu bia, cà phê; chia nhỏ bữa ăn và không nằm ngay sau ăn.
- ⚠️ **Dấu hiệu cảnh báo:** Đau bụng dữ dội liên tục, nôn ra máu, đi ngoài phân đen hoặc bụng cứng như gỗ.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt khám tại chuyên khoa **Tiêu Hóa - Gan Mật**.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      } else {
        replyText = `Chào bạn, dựa trên mô tả triệu chứng của bạn:
- 🩺 **Đánh giá ban đầu:** Triệu chứng bạn mô tả cần được bác sĩ thăm khám lâm sàng trực tiếp để xác định chính xác nguyên nhân gốc rễ.
- 💡 **Chăm sóc & theo dõi tại nhà:** Nghỉ ngơi điều độ, ăn uống đủ chất, theo dõi diễn tiến triệu chứng trong ngày.
- ⚠️ **Dấu hiệu cảnh báo:** Nếu có dấu hiệu sốt cao, đau tăng dần, mệt lả hoặc khó thở, hãy đến cơ sở y tế gần nhất ngay.
- 🏥 **Chuyên khoa khuyến nghị:** Bạn nên đặt hẹn khám tại chuyên khoa **Nội Tổng Quát**.

⚠️ *Lưu ý: Tư vấn mang tính định hướng ban đầu, không thay thế chẩn đoán y khoa trực tiếp của bác sĩ.*`;
      }
    }

    let urgency = 'NORMAL';
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
    ];
    for (const dept of deptList) {
      if (new RegExp(dept, 'i').test(replyText)) {
        suggestedDepartment = dept;
        break;
      }
    }

    return new Response(
      JSON.stringify({
        reply: replyText,
        urgency,
        suggestedDepartment,
        suggestedAction: `Đặt lịch khám chuyên khoa ${suggestedDepartment}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Internal Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
