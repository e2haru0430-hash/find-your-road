import { useState, useEffect } from 'react';
import { BRAND_COLORS } from '../../utils/constants';
import { expandKeywords } from '../../utils/keywordHelper';

export default function KeywordMapping({ mappings, onMappingsChange, maxRows = 5, labelField = '브랜드명', labelPlaceholder = '브랜드명' }) {
  const [isEditMode, setIsEditMode] = useState(mappings.length === 0);
  const [rows, setRows] = useState(mappings.length > 0 ? mappings : [
    { id: 1, name: '', keywords: '', color: BRAND_COLORS[0] }
  ]);

  // 외부 mappings가 변경되면 내부 rows 동기화 (초기 로드 시 중요)
  useEffect(() => {
    if (mappings.length > 0) {
      setRows(mappings);
      setIsEditMode(false);
    }
  }, [mappings]);

  const addRow = () => {
    if (rows.length >= maxRows) return;
    const newRow = { id: Date.now(), name: '', keywords: '', color: BRAND_COLORS[rows.length % BRAND_COLORS.length] };
    setRows([...rows, newRow]);
  };

  const removeRow = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleAutoExpand = (id, name) => {
    if (!name) return;
    const expanded = expandKeywords(name);
    updateRow(id, 'keywords', expanded);
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.name.trim() !== '');
    if (validRows.length === 0) {
      alert('최소 하나 이상의 브랜드명을 입력해주세요.');
      return;
    }
    onMappingsChange?.(validRows);
    setIsEditMode(false);
  };

  if (!isEditMode && mappings.length > 0) {
    return (
      <div className="mapping-card fade-in" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy)', marginRight: '10px' }}>
            📍 현재 분석 브랜드:
          </div>
          {mappings.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }} />
              <span style={{ fontWeight: 700 }}>{m.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({m.keywords.split(',').length})</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsEditMode(true)}
          style={{ 
            padding: '8px 16px', 
            background: 'white', 
            border: '1px solid var(--color-primary)', 
            color: 'var(--color-primary)', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⚙️ 매핑 설정 편집
        </button>
      </div>
    );
  }

  return (
    <div className="mapping-card fade-in">
      <div className="mapping-header">
        <div className="info-icon">ℹ</div>
        <h3>카테고리별 검색어 매핑 설정</h3>
      </div>
      <p className="mapping-desc">
        분석할 브랜드와 관련 키워드를 입력하세요. 저장 시 모든 탭의 데이터가 해당 설정을 기준으로 고정됩니다.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', paddingLeft: '24px' }}>
        <span style={{ width: '140px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{labelField}</span>
        <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>검색 키워드 (쉼표 구분)</span>
      </div>

      {rows.map(row => (
        <div key={row.id} className="mapping-row" style={{ position: 'relative' }}>
          <div className="color-dot" style={{ background: row.color }} />
          <div style={{ position: 'relative', width: '140px' }}>
            <input
              className="mapping-input name"
              placeholder={labelPlaceholder}
              value={row.name}
              onChange={e => updateRow(row.id, 'name', e.target.value)}
              style={{ width: '100%' }}
            />
            {row.name && (
              <button 
                onClick={() => handleAutoExpand(row.id, row.name)}
                title="키워드 자동 확장"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '2px'
                }}
              >
                🪄
              </button>
            )}
          </div>
          <input
            className="mapping-input keywords"
            placeholder="주제어에 해당하는 모든 검색어를 콤마(,)로 구분하여 입력"
            value={row.keywords}
            onChange={e => updateRow(row.id, 'keywords', e.target.value)}
          />
          <button className="btn-delete" onClick={() => removeRow(row.id)}>🗑</button>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <button className="btn-add-row" onClick={addRow} style={{ marginTop: 0 }}>
          + {labelField} 추가 ({rows.length}/{maxRows})
        </button>
        <div className="mapping-actions" style={{ marginTop: 0 }}>
          {mappings.length > 0 && <button className="btn-cancel" onClick={() => setIsEditMode(false)}>취소</button>}
          <button className="btn-save" onClick={handleSave}>✓ 설정 저장 및 적용</button>
        </div>
      </div>
    </div>
  );
}
