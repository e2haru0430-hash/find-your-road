// Industry detection patterns (Korean + English)
// Professional-service industries are listed first to take priority over general patterns
const PATTERNS = {
  // ── 전문서비스 (소비재 아님, 인력·전문성 기반) ──────────────────────────
  legal:     /법무법인|법률사무소|법률사무|변호사|로펌|법원|형사소송|민사소송|이혼전문|상속전문|기업법무|특허법|지적재산|법률상담|소송|법률자문|노동법|행정법|공증|등기법무|법무팀|law firm|attorney|lawyer|litigation|legal counsel|legal service|solicitor|barrister|corporate law/i,
  medical:   /병원|의원|클리닉|진료|의사|외과|내과|피부과|안과|치과|정형외과|한의원|성형외과|산부인과|한방병원|재활병원|요양병원|의료법인|hospital|clinic|doctor|physician|surgery|treatment|dental|dermatology|orthopedic|gynecology|ophthalmology/i,
  consulting:/컨설팅|경영컨설팅|전략컨설팅|경영자문|비즈니스컨설팅|세무사|회계법인|공인회계사|세금신고|세무상담|management consulting|business advisory|strategy consulting|accounting firm|tax advisory|cpa firm/i,

  // ── 소비재·서비스 ───────────────────────────────────────────────────────
  beauty:    /피부|스킨케어|로션|크림|세럼|에센스|클렌징|토너|선크림|파운데이션|립스틱|립밤|아이섀도|마스카라|헤어케어|샴푸|트리트먼트|향수|퍼퓸|뷰티|화장품|미용|팩|마스크팩|설화수|헤라|이니스프리|라네즈|아이오페|클리오|롬앤|skincare|serum|moisturizer|cleanser|sunscreen|foundation|lipstick|mascara|toner|shampoo|conditioner|perfume|beauty|cosmetic|makeup/i,
  fashion:   /의류|패션|티셔츠|셔츠|코트|자켓|가방|핸드백|구두|신발|운동화|스니커즈|청바지|팬츠|원피스|스커트|니트|후드|코디|스타일|아우터|패딩|점퍼|명품|나이키|아디다스|뉴발란스|컨버스|자라|에이치앤엠|무신사|fashion|clothing|shoes|sneakers|bag|handbag|jacket|coat|jeans|dress|skirt|sweater|hoodie|outfit|style|luxury|nike|adidas|zara/i,
  food:      /식품|음식|커피|음료|주스|요거트|단백질|보충제|과자|쿠키|케이크|빵|라면|치킨|피자|맛집|카페|건강식품|다이어트식품|프로틴|간식|스낵|food|coffee|drink|juice|protein|supplement|snack|cookie|cake|restaurant|cafe|nutrition|beverage/i,
  tech:      /노트북|태블릿|스마트폰|이어폰|헤드폰|스피커|카메라|가전제품|충전기|배터리|마우스|키보드|모니터|게이밍|핸드폰|삼성전자|애플|엘지전자|갤럭시|아이폰|맥북|laptop|tablet|smartphone|earphone|headphone|speaker|camera|charger|keyboard|mouse|monitor|gaming|phone|samsung|apple|macbook/i,
  health:    /비타민|영양제|오메가3|유산균|콜라겐|마그네슘|아연|철분|건강기능식품|홍삼|프로바이오틱스|건강보조|vitamin|supplement|omega|probiotic|collagen|magnesium|zinc|wellness|immunity/i,
  sports:    /헬스장|필라테스|요가|등산|러닝|마라톤|수영|골프|테니스|축구|야구|농구|피트니스|트레이닝|스포츠|운동복|스포츠웨어|fitness|gym|yoga|running|marathon|golf|tennis|football|basketball|training|workout|sportswear/i,
  education: /학원|강의|교육|인터넷강의|코딩|영어학원|수능|자격증|취업|강좌|과외|공부|학습|스터디|academy|education|course|learning|study|certificate|tutoring|lecture/i,
  travel:    /여행|호텔|리조트|펜션|항공|숙박|투어|여행패키지|관광|해외여행|국내여행|여행사|travel|hotel|resort|flight|tour|package|vacation|accommodation|tourism|airbnb/i,
  finance:   /신용카드|보험|대출|펀드|주식|ETF|적금|예금|청약|투자|금융상품|은행|증권|카드혜택|card|insurance|loan|fund|stock|savings|investment|finance|banking|credit/i,
};

export function detectIndustry(keywords) {
  const text = Array.isArray(keywords) ? keywords.join(' ') : (keywords || '');
  const lower = text.toLowerCase();
  for (const [industry, pattern] of Object.entries(PATTERNS)) {
    if (pattern.test(lower)) return industry;
  }
  return 'general';
}

// Suffix pools per locale × industry (14 entries each)
// 전문서비스(legal/medical/consulting)는 세일·정품·할인쿠폰 등 소비재 용어 제외
export const INDUSTRY_SUFFIXES = {
  ko: {
    // ── 전문서비스 ──
    legal:     ['상담', '비용', '승소율', '전화상담', '후기', '무료상담', '선임비용', '소송절차', '전문변호사', '기업자문', '법인소송', '판례', '법률검토', '계약서검토'],
    medical:   ['예약', '비용', '후기', '전문의', '진료시간', '치료방법', '수술비용', '위치', '전화번호', '검진', '전문분야', '치료사례', '의료진', '상담'],
    consulting:['상담', '비용', '전문가', '후기', '절차', '분야', '경력', '사례', '무료상담', '자문료', '계약조건', '추천', '비교', '기업자문'],

    // ── 소비재·서비스 ──
    beauty:    ['가격', '성분', '효과', '사용법', '후기', '추천', '비교', '리뷰', '세트', '정품', '할인', '공식', '부작용', '트렌드'],
    fashion:   ['스타일링', '코디', '후기', '가격', '사이즈', '핏', '세일', '신상', '컬러', '소재', '직구', '재입고', '추천', '비교'],
    food:      ['칼로리', '맛', '효능', '섭취방법', '후기', '추천', '성분', '영양성분', '가격', '쿠폰', '구매', '할인', '레시피', '혜택'],
    tech:      ['스펙', '가격', '비교', '후기', 'AS', '할인', '구매처', '호환성', '설정', '단점', '추천', '리뷰', '언박싱', '최저가'],
    health:    ['효능', '부작용', '복용법', '성분', '후기', '가격', '추천', '비교', '정품', '구매처', '할인', '섭취량', '인증', '혜택'],
    sports:    ['후기', '가격', '추천', '리뷰', '비교', '할인', '세일', '신상', '사이즈', '착용감', '루틴', '기능', '내구성', '소재'],
    education: ['커리큘럼', '후기', '가격', '취업률', '할인', '강사', '추천', '비교', '이벤트', '수강료', '특강', '온라인', '합격후기', '혜택'],
    travel:    ['가격', '후기', '위치', '예약', '할인', '패키지', '추천', '교통', '체크인', '서비스', '숙박비', '이벤트', '프로모션', '비교'],
    finance:   ['혜택', '이율', '조건', '비교', '추천', '한도', '신청', '이벤트', '캐시백', '포인트', '수수료', '혜택정리', '실적', '고객센터'],
    general:   ['추천', '후기', '가격', '비교', '공식', '인기', '신제품', '트렌드', '매장', '구매', '리뷰', '할인', '쿠폰', '이벤트'],
  },
  ja: {
    legal:     ['相談', '費用', '勝訴率', '無料相談', '口コミ', '専門弁護士', '企業顧問', '訴訟手続き', '選任費用', '判例', '法律検討', '契約書確認', '法人訴訟', '顧問料'],
    medical:   ['予約', '費用', '口コミ', '専門医', '診療時間', '治療方法', '手術費用', '場所', '電話番号', '検診', '専門分野', '治療実績', '医療スタッフ', '相談'],
    consulting:['相談', '費用', '専門家', '口コミ', '手続き', '分野', '実績', '無料相談', '顧問料', '契約条件', 'おすすめ', '比較', '企業顧問', 'コンサル料'],
    beauty:    ['口コミ', '成分', '効果', '使い方', 'おすすめ', '比較', 'レビュー', '価格', 'セット', '正規品', 'クーポン', '副作用', '人気', 'トレンド'],
    fashion:   ['コーデ', 'レビュー', '価格', 'サイズ', 'セール', '新作', 'カラー', '素材', '並行輸入', 'おすすめ', '比較', 'トレンド', 'ブランド', 'メンズ'],
    food:      ['カロリー', '味', '効能', '飲み方', '口コミ', 'おすすめ', '成分', '栄養', '価格', 'クーポン', '購入', '割引', 'レシピ', '効果'],
    tech:      ['スペック', '価格', '比較', '口コミ', '保証', '割引', '購入先', '互換性', '設定', 'デメリット', 'おすすめ', 'レビュー', '最安値', '開封'],
    health:    ['効能', '副作用', '飲み方', '成分', '口コミ', '価格', 'おすすめ', '比較', '正規品', '購入先', '割引', '認証', '摂取量', '効果'],
    sports:    ['価格', '口コミ', 'おすすめ', '比較', 'セール', '新作', 'サイズ', '効果', 'ルーティン', '機能', '耐久性', 'フィット感', 'レビュー', '人気'],
    general:   ['おすすめ', 'レビュー', '口コミ', '効果', '価格', '使い方', '成分', '比較', '購入', 'クーポン', '新商品', '人気', 'セール', 'トレンド'],
  },
  en: {
    legal:     ['consultation', 'fees', 'win rate', 'free consultation', 'reviews', 'attorney', 'corporate litigation', 'legal advice', 'contract review', 'settlement', 'case evaluation', 'specialist', 'procedure', 'advisory'],
    medical:   ['appointment', 'cost', 'reviews', 'specialist', 'hours', 'treatment', 'surgery cost', 'location', 'contact', 'checkup', 'specialty', 'case results', 'doctors', 'consultation'],
    consulting:['consultation', 'fees', 'expert', 'reviews', 'process', 'specialization', 'case study', 'free consultation', 'retainer', 'contract', 'recommendation', 'comparison', 'advisory', 'engagement'],
    beauty:    ['review', 'ingredients', 'before after', 'routine', 'dupe', 'discount', 'tutorial', 'best', 'coupon', 'vs', 'side effects', 'natural', 'how to use', 'haul'],
    fashion:   ['outfit', 'styling', 'review', 'sale', 'discount', 'size guide', 'new arrivals', 'haul', 'lookbook', 'best', 'vs', 'where to buy', 'authentic', 'unboxing'],
    food:      ['calories', 'taste', 'benefits', 'how to use', 'review', 'best', 'ingredients', 'nutrition', 'discount', 'coupon', 'where to buy', 'recipe', 'flavor', 'haul'],
    tech:      ['specs', 'price', 'vs', 'review', 'best', 'unboxing', 'discount', 'compatibility', 'settings', 'pros cons', 'tutorial', 'buy', 'cheapest', 'release date'],
    health:    ['benefits', 'side effects', 'dosage', 'ingredients', 'review', 'best', 'vs', 'where to buy', 'discount', 'natural', 'certified', 'results', 'routine', 'comparison'],
    sports:    ['review', 'price', 'vs', 'best', 'discount', 'sizing', 'workout', 'routine', 'benefits', 'beginner', 'pro', 'comparison', 'performance', 'unboxing'],
    education: ['review', 'curriculum', 'price', 'discount', 'instructor', 'vs', 'online', 'best', 'certification', 'free trial', 'enrollment', 'schedule', 'refund', 'comparison'],
    travel:    ['review', 'price', 'booking', 'discount', 'package', 'best', 'tips', 'deals', 'amenities', 'comparison', 'promo', 'location', 'transportation', 'itinerary'],
    finance:   ['benefits', 'requirements', 'comparison', 'best', 'apply', 'fees', 'rewards', 'cashback', 'limit', 'eligibility', 'promo', 'vs', 'annual fee', 'interest rate'],
    general:   ['review', 'dupe', 'before after', 'routine', 'discount', 'features', 'tutorial', 'vs', 'coupon', 'haul', 'best', 'unboxing', 'where to buy', 'official'],
  },
};

// Campaign keyword suffix templates [suffix, matchType] per industry
// 전문서비스는 구매·할인 CTA 대신 상담·문의 CTA 사용
export const CAMPAIGN_SUFFIXES = {
  ko: {
    legal:     [['무료상담', '정확검색'], ['승소율 비교', '구문검색'], ['법인소송 전문', '광범위수정'], ['vs 로펌 비교', '구문검색'], ['선임 비용', '광범위수정'], ['상담신청', '정확검색'], ['전화상담', '구문검색'], ['기업자문', '광범위수정']],
    medical:   [['진료예약', '정확검색'], ['전문의 상담', '구문검색'], ['수술비용 안내', '광범위수정'], ['vs 병원 비교', '구문검색'], ['치료사례', '광범위수정'], ['예약하기', '정확검색'], ['진료시간 안내', '구문검색'], ['검진 프로그램', '광범위수정']],
    consulting:[['무료상담', '정확검색'], ['전문가 자문', '구문검색'], ['컨설팅 사례', '광범위수정'], ['vs 비교', '구문검색'], ['자문료 안내', '광범위수정'], ['상담신청', '정확검색'], ['전화상담', '구문검색'], ['기업 컨설팅', '광범위수정']],

    beauty:    [['공식', '정확검색'], ['성분 비교', '구문검색'], ['효과 후기', '광범위수정'], ['vs 경쟁사', '구문검색'], ['추천 세트', '광범위수정'], ['구매하기', '정확검색'], ['가격 할인', '구문검색'], ['신제품', '광범위수정']],
    fashion:   [['공식몰', '정확검색'], ['코디 추천', '구문검색'], ['세일 할인', '광범위수정'], ['vs 경쟁사', '구문검색'], ['신상 컬렉션', '광범위수정'], ['구매하기', '정확검색'], ['사이즈 가이드', '구문검색'], ['직구 방법', '광범위수정']],
    food:      [['공식', '정확검색'], ['효능 후기', '구문검색'], ['할인 쿠폰', '광범위수정'], ['vs 비교', '구문검색'], ['칼로리 성분', '광범위수정'], ['구매하기', '정확검색'], ['섭취방법', '구문검색'], ['신제품', '광범위수정']],
    tech:      [['공식', '정확검색'], ['스펙 비교', '구문검색'], ['최저가 할인', '광범위수정'], ['vs 경쟁사', '구문검색'], ['AS 방법', '광범위수정'], ['구매하기', '정확검색'], ['설정 가이드', '구문검색'], ['신제품', '광범위수정']],
    health:    [['공식', '정확검색'], ['효능 부작용', '구문검색'], ['할인 쿠폰', '광범위수정'], ['vs 비교', '구문검색'], ['복용법', '광범위수정'], ['구매하기', '정확검색'], ['성분 인증', '구문검색'], ['신제품', '광범위수정']],
    sports:    [['공식', '정확검색'], ['사이즈 착용감', '구문검색'], ['세일 할인', '광범위수정'], ['vs 경쟁사', '구문검색'], ['루틴 추천', '광범위수정'], ['구매하기', '정확검색'], ['착용감 후기', '구문검색'], ['신상품', '광범위수정']],
    education: [['공식', '정확검색'], ['수강후기', '구문검색'], ['할인 이벤트', '광범위수정'], ['vs 비교', '구문검색'], ['커리큘럼', '광범위수정'], ['수강신청', '정확검색'], ['강사 소개', '구문검색'], ['특강', '광범위수정']],
    travel:    [['공식', '정확검색'], ['후기 리뷰', '구문검색'], ['할인 프로모션', '광범위수정'], ['vs 비교', '구문검색'], ['패키지 상품', '광범위수정'], ['예약하기', '정확검색'], ['위치 교통', '구문검색'], ['신규 패키지', '광범위수정']],
    finance:   [['공식', '정확검색'], ['혜택 비교', '구문검색'], ['이벤트 캐시백', '광범위수정'], ['vs 경쟁사', '구문검색'], ['신청 조건', '광범위수정'], ['신청하기', '정확검색'], ['한도 이율', '구문검색'], ['신규 상품', '광범위수정']],
    general:   [['공식', '정확검색'], ['후기', '구문검색'], ['할인코드', '광범위수정'], ['vs 경쟁사', '구문검색'], ['이벤트', '광범위수정'], ['구매하기', '정확검색'], ['매장', '구문검색'], ['신제품', '광범위수정']],
  },
  en: {
    legal:     [['free consultation', '정확검색'], ['win rate review', '구문검색'], ['corporate litigation', '광범위수정'], ['vs law firm', '구문검색'], ['attorney fees', '광범위수정'], ['contact us', '정확검색'], ['phone consultation', '구문검색'], ['business advisory', '광범위수정']],
    medical:   [['book appointment', '정확검색'], ['specialist consultation', '구문검색'], ['surgery cost guide', '광범위수정'], ['vs clinic comparison', '구문검색'], ['treatment cases', '광범위수정'], ['schedule now', '정확검색'], ['clinic hours', '구문검색'], ['checkup program', '광범위수정']],
    consulting:[['free consultation', '정확검색'], ['expert advisory', '구문검색'], ['case study', '광범위수정'], ['vs competitor', '구문검색'], ['retainer fee', '광범위수정'], ['contact us', '정확검색'], ['phone consultation', '구문검색'], ['business consulting', '광범위수정']],
    beauty:    [['official', '정확검색'], ['ingredients review', '구문검색'], ['before after', '광범위수정'], ['vs competitor', '구문검색'], ['routine tutorial', '광범위수정'], ['buy online', '정확검색'], ['discount code', '구문검색'], ['new launch', '광범위수정']],
    fashion:   [['official', '정확검색'], ['outfit styling', '구문검색'], ['sale discount', '광범위수정'], ['vs competitor', '구문검색'], ['new arrivals', '광범위수정'], ['buy online', '정확검색'], ['size guide', '구문검색'], ['lookbook', '광범위수정']],
    food:      [['official', '정확검색'], ['taste review', '구문검색'], ['discount coupon', '광범위수정'], ['vs competitor', '구문검색'], ['nutrition facts', '광범위수정'], ['buy online', '정확검색'], ['recipe ideas', '구문검색'], ['new flavor', '광범위수정']],
    tech:      [['official', '정확검색'], ['specs review', '구문검색'], ['cheapest price', '광범위수정'], ['vs competitor', '구문검색'], ['setup guide', '광범위수정'], ['buy online', '정확검색'], ['compatibility guide', '구문검색'], ['new model', '광범위수정']],
    health:    [['official', '정확검색'], ['benefits side effects', '구문검색'], ['discount coupon', '광범위수정'], ['vs competitor', '구문검색'], ['dosage guide', '광범위수정'], ['buy online', '정확검색'], ['ingredients certified', '구문검색'], ['new formula', '광범위수정']],
    sports:    [['official', '정확검색'], ['sizing review', '구문검색'], ['sale discount', '광범위수정'], ['vs competitor', '구문검색'], ['workout routine', '광범위수정'], ['buy online', '정확검색'], ['performance guide', '구문검색'], ['new release', '광범위수정']],
    education: [['official', '정확검색'], ['student review', '구문검색'], ['discount promo', '광범위수정'], ['vs competitor', '구문검색'], ['curriculum guide', '광범위수정'], ['enroll now', '정확검색'], ['instructor profile', '구문검색'], ['free trial', '광범위수정']],
    travel:    [['official', '정확검색'], ['guest review', '구문검색'], ['discount promo', '광범위수정'], ['vs competitor', '구문검색'], ['package deal', '광범위수정'], ['book now', '정확검색'], ['location guide', '구문검색'], ['new package', '광범위수정']],
    finance:   [['official', '정확검색'], ['benefits comparison', '구문검색'], ['promo cashback', '광범위수정'], ['vs competitor', '구문검색'], ['eligibility guide', '광범위수정'], ['apply now', '정확검색'], ['limit rate', '구문검색'], ['new product', '광범위수정']],
    general:   [['official', '정확검색'], ['review', '구문검색'], ['discount code', '광범위수정'], ['vs competitor', '구문검색'], ['features', '광범위수정'], ['buy online', '정확검색'], ['where to buy', '구문검색'], ['new arrivals', '광범위수정']],
  },
};

function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

// Returns count suffixes selected from the industry-matched pool using stable hash shuffle
export function getIndustrySuffixes(keywords, locale = 'ko', count = 8) {
  const text = Array.isArray(keywords) ? keywords.join(' ') : (keywords || '');
  const industry = detectIndustry(text);
  const locKey = ['ko', 'ja', 'en'].includes(locale) ? locale : 'en';
  const locPools = INDUSTRY_SUFFIXES[locKey] || INDUSTRY_SUFFIXES.en;
  const pool = locPools[industry] || locPools.general;

  const shuffled = pool
    .map((sfx, idx) => ({ sfx, sort: hashStr(text + sfx + idx) }))
    .sort((a, b) => a.sort - b.sort)
    .map(x => x.sfx);

  return shuffled.slice(0, count);
}

// Returns campaign [suffix, matchType] pairs for the detected industry
export function getCampaignSuffixes(keywords, isGlobal = false) {
  const text = Array.isArray(keywords) ? keywords.join(' ') : (keywords || '');
  const industry = detectIndustry(text);
  const locKey = isGlobal ? 'en' : 'ko';
  return CAMPAIGN_SUFFIXES[locKey][industry] || CAMPAIGN_SUFFIXES[locKey].general;
}
