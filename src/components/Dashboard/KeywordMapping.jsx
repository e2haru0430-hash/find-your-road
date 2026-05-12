import { useState } from 'react';
import { BRAND_COLORS } from '../../utils/constants';
import { expandKeywords } from '../../utils/keywordHelper';

export default function KeywordMapping({ mappings, onMappingsChange, maxRows = 5, labelField = '브랜드명', labelPlaceholder = '브랜드명' }) {
  const [rows, setRows] = useState(mappings || [
    { id: 1, name: '', keywords: '', color: BRAND_COLORS[0] }
  ]);

  const addRow = () => {
    if (rows.length >= maxRows) return;
    const newRow = { id: Date.now(), name: '', keywords: '', color: BRAND_COLORS[rows.length % BRAND_COLORS.length] };
    const updated = [...rows, newRow];
    setRows(updated);
    onMappingsChange?.(updated);
  };

  const removeRow = (id) => {
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    onMappingsChange?.(updated);
  };

  const updateRow = (id, field, value) => {
    const updated = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(updated);
    onMappingsChange?.(updated);
  };

  const handleAutoExpand = (id, name) => {
    if (!name) return;
    const expanded = expandKeywords(name);
    updateRow(id, 'keywords', expanded);
  };

  return (
    <div className="mapping-card fade-in">
      <div className="mapping-header">
        <div className="info-icon">ℹ</div>
        <h3>카테고리별 검색어 매핑 편집</h3>
      </div>
      <p className="mapping-desc">
        {labelField}과 검색 키워드를 직접 설정할 수 있습니다. 주제어에 해당하는 모든 검색어를 우측 칸에 입력하세요.
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
            placeholder="주제어에 해당하는 모든 검색어를 콤마(,)로 구분하여 최대 20개 까지 입력"
            value={row.keywords}
            onChange={e => updateRow(row.id, 'keywords', e.target.value)}
          />
          <button className="btn-delete" onClick={() => removeRow(row.id)}>🗑</button>
        </div>
      ))}

      <button className="btn-add-row" onClick={addRow}>
        + {labelField} 추가 ({rows.length}/{maxRows})
      </button>

      <div className="mapping-actions">
        <button className="btn-cancel">취소</button>
        <button className="btn-save" onClick={() => onMappingsChange?.(rows)}>✓ 저장하기</button>
      </div>
    </div>
  );
}
