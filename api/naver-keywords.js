// Vercel Serverless Function — Naver 검색광고 키워드 검색량 API 프록시
// GET /api/naver-keywords?keywords=나이키,아디다스
// 환경변수 설정: Vercel Dashboard > Settings > Environment Variables
//   NAVER_AD_API_KEY     : 네이버 검색광고 API 키
//   NAVER_AD_SECRET_KEY  : 네이버 검색광고 비밀 키
//   NAVER_AD_CUSTOMER_ID : 네이버 검색광고 계정 ID

import { createHmac } from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey     = process.env.NAVER_AD_API_KEY;
  const secretKey  = process.env.NAVER_AD_SECRET_KEY;
  const customerId = process.env.NAVER_AD_CUSTOMER_ID;

  if (!apiKey || !secretKey || !customerId) {
    return res.status(503).json({ error: 'NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID not configured' });
  }

  const { keywords } = req.query;
  if (!keywords) return res.status(400).json({ error: 'keywords query param is required' });

  const timestamp = Date.now().toString();
  const method    = 'GET';
  const path      = '/keywordstool';

  const signature = createHmac('sha256', secretKey)
    .update(`${timestamp}.${method}.${path}`)
    .digest('base64');

  try {
    const url = new URL('https://api.searchad.naver.com/keywordstool');
    url.searchParams.set('hintKeywords', keywords);
    url.searchParams.set('showDetail', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY':    apiKey,
        'X-CUSTOMER':   customerId,
        'X-TIMESTAMP':  timestamp,
        'X-SIGNATURE':  signature,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.errorMessage || 'Naver Ad API error' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('naver-keywords error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
