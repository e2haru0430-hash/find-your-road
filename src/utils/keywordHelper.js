
/**
 * 브랜드명을 기반으로 연관/확장 키워드를 생성합니다.
 */
export const expandKeywords = (brandName) => {
  if (!brandName) return '';
  const suffixes = ['추천', '후기', '가격', '효과', '부작용', '사용법', '정품', '세일'];
  return `${brandName}, ${suffixes.map(s => `${brandName} ${s}`).join(', ')}`;
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
 * 브랜드별 가상 리뷰 데이터를 생성합니다.
 */
export const generateDynamicReviews = (brandName, lang = 'ko') => {
  const reviews = {
    ko: {
      positive: [
        { content: `${brandName} 정말 만족스러워요! 배송도 빠르고 효과도 좋네요.`, author: '김**' },
        { content: `역시 믿고 쓰는 ${brandName}, 벌써 세 번째 재구매입니다.`, author: '이**' },
        { content: `${brandName} 덕분에 고민하던 부분이 많이 해결됐어요. 강추합니다.`, author: '최**' }
      ],
      negative: [
        { content: `${brandName} 배송이 조금 늦어서 아쉬웠어요. 제품은 괜찮습니다.`, author: '박**' },
        { content: `가격이 조금 비싼 게 흠이네요. ${brandName} 할인 좀 자주 해주세요.`, author: '정**' }
      ]
    },
    en: {
      positive: [
        { content: `Absolutely love ${brandName}! Great quality and fast results.`, author: 'John D.' },
        { content: `${brandName} exceeded my expectations. Highly recommended.`, author: 'Sarah W.' }
      ],
      negative: [
        { content: `Shipping for ${brandName} took longer than expected.`, author: 'Robert T.' }
      ]
    },
    ja: {
      positive: [
        { content: `${brandName}は本当に素晴らしいです！使い心地がとても良い。`, author: '佐藤' },
        { content: `やはり${brandName}ですね。リピート確定です！`, author: '田中' }
      ],
      negative: [
        { content: `${brandName}の配送が少し遅かったです。`, author: '伊藤' }
      ]
    }
  };

  const selected = reviews[lang] || reviews['ko'];
  
  return {
    positive: selected.positive.map((r, i) => ({
      id: `p-${i}`,
      ...r,
      rating: 5,
      date: getRandomDateInLastDays(3)
    })),
    negative: selected.negative.map((r, i) => ({
      id: `n-${i}`,
      ...r,
      rating: 2,
      date: getRandomDateInLastDays(3)
    }))
  };
};
