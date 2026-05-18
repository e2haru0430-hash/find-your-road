// Vercel Serverless Function — Naver DataLab 검색어 트렌드 API 프록시
// POST /api/naver-datalab
// 환경변수 설정: Vercel Dashboard > Settings > Environment Variables
//   NAVER_CLIENT_ID      : 네이버 개발자센터 애플리케이션 Client ID
//   NAVER_CLIENT_SECRET  : 네이버 개발자센터 애플리케이션 Client Secret

export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET not configured in Vercel environment variables' });
  }

  const { startDate, endDate, timeUnit = 'date', keywordGroups } = req.body;

  if (!startDate || !endDate || !Array.isArray(keywordGroups) || keywordGroups.length === 0) {
    return res.status(400).json({ error: 'startDate, endDate, keywordGroups are required' });
  }

  const limitedGroups = keywordGroups.slice(0, 5).map(g => ({
    groupName: g.groupName,
    keywords:  g.keywords.slice(0, 5),
  }));

  try {
    const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'X-Naver-Client-Id':     clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, timeUnit, keywordGroups: limitedGroups }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.errorMessage || 'Naver API error' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('naver-datalab error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
