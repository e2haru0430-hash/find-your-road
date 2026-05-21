import { useState, useRef, useEffect, useCallback } from 'react';

/* ── 페이지별 컨텍스트 & 추천 질문 ──────────────────────────────────────────── */
const PAGE_META = {
  'brand-query': {
    name: 'Brand Query Trend',
    icon: '📊',
    desc: '네이버/구글 검색 트렌드 및 키워드 검색량 분석 대시보드',
    suggested: [
      '현재 브랜드의 검색 트렌드 핵심 인사이트는?',
      '검색량이 높은 키워드 활용 전략은?',
      '일간/주간/월간 변동 패턴의 의미는?',
      '경쟁 키워드 대비 우리 브랜드 포지션은?',
    ],
  },
  instagram: {
    name: 'Instagram Dashboard',
    icon: '📸',
    desc: '인스타그램 해시태그 트렌드, 검색 자동완성, 콘텐츠 반응 분석',
    suggested: [
      '현재 인스타그램 검색 추천어 활용 방법은?',
      '해시태그 성장세에 맞는 콘텐츠 전략은?',
      '브랜드 콘텐츠 반응률을 높이려면?',
      '지금 가장 트렌딩한 콘텐츠 포맷은?',
    ],
  },
  geo: {
    name: 'Global GEO Optimizer',
    icon: '🌐',
    desc: 'GEO(Generative Engine Optimization) 전략 — AI 검색 인용 최적화, 경쟁사 가시성 히트맵, AI 소스 구조 분석',
    suggested: [
      'AI 검색 인용을 높이는 핵심 전략은?',
      '경쟁사 대비 취약한 피처 개선 방법은?',
      'GEO 콘텐츠 최적화 우선순위는?',
      'AI 소스 구조에서 공식 웹사이트 비중을 늘리려면?',
    ],
  },
  shopping: {
    name: 'Shopping Mall Insight',
    icon: '🛍️',
    desc: '국내외 주요 쇼핑몰 브랜드 검색 트렌드와 판매 성과 분석',
    suggested: [
      '쇼핑몰별 브랜드 노출 개선 전략은?',
      '판매 성과가 높은 플랫폼 특징은?',
      '시즌별 검색 트렌드 활용 방법은?',
      '경쟁 브랜드 대비 상품 포지셔닝은?',
    ],
  },
};

const DEFAULT_META = {
  name: '대시보드',
  icon: '📋',
  desc: '브랜드 분석 대시보드',
  suggested: [
    '현재 데이터의 주요 인사이트는?',
    '개선이 필요한 영역은?',
    '브랜드 경쟁력 강화 방법은?',
  ],
};

/* ── 컨텍스트 빌더 ──────────────────────────────────────────────────────────── */
function buildContext(activePage, mappings) {
  const meta = PAGE_META[activePage] || DEFAULT_META;
  const brands = mappings?.map(m => m.name).filter(Boolean).join(', ') || '(미설정)';
  const keywords = mappings
    ?.flatMap(m => (m.keywords || '').split(',').map(k => k.trim()).filter(Boolean))
    .slice(0, 10)
    .join(', ') || '';

  return `대시보드: ${meta.name}
분석 설명: ${meta.desc}
분석 브랜드: ${brands}${keywords ? `\n주요 키워드: ${keywords}` : ''}
접속 시각: ${new Date().toLocaleString('ko-KR')}`;
}

/* ══════════════════════════════════════════════════════════════════════════ */

export default function DashboardChat({ activePage = 'brand-query', mappings = [] }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [prevPage, setPrevPage]   = useState(activePage);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const meta = PAGE_META[activePage] || DEFAULT_META;

  // 페이지 변경 시 대화 초기화
  useEffect(() => {
    if (activePage !== prevPage) {
      setMessages([]);
      setPrevPage(activePage);
    }
  }, [activePage, prevPage]);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 패널 열릴 때 input 포커스
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    const context = buildContext(activePage, mappings);
    const history = messages.slice(-6);

    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `오류가 발생했습니다: ${err.message}`,
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activePage, mappings]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 숨길 페이지 (guide)
  const hiddenPages = ['guide'];
  if (hiddenPages.includes(activePage)) return null;

  /* ── 렌더 ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── 채팅 패널 ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '360px', height: '500px',
          background: 'white', borderRadius: '18px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          zIndex: 2000, border: '1px solid #e2e8f0', overflow: 'hidden',
        }}>

          {/* 헤더 */}
          <div style={{
            background: 'var(--color-primary)',
            padding: '14px 16px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              }}>✨</div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>
                  AI 분석 어시스턴트
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', marginTop: '1px' }}>
                  {meta.icon} {meta.name} · Gemini 2.5 Flash
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="대화 초기화"
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: 'white', borderRadius: '6px', padding: '4px 8px',
                    fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  초기화
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  color: 'white', borderRadius: '6px', width: '28px', height: '28px',
                  cursor: 'pointer', fontSize: '0.9rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 12px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {messages.length === 0 && (
              <div>
                <div style={{
                  textAlign: 'center', color: '#94a3b8',
                  fontSize: '0.78rem', marginBottom: '16px', padding: '8px 0',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✨</div>
                  <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    {meta.name}에 대해 질문해보세요
                  </div>
                  <div>현재 대시보드 데이터를 기반으로 답변합니다</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {meta.suggested.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      style={{
                        padding: '9px 12px', background: '#f8fafc',
                        border: '1px solid #e2e8f0', borderRadius: '10px',
                        fontSize: '0.78rem', color: '#475569',
                        textAlign: 'left', cursor: 'pointer', fontWeight: 500,
                        lineHeight: 1.4, transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.background = '#f0f4ff'}
                      onMouseLeave={e => e.target.style.background = '#f8fafc'}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', marginRight: '6px', flexShrink: 0, marginTop: '2px',
                  }}>✨</div>
                )}
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 13px',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '4px 14px 14px 14px',
                  background: msg.role === 'user'
                    ? 'var(--color-primary)'
                    : msg.isError ? '#fef2f2' : '#f8fafc',
                  color: msg.role === 'user'
                    ? 'white'
                    : msg.isError ? '#dc2626' : '#1e293b',
                  fontSize: '0.82rem',
                  lineHeight: '1.65',
                  border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', flexShrink: 0,
                }}>✨</div>
                <div style={{
                  padding: '10px 14px', borderRadius: '4px 14px 14px 14px',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  fontSize: '0.82rem', color: '#94a3b8',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ display: 'inline-flex', gap: '3px' }}>
                    {[0, 1, 2].map(n => (
                      <span key={n} style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: '#a5b4fc',
                        animation: `bounce 1.2s ${n * 0.2}s infinite`,
                      }} />
                    ))}
                  </span>
                  분석 중
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 입력 영역 */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #e2e8f0',
            display: 'flex', gap: '8px', flexShrink: 0, background: 'white',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문 입력 (Enter 전송 / Shift+Enter 줄바꿈)"
              rows={1}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', fontSize: '0.82rem',
                resize: 'none', outline: 'none', fontFamily: 'inherit',
                lineHeight: '1.5', maxHeight: '88px', overflowY: 'auto',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: !input.trim() || loading
                  ? '#e2e8f0'
                  : 'var(--color-primary)',
                color: !input.trim() || loading ? '#94a3b8' : 'white',
                border: 'none',
                cursor: !input.trim() || loading ? 'default' : 'pointer',
                fontSize: '1.1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* ── 플로팅 버튼 ── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="AI 분석 어시스턴트"
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '54px', height: '54px', borderRadius: '50%',
          background: isOpen
            ? '#1e293b'
            : 'var(--color-primary)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: isOpen
            ? '0 4px 16px rgba(0,0,0,0.25)'
            : '0 4px 24px rgba(8, 107, 255, 0.3)',
          fontSize: isOpen ? '1.1rem' : '1.4rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2001, transition: 'all 0.2s ease',
        }}
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* 바운스 애니메이션 */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
