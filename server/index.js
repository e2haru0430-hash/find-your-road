import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import googleTrends from 'google-trends-api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Find your Road API Server is running',
    naver:   !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    naverAd: !!(process.env.NAVER_AD_API_KEY && process.env.NAVER_AD_SECRET_KEY && process.env.NAVER_AD_CUSTOMER_ID),
  });
});

// ── Google Trends API proxy ───────────────────────────────────────────────────
app.post('/api/google-trends', async (req, res) => {
  try {
    const { keywords, geo = 'KR', startTime, endTime } = req.body;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }
    const results = await googleTrends.interestOverTime({
      keyword: keywords.slice(0, 5),
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
      geo: geo === '전세계' ? '' : geo === '한국' ? 'KR' : geo === '미국' ? 'US' : geo === '일본' ? 'JP' : geo,
    });
    res.json(JSON.parse(results));
  } catch (error) {
    console.error('Google Trends Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Google Trends data' });
  }
});

// ── Naver DataLab 검색어 트렌드 API ──────────────────────────────────────────
// https://developers.naver.com/docs/serviceapi/datalab/search/search.md
// 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
app.post('/api/naver-datalab', async (req, res) => {
  const clientId     = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET not configured' });
  }

  const { startDate, endDate, timeUnit = 'date', keywordGroups } = req.body;

  if (!startDate || !endDate || !keywordGroups || keywordGroups.length === 0) {
    return res.status(400).json({ error: 'startDate, endDate, keywordGroups are required' });
  }

  // DataLab: 최대 5개 그룹, 각 그룹 최대 5개 키워드
  const limitedGroups = keywordGroups.slice(0, 5).map(g => ({
    groupName: g.groupName,
    keywords:  g.keywords.slice(0, 5),
  }));

  try {
    const { data } = await axios.post(
      'https://openapi.naver.com/v1/datalab/search',
      { startDate, endDate, timeUnit, keywordGroups: limitedGroups },
      {
        headers: {
          'X-Naver-Client-Id':     clientId,
          'X-Naver-Client-Secret': clientSecret,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.errorMessage || err.message;
    console.error('Naver DataLab Error:', status, message);
    res.status(status).json({ error: message });
  }
});

// ── Naver 검색광고 키워드 검색량 API ─────────────────────────────────────────
// https://naver.github.io/searchad-apidoc/#/tags/Keyword
// 환경변수: NAVER_AD_API_KEY, NAVER_AD_SECRET_KEY, NAVER_AD_CUSTOMER_ID
app.get('/api/naver-keywords', async (req, res) => {
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

  // HMAC-SHA256 서명: "{timestamp}.{METHOD}.{path}"
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}.${method}.${path}`)
    .digest('base64');

  try {
    const { data } = await axios.get('https://api.searchad.naver.com/keywordstool', {
      params: { hintKeywords: keywords, showDetail: 1 },
      headers: {
        'X-API-KEY':    apiKey,
        'X-CUSTOMER':   customerId,
        'X-TIMESTAMP':  timestamp,
        'X-SIGNATURE':  signature,
      },
      timeout: 10000,
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.errorMessage || err.message;
    console.error('Naver Ad Keywords Error:', status, message);
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Naver DataLab: ${process.env.NAVER_CLIENT_ID ? '✅ configured' : '⚠️  not configured (demo mode)'}`);
  console.log(`Naver Ad API:  ${process.env.NAVER_AD_API_KEY ? '✅ configured' : '⚠️  not configured (demo mode)'}`);
});
