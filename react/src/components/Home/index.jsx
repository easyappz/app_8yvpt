import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getCategories, getConditions } from '../../api/meta';
import * as listings from '../../api/listings';

// Helper: build query params object from filters (skip empty values)
function buildParams(filters) {
  const params = {};
  Object.keys(filters).forEach((k) => {
    const v = filters[k];
    if (v !== undefined && v !== null && v !== '') {
      params[k] = v;
    }
  });
  return params;
}

// Helper: parse query params out of absolute/relative URL
function parseQueryParamsFromUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    const params = {};
    u.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch (e) {
    return {};
  }
}

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);

  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    min_price: '',
    max_price: '',
    q: '',
    ordering: '-created_at',
    date_from: '',
    date_to: '',
  });

  const [data, setData] = useState({ count: 0, next: null, previous: null, results: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debounceRef = useRef(null);

  const categoryLabelMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      m[c.key] = c.label;
    });
    return m;
  }, [categories]);

  const conditionLabelMap = useMemo(() => {
    const m = {};
    conditions.forEach((c) => {
      m[c.key] = c.label;
    });
    return m;
  }, [conditions]);

  async function loadMeta() {
    try {
      const [cats, conds] = await Promise.all([getCategories(), getConditions()]);
      setCategories(cats);
      setConditions(conds);
    } catch (e) {
      // Meta failure should not block page, but show a message
      console.error('Meta load error', e);
    }
  }

  async function loadListings(extraParams = {}) {
    setLoading(true);
    setError('');
    try {
      const params = { ...buildParams(filters), ...extraParams };
      const response = await listings.list(params);
      setData({
        count: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
        results: Array.isArray(response.results) ? response.results : [],
      });
    } catch (e) {
      const detail = e?.response?.data?.detail || 'Ошибка загрузки объявлений';
      setError(String(detail));
      setData({ count: 0, next: null, previous: null, results: [] });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Debounced auto-search on change
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      loadListings();
    }, 400);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    loadListings();
  }

  function goToPage(url) {
    if (!url) return;
    const pageParams = parseQueryParamsFromUrl(url);
    loadListings(pageParams);
  }

  function resetFilters() {
    setFilters({
      category: '',
      condition: '',
      min_price: '',
      max_price: '',
      q: '',
      ordering: '-created_at',
      date_from: '',
      date_to: '',
    });
    loadListings({});
  }

  useEffect(() => {
    // Inform routes for debugging purposes
    try {
      if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
        window.handleRoutes(['/','/login','/register','/profile','/ads/new','/about']);
      }
    } catch (e) {
      // no-op
    }
    loadMeta();
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Styles (vibrant, dynamic)
  const styles = {
    page: {
      minHeight: '100%',
      background: 'transparent',
      padding: '24px 16px',
    },
    container: {
      maxWidth: 1100,
      margin: '0 auto',
    },
    panel: {
      background: 'rgba(255,255,255,0.9)',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(6px)',
    },
    title: {
      color: '#0f172a',
      fontSize: 28,
      fontWeight: 800,
      margin: '4px 0 16px',
      letterSpacing: 0.3,
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 12,
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: 14,
      outline: 'none',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: 14,
      outline: 'none',
    },
    buttonPrimary: {
      display: 'inline-block',
      padding: '10px 16px',
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
      color: '#0b1021',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 6px 18px rgba(2,132,199,0.35)',
      transition: 'transform 0.06s ease',
    },
    buttonGhost: {
      display: 'inline-block',
      padding: '10px 16px',
      borderRadius: 12,
      border: '1px solid #cbd5e1',
      background: 'rgba(255,255,255,0.65)',
      color: '#0f172a',
      fontWeight: 700,
      cursor: 'pointer',
    },
    actions: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    resultsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 18,
      marginBottom: 10,
      color: '#0f172a',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
    },
    card: {
      background: '#ffffff',
      borderRadius: 14,
      padding: 14,
      boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      border: '1px solid #f1f5f9',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: 'linear-gradient(90deg, #f59e0b, #f97316)',
      color: '#0b1021',
    },
    price: {
      fontSize: 18,
      fontWeight: 800,
      color: '#0f172a',
    },
    link: {
      textDecoration: 'none',
      color: '#0ea5e9',
      fontWeight: 700,
    },
    empty: {
      padding: 20,
      textAlign: 'center',
      color: '#334155',
      background: 'rgba(255,255,255,0.7)',
      borderRadius: 12,
    },
    error: {
      padding: 12,
      background: '#fee2e2',
      color: '#7f1d1d',
      border: '1px solid #fecaca',
      borderRadius: 10,
      marginTop: 10,
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 18,
    },
  };

  return (
    <div style={styles.page} data-easytag="id1-react/src/components/Home/index.jsx">
      <div style={styles.container}>
        <div style={styles.panel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#0ea5e9', padding: '4px 10px', borderRadius: 999 }}>Доска объявлений</span>
          </div>
          <h1 style={styles.title}>Найдите лучшее предложение</h1>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }} data-easytag="id2-react/src/components/Home/index.jsx">
            <div style={styles.filtersGrid}>
              <div>
                <label htmlFor="category" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Категория</label>
                <select id="category" name="category" value={filters.category} onChange={handleChange} style={styles.select}>
                  <option value="">Все категории</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Состояние</label>
                <select id="condition" name="condition" value={filters.condition} onChange={handleChange} style={styles.select}>
                  <option value="">Любое</option>
                  {conditions.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="min_price" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Цена от</label>
                <input id="min_price" name="min_price" type="number" min="0" value={filters.min_price} onChange={handleChange} placeholder="Мин." style={styles.input} />
              </div>

              <div>
                <label htmlFor="max_price" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Цена до</label>
                <input id="max_price" name="max_price" type="number" min="0" value={filters.max_price} onChange={handleChange} placeholder="Макс." style={styles.input} />
              </div>

              <div>
                <label htmlFor="date_from" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Дата с</label>
                <input id="date_from" name="date_from" type="date" value={filters.date_from} onChange={handleChange} style={styles.input} />
              </div>

              <div>
                <label htmlFor="date_to" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Дата по</label>
                <input id="date_to" name="date_to" type="date" value={filters.date_to} onChange={handleChange} style={styles.input} />
              </div>

              <div style={{ gridColumn: 'span 3' }}>
                <label htmlFor="q" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Ключевые слова</label>
                <input id="q" name="q" type="text" value={filters.q} onChange={handleChange} placeholder="Название, описание..." style={styles.input} />
              </div>

              <div style={{ gridColumn: 'span 3' }}>
                <label htmlFor="ordering" style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Сортировка</label>
                <select id="ordering" name="ordering" value={filters.ordering} onChange={handleChange} style={styles.select}>
                  <option value="-created_at">Новые сначала</option>
                  <option value="created_at">Старые сначала</option>
                </select>
              </div>
            </div>

            <div style={styles.actions}>
              <button type="button" onClick={resetFilters} style={styles.buttonGhost}>Сбросить</button>
              <button type="submit" style={styles.buttonPrimary} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>Применить</button>
            </div>
          </form>

          {error ? (
            <div style={styles.error}>{error}</div>
          ) : null}

          <div style={styles.resultsHeader}>
            <div style={{ fontWeight: 700 }}>Найдено: {data.count}</div>
            {loading && <div style={{ fontSize: 12, color: '#475569' }}>Загрузка...</div>}
          </div>

          <div style={styles.panel} data-easytag="id3-react/src/components/Home/index.jsx">
            {data.results && data.results.length > 0 ? (
              <div style={styles.grid}>
                {data.results.map((item) => {
                  const createdAt = item.created_at ? new Date(item.created_at) : null;
                  const categoryLabel = categoryLabelMap[item.category] || item.category || '-';
                  const conditionLabel = conditionLabelMap[item.condition] || item.condition || '-';
                  return (
                    <div key={item.id} style={styles.card} data-easytag="id4-react/src/components/Home/index.jsx">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.badge}>{categoryLabel}</span>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{conditionLabel}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                      <div style={styles.price}>{Number(item.price).toLocaleString('ru-RU')} ₽</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>
                        Добавлено: {createdAt ? createdAt.toLocaleString('ru-RU') : '-'}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <a href={`/ads/${item.id}`} style={styles.link}>Открыть объявление →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={styles.empty}>Объявлений не найдено. Измените фильтры и попробуйте снова.</div>
            )}
          </div>

          <div style={styles.pagination} data-easytag="id5-react/src/components/Home/index.jsx">
            <button
              type="button"
              disabled={!data.previous}
              onClick={() => goToPage(data.previous)}
              style={{
                ...styles.buttonGhost,
                opacity: data.previous ? 1 : 0.5,
                cursor: data.previous ? 'pointer' : 'not-allowed',
              }}
            >
              ← Назад
            </button>
            <button
              type="button"
              disabled={!data.next}
              onClick={() => goToPage(data.next)}
              style={{
                ...styles.buttonPrimary,
                opacity: data.next ? 1 : 0.5,
                cursor: data.next ? 'pointer' : 'not-allowed',
              }}
            >
              Вперед →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
