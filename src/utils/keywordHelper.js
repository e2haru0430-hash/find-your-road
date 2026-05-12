
/**
 * 브랜드명을 기반으로 연관/확장 키워드를 생성합니다.
 */
export const expandKeywords = (brandName) => {
  if (!brandName) return '';
  const suffixes = ['추천', '후기', '가격', '효과', '부작용', '사용법', '정품', '세일'];
  return `${brandName}, ${suffixes.map(s => `${brandName} ${s}`).join(', ')}`;
};

/**
 * 인스타그램 반응 키워드를 브랜드명에 맞춰 생성합니다.
 */
export const generateInstagramKeywords = (brandName) => {
  if (!brandName) return ['반응 없음'];
  return [`${brandName} 발색`, `${brandName} 꿀조합`, `${brandName} 내돈내산`, `${brandName} 선물추천`, `${brandName} 성분분석`, '피부광택'];
};

/**
 * 쇼핑몰 플랫폼별 브랜드 입점 여부를 체크합니다.
 */
export const isBrandOnPlatform = (brandName, platformId) => {
  if (!brandName) return false;
  const brand = brandName.toLowerCase();
  
  if (brand.includes('나이키') && platformId === 'oliveyoung') return false;
  if (brand.includes('리쥬란') && platformId === 'amazon') return false; 
  
  return true; 
};

/**
 * 최근 30일(1개월) 일별 트렌드 데이터를 생성합니다. (수치 상향 모델)
 */
export const generateMonthlyTrend = (brandName, baseValue = 15000) => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const randomFactor = 0.7 + Math.random() * 0.6;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekendFactor = isWeekend ? 1.3 : 1.0;
    
    data.push({
      date: dateStr,
      value: Math.round(baseValue * randomFactor * weekendFactor)
    });
  }
  return data;
};

/**
 * 최근 n일 이내의 랜덤 날짜를 생성합니다 (YYYY.MM.DD 형식)
 */
export const getRandomDateInLastDays = (days = 3) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  
  const y = pastDate.getFullYear();
  const m = String(pastDate.getMonth() + 1).padStart(2, '0');
  const d = String(pastDate.getDate()).padStart(2, '0');
  
  return `${y}.${m}.${d}`;
};

/**
 * 브랜드별 가상 리뷰 데이터를 생성합니다. (대량 데이터셋 및 조합 로직)
 */
export const generateDynamicReviews = (brandName, lang = 'ko') => {
  const pool = {
    ko: {
      pos_heads: [`${brandName} 진짜 대박이네요.`, `역시 ${brandName}입니다.`, `고민하다 샀는데 ${brandName} 최고예요.`, `${brandName} 재구매 의사 200%입니다.`, `친구 추천으로 ${brandName} 샀는데 대만족!`],
      pos_bodies: [`배송도 하루 만에 오고 포장도 꼼꼼해요.`, `사용해보니 확실히 차이가 느껴집니다.`, `가성비도 이 정도면 훌륭한 것 같아요.`, `피부결이 정돈되는 느낌이 바로 드네요.`, `향도 자극적이지 않고 딱 좋습니다.`],
      pos_tails: [`다 쓰면 또 주문할게요!`, `번창하세요~`, `주변에도 추천 많이 하고 있어요.`, `인생템 등극입니다.`, `포인트 많이 쌓여서 좋네요.`],
      
      neg_heads: [`${brandName} 조금 실망스럽네요.`, `${brandName} 기대가 컸나 봐요.`, `음.. ${brandName}은 저랑 안 맞는 듯.`, `${brandName} 배송 상태가 좀...`],
      neg_bodies: [`효과가 생각보다 드라마틱하지 않아요.`, `가격 대비 양이 좀 적은 것 같습니다.`, `배송이 3일이나 걸려서 답답했어요.`, `제형이 저한테는 조금 무거운 느낌이에요.`],
      neg_tails: [`다음엔 다른 거 써보려고요.`, `개선이 필요해 보입니다.`, `환불하고 싶은데 귀찮아서 그냥 써요.`, `그냥 보통입니다.`]
    },
    en: {
      pos_heads: [`${brandName} is absolutely amazing.`, `Best purchase ever with ${brandName}.`, `I'm in love with ${brandName}!`],
      pos_bodies: [`Quality is top-notch and results are visible.`, `Highly effective and worth the price.`, `Fast shipping and great packaging.`],
      pos_tails: [`Will buy again soon!`, `Highly recommended to everyone.`, `5 stars for sure!`],
      
      neg_heads: [`Disappointed with ${brandName}.`, `${brandName} didn't work for me.`],
      neg_bodies: [`Taking too long to show results.`, `Price is a bit steep for the quantity.`],
      neg_tails: [`Might look for alternatives.`, `Expected more for this brand.`]
    }
  };

  const selected = pool[lang] || pool['ko'];
  const authors = ['김*준', '이*연', '최*민', '박*서', '정*훈', '한*희', 'Rose_99', 'Shopper_A', 'User_55', 'BeautyGuru'];

  const createReview = (type) => {
    const heads = type === 'pos' ? selected.pos_heads : selected.neg_heads;
    const bodies = type === 'pos' ? selected.pos_bodies : selected.neg_bodies;
    const tails = type === 'pos' ? selected.pos_tails : selected.neg_tails;
    
    // 브랜드명에 기반한 랜덤 인덱스 생성을 위해 hash 사용
    const hash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
      return Math.abs(h);
    };

    const reviews = [];
    for (let i = 0; i < 3; i++) {
      const seed = hash(brandName) + i;
      const h = heads[seed % heads.length];
      const b = bodies[(seed + 1) % bodies.length];
      const t = tails[(seed + 2) % tails.length];
      const a = authors[(seed + 3) % authors.length];
      
      reviews.push({
        id: `${type}-${i}`,
        content: `${h} ${b} ${t}`,
        author: a,
        rating: type === 'pos' ? 5 : 2,
        date: getRandomDateInLastDays(3)
      });
    }
    return reviews;
  };

  return {
    positive: createReview('pos'),
    negative: createReview('neg')
  };
};
