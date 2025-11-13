import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create as createListing } from '../../api/listings';
import { getCategories, getConditions } from '../../api/meta';

function Create() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    contact_phone: '',
    contact_email: '',
  });

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const fieldError = (name) => {
    const val = errors?.[name];
    if (!val) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') return val;
    return '';
  };

  const categoryOptions = useMemo(() => categories || [], [categories]);
  const conditionOptions = useMemo(() => conditions || [], [conditions]);

  useEffect(() => {
    let active = true;
    async function loadMeta() {
      try {
        setLoadingMeta(true);
        const [cats, conds] = await Promise.all([getCategories(), getConditions()]);
        if (!active) return;
        setCategories(cats || []);
        setConditions(conds || []);
        setForm((prev) => ({
          ...prev,
          category: (cats && cats[0]?.key) || '',
          condition: (conds && conds[0]?.key) || '',
        }));
      } catch (e) {
        // Meta loading error is non-blocking for UI (but form will be limited)
        console.error('Failed to load meta', e);
      } finally {
        if (active) setLoadingMeta(false);
      }
    }
    loadMeta();
    return () => {
      active = false;
    };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function normalizePayload(src) {
    return {
      title: src.title?.trim(),
      description: src.description?.trim(),
      price: src.price === '' ? null : Number(src.price),
      category: src.category,
      condition: src.condition,
      contact_phone: src.contact_phone?.trim(),
      contact_email: src.contact_email?.trim(),
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError('');
    try {
      const payload = normalizePayload(form);
      const created = await createListing(payload);
      if (created?.id) {
        navigate(`/ads/${created.id}`);
      } else {
        setFormError('Неожиданный ответ сервера.');
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data) {
        if (typeof data.detail === 'string') {
          setFormError(data.detail);
        }
        if (typeof data === 'object') {
          setErrors(data);
        }
      } else {
        setFormError('Ошибка сети. Попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page" data-easytag="id1-react/src/components/Listings/Create.jsx-root">
      <h1 className="page-title">Создание объявления</h1>

      {formError ? (
        <div className="alert alert-danger" data-easytag="id2-react/src/components/Listings/Create.jsx-errors">{formError}</div>
      ) : null}

      <form className="form" onSubmit={onSubmit} data-easytag="id3-react/src/components/Listings/Create.jsx-form">
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input id="title" name="title" type="text" value={form.title} onChange={onChange} className={`input ${fieldError('title') ? 'input-error' : ''}`} placeholder="Например: Audi A4 2018" required />
          {fieldError('title') && <div className="field-error">{fieldError('title')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea id="description" name="description" value={form.description} onChange={onChange} className={`textarea ${fieldError('description') ? 'input-error' : ''}`} placeholder="Подробное описание" required />
          {fieldError('description') && <div className="field-error">{fieldError('description')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена</label>
          <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={onChange} className={`input ${fieldError('price') ? 'input-error' : ''}`} placeholder="0" required />
          {fieldError('price') && <div className="field-error">{fieldError('price')}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select id="category" name="category" value={form.category} onChange={onChange} className={`select ${fieldError('category') ? 'input-error' : ''}`} disabled={loadingMeta}>
              {categoryOptions.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {fieldError('category') && <div className="field-error">{fieldError('category')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="condition">Состояние</label>
            <select id="condition" name="condition" value={form.condition} onChange={onChange} className={`select ${fieldError('condition') ? 'input-error' : ''}`} disabled={loadingMeta}>
              {conditionOptions.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {fieldError('condition') && <div className="field-error">{fieldError('condition')}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact_phone">Контактный телефон</label>
          <input id="contact_phone" name="contact_phone" type="text" value={form.contact_phone} onChange={onChange} className={`input ${fieldError('contact_phone') ? 'input-error' : ''}`} placeholder="+7 900 000-00-00" required />
          {fieldError('contact_phone') && <div className="field-error">{fieldError('contact_phone')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="contact_email">Email</label>
          <input id="contact_email" name="contact_email" type="email" value={form.contact_email} onChange={onChange} className={`input ${fieldError('contact_email') ? 'input-error' : ''}`} placeholder="you@example.com" required />
          {fieldError('contact_email') && <div className="field-error">{fieldError('contact_email')}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Сохранение…' : 'Создать объявление'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Create;
