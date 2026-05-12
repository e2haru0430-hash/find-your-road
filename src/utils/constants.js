export const COLORS = [
  '#FF7A00','#3b82f6','#10b981','#8b5cf6','#ec4899',
  '#f59e0b','#06b6d4','#ef4444','#84cc16','#6366f1'
];

export const BRAND_COLORS = [
  '#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6'
];

export const PLATFORMS = {
  naver: { name: '네이버 데이터랩', badge: 'naver', icon: '🟢', color: '#2e7d32' },
  google: { name: '구글 트렌드', badge: 'google', icon: '🔵', color: '#1565c0' },
  youtube: { name: '유튜브', badge: 'youtube', icon: '🔴', color: '#c62828' },
  tiktok: { name: '틱톡', badge: 'tiktok', icon: '🎵', color: '#7b1fa2' },
  instagram: { name: '인스타그램', badge: 'instagram', icon: '📷', color: '#ad1457' },
};

export const NAVER_FILTERS = {
  gender: ['전체','남성','여성'],
  ages: ['전체','10~14','15~19','20~24','25~29','30~34','35~39','40~44','45~49','50~54','55~59','60+'],
  device: ['통합','PC','모바일'],
};

export const GOOGLE_FILTERS = {
  searchType: ['웹 검색','이미지 검색','뉴스 검색','쇼핑','YouTube 검색'],
  region: ['전세계','한국','미국','일본','영국','독일','프랑스','중국'],
};

export const YOUTUBE_FILTERS = {
  type: ['검색어 자동완성','영상 조회수 트렌드','채널별 콘텐츠 빈도'],
  sortBy: ['관련도순','최신순','조회수순'],
};

export const TIKTOK_FILTERS = {
  type: ['해시태그 조회수','검색 자동완성','인기 사운드 연관'],
  period: ['최근 7일','최근 30일','최근 90일'],
};

export const UNIT_OPTIONS = ['일간','주간','월간','지정'];

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}
