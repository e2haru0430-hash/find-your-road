// Vercel Serverless Function — Gemini AI 분석 어시스턴트 프록시
// POST /api/gemini-chat
// 환경변수: GEMINI_API_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });

  const { message, context = '', history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  const systemPrompt = `당신은 'Find your Road' 디지털 마케팅 분석 대시보드의 AI 어시스턴트입니다.
현재 대시보드 데이터를 기반으로 마케팅 전략, 데이터 해석, 실행 가능한 인사이트를 제공합니다.

[현재 대시보드 컨텍스트]
${context || '브랜드 검색 트렌드 분석 대시보드'}

답변 지침:
- 한국어로 간결하게 답변하세요 (3~6문장 권장)
- 데이터 수치를 직접 언급하며 설명하세요
- 마케팅 전략 관점의 실용적인 인사이트를 제공하세요
- 확인이 어려운 내용은 솔직하게 "제공된 데이터 범위에서 확인이 어렵습니다"라고 답하세요
- 마크다운 볼드(**)는 사용하지 말고 일반 텍스트로 답변하세요`;

  // 최근 6회 교환 기록만 전달 (토큰 절약)
  const recentHistory = history.slice(-6);
  const contents = [
    ...recentHistory.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Gemini API error (HTTP ${response.status})`,
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'Gemini 응답이 비어 있습니다' });

    res.json({ text });
  } catch (err) {
    console.error('gemini-chat error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
