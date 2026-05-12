// Simple seeded random number generator for stable data snapshots
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Get today's base seed so data remains consistent across reloads during the same day
function getDailySeed() {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Demo data generators for all platforms
export function generateTrendData(keywords, days = 14) {
  let baseSeed = getDailySeed();
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const row = { date: dateStr };
    
    keywords.forEach((kw, idx) => {
      let seed = baseSeed + i + idx * 10;
      // 수치 상향: 기본 만 단위 수준으로 변경
      const base = 8000 + seededRandom(seed) * 15000;
      const trend = Math.sin((i + idx * 5) / 5) * 5000;
      row[kw] = Math.max(0, Math.round(base + trend + (seededRandom(seed+1) - 0.5) * 2000));
    });
    data.push(row);
  }
  return data;
}

export function generateNaverData(keywords) {
  let baseSeed = getDailySeed() + 100;
  return keywords.map((kw, idx) => {
    const seed = baseSeed + idx;
    const pc = Math.round(seededRandom(seed) * 5000 + 500);
    const mo = Math.round(seededRandom(seed + 1) * 15000 + 2000);
    const comp = ['높음', '중간', '낮음'][Math.floor(seededRandom(seed + 2) * 3)];
    const trend = (seededRandom(seed + 3) * 40 - 20).toFixed(1);
    return {
      keyword: kw,
      pc_qc: pc,
      mo_qc: mo,
      total_qc: pc + mo,
      competition: comp,
      trend: trend,
    };
  });
}

export function generateHashtagData(hashtags, days = 14) {
  let baseSeed = getDailySeed() + 200;
  const data = [];
  const now = new Date();
  hashtags.forEach((tag, idx) => {
    let count = Math.round(seededRandom(baseSeed + idx) * 50000 + 10000);
    for (let i = days; i >= 0; i--) {
      let seed = baseSeed + i + idx * 10;
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      count += Math.round(seededRandom(seed) * 500 - 100);
      data.push({
        hashtag: tag,
        date: d.toISOString().split('T')[0],
        postCount: Math.max(0, count),
        dailyNew: Math.round(seededRandom(seed + 1) * 200 + 50),
        avgLikes: Math.round(seededRandom(seed + 2) * 500 + 50),
        avgComments: Math.round(seededRandom(seed + 3) * 50 + 5),
      });
    }
  });
  return data;
}

export function generateAutocompleteData(keyword) {
  let baseSeed = getDailySeed() + 300;
  const suffixes = {
    '선크림': ['추천','순한','톤업','저자극','SPF50','유아용','남자','비건'],
    'PDRN': ['앰플','효과','크림','시술','가격','부작용','연어','원액'],
    '웨딩홀': ['가격','서울','강남','수원','저렴한','뷔페','호텔','야외'],
    default: ['추천','후기','가격','비교','효과','인기','신제품','트렌드'],
  };
  const list = suffixes[keyword] || suffixes.default;
  return list.map((s, i) => {
    let seed = baseSeed + i;
    return {
      suggestion: `${keyword} ${s}`,
      type: ['해시태그','계정','키워드'][i % 3],
      score: Math.round(seededRandom(seed) * 100),
      change: ['🔼','🔽','➡️'][Math.floor(seededRandom(seed+1)*3)],
    };
  });
}

export function generateContentReaction(keywords) {
  let baseSeed = getDailySeed() + 400;
  return keywords.map((kw, idx) => {
    let seed = baseSeed + idx;
    return {
      keyword: kw,
      posts: Math.round(seededRandom(seed) * 3000 + 200),
      likes: Math.round(seededRandom(seed+1) * 50000 + 5000),
      saves: Math.round(seededRandom(seed+2) * 10000 + 1000),
      shares: Math.round(seededRandom(seed+3) * 5000 + 300),
      comments: Math.round(seededRandom(seed+4) * 3000 + 200),
      engagementRate: (seededRandom(seed+5) * 8 + 1).toFixed(2),
    };
  });
}

export function generateExternalComparison(keyword) {
  let baseSeed = getDailySeed() + 500;
  const sources = [
    { source: '네이버 데이터랩', role: '국내 검색 수요 추이' },
    { source: '구글 트렌드', role: '글로벌/일본/미국 관심도' },
    { source: '틱톡 검색/자동완성', role: '숏폼 기반 관심 키워드' },
    { source: '유튜브 검색어/자동완성', role: '콘텐츠 소비형 키워드' },
    { source: '인스타그램 해시태그/릴스', role: '비주얼·SNS 반응 검증' },
    { source: '메타 광고관리자', role: '타깃 규모·관심사 가설 검증' },
  ];
  return sources.map((s, i) => ({
    ...s,
    score: Math.round(seededRandom(baseSeed + i) * 100),
    trend: ['🔼','🔽','➡️'][Math.floor(seededRandom(baseSeed + i + 1)*3)],
  }));
}

export function generateGenAIOptimizationData(siteUrl) {
  let baseSeed = getDailySeed() + 700;
  
  const platforms = [
    { name: 'ChatGPT', type: '대화형 검색' },
    { name: 'Perplexity', type: '답변 엔진' },
    { name: 'Claude', type: '대화형 검색' },
    { name: 'Google Gemini', type: '답변 엔진' }
  ];
  
  return platforms.map((plat, i) => {
    let seed = baseSeed + i;
    
    // Referral traffic coming from the AI chat UI clicks
    const referralTraffic = Math.round(seededRandom(seed) * 30000 + 1000);
    
    // The proportion of times the site is shown in answers but NOT clicked (Zero-click SOV)
    const zeroClickSov = (seededRandom(seed + 1) * 40 + 10).toFixed(1); 
    
    // Rank of how often this domain is cited relative to competitors in answers
    const citationRank = Math.floor(seededRandom(seed + 2) * 5) + 1;
    
    // Content formats mostly cited from this site
    const contentFormats = ['FAQ 페이지', '블로그 아티클', '상품 상세페이지', '뉴스/PR', '지식베이스(위키)'];
    const dominantFormat = contentFormats[Math.floor(seededRandom(seed + 3) * contentFormats.length)];

    return {
      platform: plat.name,
      type: plat.type,
      referralTraffic: referralTraffic,
      zeroClickSov: zeroClickSov,
      citationRank: citationRank,
      dominantFormat: dominantFormat,
      growth: (seededRandom(seed + 4) * 50 - 10).toFixed(1) // -10% ~ +40%
    };
  }).sort((a,b) => b.referralTraffic - a.referralTraffic);
}
