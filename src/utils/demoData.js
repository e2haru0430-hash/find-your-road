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

// Stable per-string hash → keyword-specific base level that doesn't change per data point
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

// Demo data generators for all platforms
// unit: '일간' | '주간' | '월간'
// numPoints: number of data points to generate (defaults per unit when not supplied)
export function generateTrendData(keywords, numPoints, unit = '일간') {
  const dailySeed = getDailySeed();
  const data = [];
  const now = new Date();

  // Default point counts per unit
  if (numPoints == null) {
    numPoints = unit === '월간' ? 6 : unit === '주간' ? 12 : 14;
  }

  if (unit === '주간') {
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      // Anchor to Monday of that week
      const dow = d.getDay();
      d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
      const dateStr = d.toISOString().split('T')[0];
      const row = { date: dateStr };
      keywords.forEach((kw, idx) => {
        const kwBase = 8000 + (hashStr(kw) % 15000);
        let val = kwBase;
        const walkSeed = dailySeed + hashStr(kw) + 1000;
        for (let j = numPoints - 1; j >= i; j--) {
          val += (seededRandom(walkSeed + j * 17 + idx * 11) - 0.47) * 3500;
        }
        row[kw] = Math.max(2000, Math.round(val));
      });
      data.push(row);
    }
  } else if (unit === '월간') {
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const row = { date: dateStr };
      keywords.forEach((kw, idx) => {
        const kwBase = 8000 + (hashStr(kw) % 15000);
        let val = kwBase;
        const walkSeed = dailySeed + hashStr(kw) + 2000;
        for (let j = numPoints - 1; j >= i; j--) {
          val += (seededRandom(walkSeed + j * 19 + idx * 13) - 0.46) * 6000;
        }
        row[kw] = Math.max(3000, Math.round(val));
      });
      data.push(row);
    }
  } else {
    // 일간: random walk with weekend dampening
    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const row = { date: dateStr };
      const dow = d.getDay();
      const weekendFactor = (dow === 0 || dow === 6) ? 0.83 : 1.0;
      keywords.forEach((kw, idx) => {
        const kwBase = 8000 + (hashStr(kw) % 15000);
        let val = kwBase;
        const walkSeed = dailySeed + hashStr(kw);
        for (let j = numPoints - 1; j >= i; j--) {
          val += (seededRandom(walkSeed + j * 13 + idx * 7) - 0.48) * 2200;
        }
        row[kw] = Math.max(500, Math.round(val * weekendFactor));
      });
      data.push(row);
    }
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

// 키워드 언어 자동 감지 (마켓 기준보다 우선)
function detectKeywordLocale(keyword) {
  if (!keyword) return null;
  if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(keyword)) return 'ko';    // 한국어
  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(keyword))              return 'ja';    // 일본어/한자
  if (/[\u0e00-\u0e7f]/.test(keyword))                           return 'th';    // 태국어
  if (/[\u0400-\u04ff]/.test(keyword))                           return 'ru';    // 러시아어(폴란드 일부)
  // 베트남어 특수 발음 부호 체크
  if (/[\u00c0-\u024f\u1e00-\u1eff]/.test(keyword)) {
    const vn = /[\u0103\u01a1\u01b0\u1ea1-\u1ef9]/;             // 베트남 특유 글자
    if (vn.test(keyword)) return 'vn';
  }
  return null; // 감지 불가 → 마켓 기준 사용
}
function getLocaleGroup(market) {
  const map = {
    domestic: 'ko', jp: 'ja',
    id: 'id', vn: 'vn', th: 'th', ph: 'ph', 'sea-all': 'sea',
    'us-ca': 'en', au: 'en', 'w-eu': 'en', 'e-eu': 'en',
    de: 'de', fr: 'fr', it: 'it', es: 'es',
    nl: 'nl', se: 'sv', pl: 'pl'
  };
  return map[market] || 'ko';
}

const AUTOCOMPLETE_SUFFIXES = {
  ko: ['추천', '후기', '가격', '비교', '공식', '인기', '신제품', '트렌드', '매장', '구매', '리뷰', '할인', '쿠폰', '이벤트'],
  ja: ['おすすめ', 'レビュー', '口コミ', '効果', '価格', '使い方', '成分', '比較', '購入', 'クーポン', '新商品', '人気'],
  en: ['review', 'dupe', 'before after', 'routine', 'discount', 'ingredients', 'tutorial', 'vs', 'coupon', 'haul', 'best', 'unboxing'],
  de: ['Empfehlung', 'Bewertung', 'Preis', 'Vergleich', 'Wirkung', 'beliebt', 'neu', 'Trend', 'Inhaltsstoffe', 'kaufen', 'Rabatt', 'Gutschein'],
  fr: ['recommandation', 'avis', 'prix', 'comparaison', 'effet', 'populaire', 'nouveau', 'tendance', 'ingrédients', 'acheter', 'réduction', 'code promo'],
  it: ['consiglio', 'recensione', 'prezzo', 'confronto', 'effetto', 'popolare', 'nuovo', 'tendenza', 'ingredienti', 'comprare', 'sconto', 'coupon'],
  es: ['recomendación', 'opinión', 'precio', 'comparación', 'efecto', 'popular', 'nuevo', 'tendencia', 'ingredientes', 'comprar', 'descuento', 'cupón'],
  nl: ['aanbeveling', 'review', 'prijs', 'vergelijken', 'effect', 'populair', 'nieuw', 'trend', 'ingrediënten', 'kopen', 'korting', 'coupon'],
  sv: ['rekommendation', 'recension', 'pris', 'jämför', 'effekt', 'populär', 'ny', 'trend', 'ingredienser', 'köpa', 'rabatt', 'kupong'],
  pl: ['polecane', 'opinie', 'cena', 'porównanie', 'efekt', 'popularne', 'nowość', 'trend', 'składniki', 'kup', 'rabat', 'kupon'],
  vn: ['đánh giá', 'giá', 'so sánh', 'hiệu quả', 'phổ biến', 'mới', 'xu hướng', 'thành phần', 'mua', 'giảm giá'],
  th: ['รีวิว', 'ราคา', 'เปรียบเทียบ', 'ผลลัพธ์', 'ยอดฮิต', 'ใหม่', 'เทรนด์', 'ส่วนผสม', 'ซื้อ', 'ส่วนลด'],
  id: ['ulasan', 'harga', 'bandingkan', 'efek', 'populer', 'baru', 'tren', 'bahan', 'beli', 'diskon'],
  ph: ['review', 'presyo', 'kumpirmahin', 'epekto', 'sikat', 'bago', 'trend', 'ingredients', 'bili', 'discount'],
  sea: ['review', 'harga', 'murah', 'terbaik', 'original', 'promo', 'manfaat', 'cara pakai', 'beli dimana', 'asli', 'diskon', 'terpercaya'],
};

export function generateAutocompleteData(keyword, market = 'domestic') {
  // 1순위: 키워드 언어 자동 감지 / 2순위: GEO 마켓 설정
  const detectedLocale = detectKeywordLocale(keyword);
  const locale = detectedLocale || getLocaleGroup(market);
  const pool = AUTOCOMPLETE_SUFFIXES[locale] || AUTOCOMPLETE_SUFFIXES['en'];
  const dailySeed = getDailySeed() + 300;
  const TYPES = ['해시태그', '계정', '키워드'];
  const CHANGES = ['🔼', '🔽', '➡️'];

  // 키워드 해시 기반으로 pool에서 8개 고유 접미사 선택 (브랜드마다 다른 조합)
  const kwHash = hashStr(keyword + locale);
  const shuffled = pool
    .map((sfx, idx) => ({ sfx, sort: hashStr(keyword + sfx + idx) }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.sfx);
  const selected = shuffled.slice(0, 8);

  return selected.map((sfx) => {
    const suggestion = `${keyword} ${sfx}`;
    const seed = dailySeed + hashStr(suggestion);
    return {
      suggestion,
      type: TYPES[Math.floor(seededRandom(seed) * TYPES.length)],
      score: Math.round(seededRandom(seed + 1) * 85 + 10),   // 10~95, 브랜드+접미사 고유값
      change: CHANGES[Math.floor(seededRandom(seed + 2) * CHANGES.length)],
    };
  // score 내림차순 정렬
  }).sort((a, b) => b.score - a.score);

  void kwHash; // used via hashStr above
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
  // URL 기반 고정 시드 — 날짜와 무관하게 동일 URL이면 항상 동일한 값 반환
  const urlSeed = hashStr(siteUrl || 'default') + 700;

  const platforms = [
    { name: 'ChatGPT',       type: '대화형 검색' },
    { name: 'Perplexity',    type: '답변 엔진' },
    { name: 'Claude',        type: '대화형 검색' },
    { name: 'Google Gemini', type: '답변 엔진' },
  ];

  const contentFormats = ['FAQ 페이지', '블로그 아티클', '상품 상세페이지', '뉴스/PR', '지식베이스(위키)'];

  return platforms.map((plat, i) => {
    // 플랫폼별로 독립적인 시드 분기 — 충돌 방지를 위해 간격을 크게 둠
    const seed = urlSeed + (i + 1) * 1000;

    const referralTraffic = Math.round(seededRandom(seed)     * 30000 + 1000);
    const zeroClickSov    = (seededRandom(seed + 1) * 40 + 10).toFixed(1);
    const citationRank    = Math.floor(seededRandom(seed + 2) * 5) + 1;
    const dominantFormat  = contentFormats[Math.floor(seededRandom(seed + 3) * contentFormats.length)];
    const growth          = (seededRandom(seed + 4) * 50 - 10).toFixed(1);

    return {
      platform: plat.name,
      type: plat.type,
      referralTraffic,
      zeroClickSov,
      citationRank,
      dominantFormat,
      growth,
    };
  }).sort((a, b) => b.referralTraffic - a.referralTraffic);
}
