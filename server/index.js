import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import googleTrends from 'google-trends-api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Find your Road API Server is running' });
});

// Google Trends API proxy
app.post('/api/google-trends', async (req, res) => {
  try {
    const { keywords, geo = 'KR', startTime, endTime } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    // Google trends API has limits on concurrent keywords (usually max 5)
    const limitedKeywords = keywords.slice(0, 5);
    
    const results = await googleTrends.interestOverTime({
      keyword: limitedKeywords,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
      geo: geo === '전세계' ? '' : geo === '한국' ? 'KR' : geo === '미국' ? 'US' : geo === '일본' ? 'JP' : geo,
    });
    
    res.json(JSON.parse(results));
  } catch (error) {
    console.error('Google Trends Error:', error);
    res.status(500).json({ error: 'Failed to fetch Google Trends data' });
  }
});

// For Naver, Instagram, TikTok, YouTube we use simulation or external collectors
// In a full production app, this would integrate with actual Naver API, Meta API, etc.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
