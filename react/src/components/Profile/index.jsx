import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { me as getMe, updateProfile } from '../../api/profile';
import * as listings from '../../api/listings';

function parseError(err) {
  const data = err?.response?.data;
  if (!data) return 'Ошибка сети. Повторите попытку.';
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  try {
    return JSON.stringify(data);
  } catch (e) {
    return 'Произошла ошибка.';
  }
}

export default function Profile() {
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [myAds, setMyAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState('');

  const styles = useMemo(() => ({
    page: {
      minHeight: '100%',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 50%, #f97316 100%)',
      padding: '24px 16px',
    },
    container: {
      maxWidth: 1100,
      margin: '0 auto',
    },
    panel: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(6px)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      color: '#0f172a',
    },
    title: {
      fontSize: 28,
      fontWeight: 800,
      margin: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      gap: 16,
    },
    card: {
      background: '#ffffff',
      borderRadius: 14,
      padding: 16,
      boxShadow: '0 8px 22px rgba(0,0,0,0.12)',
      border: '1px solid #eef2f7',
    },
    sectionTitle: {
      margin: '0 0 10px',
      fontSize: 18,
      fontWeight: 800,
      color: '#0f172a',
    },
    formGroup: {
      display: 'grid',
      gap: 10,
      marginTop: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: 700,
      color: '#334155',
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
    actions: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    alertError: {
      padding: 12,
      background: '#fee2e2',
      color: '#7f1d1d',
      border: '1px solid #fecaca',
      borderRadius: 10,
      marginTop: 10,
    },
    alertSuccess: {
      padding: 12,
      background: '#dcfce7',
      color: '#14532d',
      border: '1px solid #bbf7d0',
      borderRadius: 10,
      marginTop: 10,
    },
    adsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
    },
    adCard: {
      background: '#ffffff',
      borderRadius: 12,
      padding: 12,
      boxShadow: '0 6px 16px rgba(0,0,0,0.10)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    adHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    price: {
      fontSize: 16,
      fontWeight: 800,
      color: '#0f172a',
    },
    muted: {
      fontSize: 12,
      color: '#64748b',
      fontWeight: 600,
    },
    empty: {
      padding: 16,
      textAlign: 'center',
      color: '#334155',
      background: 'rgba(255,255,255,0.7)',
      borderRadius: 12,
    },
    buttonsRow: {
      display: 'flex',
      gap: 8,
      marginTop: 8,
    },
  }), []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
        window.handleRoutes(['/', '/login', '/register', '/profile', '/ads/new', '/ads/:id/edit', '/ads/:id', '/about']);
      }
    } catch (e) {
      // no-op
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError('');
      try {
        const m = await getMe();
        setMember(m);
        setForm({
          email: m?.email || '',
          phone: m?.phone || '',
          password: '',
        });
        await loadMyAds(m);
      } catch (err) {
        const msg = parseError(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMyAds(currentMember) {
    const m = currentMember || member;
    if (!m) return;
    setAdsLoading(true);
    setAdsError('');
    try {
      const page = await listings.list({});
      const results = Array.isArray(page?.results) ? page.results : [];
      const my = results.filter((it) => {
        const aid = it?.author?.id ?? it?.author_id ?? null;
        return aid === m.id;
      });
      setMyAds(my);
    } catch (e) {
      setAdsError(parseError(e));
      setMyAds([]);
    } finally {
      setAdsLoading(false);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!member) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        email: form.email ? form.email.trim() : null,
        phone: form.phone ? form.phone.trim() : null,
      };
      const pwd = String(form.password || '').trim();
      if (pwd) {
        payload.password = pwd;
      }
      const updated = await updateProfile(payload);
      setMember(updated);
      setSuccess('Профиль успешно обновлён');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAd(id) {
    if (!id) return;
    const ok = window.confirm('Удалить это объявление?');
    if (!ok) return;
    try {
      await listings.remove(id);
      setMyAds((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(parseError(e));
    }
  }

  if (!localStorage.getItem('token')) {
    // Should be protected by route, but keep safe fallback
    navigate('/login');
    return null;
  }

  return (
    <div style={styles.page} data-easytag="id1-react/src/components/Profile/index.jsx-root">
      <div style={styles.container}>
        <div style={styles.panel}>
          <div style={styles.header} data-easytag="id2-react/src/components/Profile/index.jsx-header">
            <h1 style={styles.title}>Профиль</h1>
            <Link to="/ads/new" className="btn btn-primary" data-easytag="id3-react/src/components/Profile/index.jsx-create">Создать объявление</Link>
          </div>
          {loading ? (
            <div style={styles.card}>Загрузка профиля...</div>
          ) : error ? (
            <div style={styles.alertError} data-easytag="id4-react/src/components/Profile/index.jsx-error">{error}</div>
          ) : (
            <div style={styles.grid}>
              <div style={styles.card} data-easytag="id5-react/src/components/Profile/index.jsx-form-card">
                <div style={styles.sectionTitle}>Настройки аккаунта</div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>Имя пользователя: <strong>{member?.username}</strong></div>
                <form onSubmit={onSubmit} data-easytag="id6-react/src/components/Profile/index.jsx-form">
                  <div style={styles.formGroup}>
                    <div data-easytag="id7-react/src/components/Profile/index.jsx-field-email">
                      <label htmlFor="email" style={styles.label}>Email</label>
                      <input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="Введите email" style={styles.input} />
                    </div>
                    <div data-easytag="id8-react/src/components/Profile/index.jsx-field-phone">
                      <label htmlFor="phone" style={styles.label}>Телефон</label>
                      <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="Введите телефон" style={styles.input} />
                    </div>
                    <div data-easytag="id9-react/src/components/Profile/index.jsx-field-password">
                      <label htmlFor="password" style={styles.label}>Пароль (необязательно)</label>
                      <input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Новый пароль (если хотите сменить)" style={styles.input} />
                    </div>
                    <div style={styles.actions}>
                      <button type="submit" className="btn btn-primary" disabled={saving} data-easytag="id10-react/src/components/Profile/index.jsx-submit">
                        {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                      </button>
                    </div>
                    {success ? (
                      <div style={styles.alertSuccess} data-easytag="id11-react/src/components/Profile/index.jsx-success">{success}</div>
                    ) : null}
                  </div>
                </form>
              </div>

              <div style={styles.card} data-easytag="id12-react/src/components/Profile/index.jsx-ads-card">
                <div style={styles.sectionTitle}>Мои объявления</div>
                {adsError ? (
                  <div style={styles.alertError}>{adsError}</div>
                ) : null}
                {adsLoading ? (
                  <div>Загрузка объявлений...</div>
                ) : myAds.length === 0 ? (
                  <div style={styles.empty}>У вас пока нет объявлений.</div>
                ) : (
                  <div style={styles.adsGrid}>
                    {myAds.map((ad) => {
                      const createdAt = ad.created_at ? new Date(ad.created_at) : null;
                      return (
                        <div key={ad.id} style={styles.adCard} data-easytag="id13-react/src/components/Profile/index.jsx-ad-item">
                          <div style={styles.adHeader}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{ad.title}</div>
                            <div style={styles.price}>{Number(ad.price).toLocaleString('ru-RU')} ₽</div>
                          </div>
                          <div style={styles.muted}>Добавлено: {createdAt ? createdAt.toLocaleString('ru-RU') : '-'}</div>
                          <div style={styles.buttonsRow}>
                            <Link to={`/ads/${ad.id}/edit`} className="btn btn-secondary" data-easytag={`id14-react/src/components/Profile/index.jsx-ad-edit-${ad.id}`}>Редактировать</Link>
                            <button type="button" className="btn btn-primary" onClick={() => handleDeleteAd(ad.id)} data-easytag={`id15-react/src/components/Profile/index.jsx-ad-delete-${ad.id}`}>Удалить</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
