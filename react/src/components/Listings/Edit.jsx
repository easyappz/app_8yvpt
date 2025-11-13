import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get as getListing, update as updateListing, remove as removeListing } from '../../api/listings';
import { getCategories, getConditions } from '../../api/meta';
import { me } from '../../api/profile';

function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [member, setMember] = useState(null);

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    contact_phone: '',
    contact_email: '',
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categoryOptions = useMemo(() => categories || [], [categories]);
  const conditionOptions = useMemo(() => conditions || [], [conditions]);

  const fieldError = (name) => {
    const val = errors?.[name];
    if (!val) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') return val;
    return '';
  };

  useEffect(() => {
    let active = true;
    async function loadAll() {
      try {
        setLoading(true);
        const [listingData, cats, conds] = await Promise.all([
          getListing(id),
          getCategories(),
          getConditions(),
        ]);
        if (!active) return;
        setListing(listingData);
        setCategories(cats || []);
        setConditions(conds || []);
        setForm({
          title: listingData.title || '',
          description: listingData.description || '',
          price: String(listingData.price ?? ''),
          category: listingData.category || '',
          condition: listingData.condition || '',
          contact_phone: listingData.contact_phone || '',
          contact_email: listingData.contact_email || '',
        });
      } catch (e) {
        setFormError('Не удалось загрузить объявление.');
      } finally {
        if (active) setLoading(false);
      }
      try {
        const m = await me();
        if (active) setMember(m);
      } catch (e) {
        // Should not happen for protected route, but ignore
        if (active) setMember(null);
      }
    }
    loadAll();
    return () => {
      active = false;
    };
  }, [id]);

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

  const isOwner = useMemo(() => {
    if (!member || !listing) return false;
    return Number(member.id) === Number(listing?.author?.id);
  }, [member, listing]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError('');
    try {
      const payload = normalizePayload(form);
      const updated = await updateListing(id, payload);
      navigate(`/ads/${updated.id}`);
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
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm('Удалить объявление?')) return;
    setDeleting(true);
    setFormError('');
    try {
      await removeListing(id);
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data.detail === 'string') {
        setFormError(data.detail);
      } else {
        setFormError('Не удалось удалить объявление.');
      }
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="page" data-easytag="id1-react/src/components/Listings/Edit.jsx-loading">
        <h1 className="page-title">Редактирование объявления</h1>
        <p>Загрузка…</p>
      </section>
    );
  }

  if (!listing) {
    return (
      <section className="page" data-easytag="id2-react/src/components/Listings/Edit.jsx-notfound">
        <h1 className="page-title">Редактирование объявления</h1>
        <p>Объявление не найдено.</p>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="page" data-easytag="id3-react/src/components/Listings/Edit.jsx-notowner">
        <h1 className="page-title">Редактирование объявления</h1>
        <p>Вы не можете редактировать это объявление.</p>
      </section>
    );
  }

  return (
    <section className="page" data-easytag="id4-react/src/components/Listings/Edit.jsx-root">
      <h1 className="page-title">Редактирование объявления</h1>

      {formError ? (
        <div className="alert alert-danger" data-easytag="id5-react/src/components/Listings/Edit.jsx-errors">{formError}</div>
      ) : null}

      <form className="form" onSubmit={onSubmit} data-easytag="id6-react/src/components/Listings/Edit.jsx-form">
        <div className="form-group">
          <label htmlFor="title">Заголовок</label>
          <input id="title" name="title" type="text" value={form.title} onChange={onChange} className={`input ${fieldError('title') ? 'input-error' : ''}`} required />
          {fieldError('title') && <div className="field-error">{fieldError('title')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea id="description" name="description" value={form.description} onChange={onChange} className={`textarea ${fieldError('description') ? 'input-error' : ''}`} required />
          {fieldError('description') && <div className="field-error">{fieldError('description')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена</label>
          <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={onChange} className={`input ${fieldError('price') ? 'input-error' : ''}`} required />
          {fieldError('price') && <div className="field-error">{fieldError('price')}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select id="category" name="category" value={form.category} onChange={onChange} className={`select ${fieldError('category') ? 'input-error' : ''}`}>
              {categoryOptions.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {fieldError('category') && <div className="field-error">{fieldError('category')}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="condition">Состояние</label>
            <select id="condition" name="condition" value={form.condition} onChange={onChange} className={`select ${fieldError('condition') ? 'input-error' : ''}`}>
              {conditionOptions.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            {fieldError('condition') && <div className="field-error">{fieldError('condition')}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contact_phone">Контактный телефон</label>
          <input id="contact_phone" name="contact_phone" type="text" value={form.contact_phone} onChange={onChange} className={`input ${fieldError('contact_phone') ? 'input-error' : ''}`} required />
          {fieldError('contact_phone') && <div className="field-error">{fieldError('contact_phone')}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="contact_email">Email</label>
          <input id="contact_email" name="contact_email" type="email" value={form.contact_email} onChange={onChange} className={`input ${fieldError('contact_email') ? 'input-error' : ''}`} required />
          {fieldError('contact_email') && <div className="field-error">{fieldError('contact_email')}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить изменения'}</button>
          <button type="button" className="btn btn-danger" onClick={onDelete} disabled={deleting}>
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Edit;
