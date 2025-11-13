import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { get as getListing, remove as removeListing } from '../../api/listings';
import { getCategories, getConditions } from '../../api/meta';
import { me } from '../../api/profile';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const categoryMap = useMemo(() => {
    const map = {};
    (categories || []).forEach((c) => { map[c.key] = c.label; });
    return map;
  }, [categories]);

  const conditionMap = useMemo(() => {
    const map = {};
    (conditions || []).forEach((c) => { map[c.key] = c.label; });
    return map;
  }, [conditions]);

  const isOwner = useMemo(() => {
    if (!member || !listing) return false;
    return Number(member.id) === Number(listing?.author?.id);
  }, [member, listing]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [l, cats, conds] = await Promise.all([
          getListing(id),
          getCategories(),
          getConditions(),
        ]);
        if (!active) return;
        setListing(l);
        setCategories(cats || []);
        setConditions(conds || []);
      } catch (e) {
        if (active) setError('Объявление не найдено.');
      } finally {
        if (active) setLoading(false);
      }
      try {
        const m = await me();
        if (active) setMember(m);
      } catch (e) {
        if (active) setMember(null);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function onDelete() {
    if (!window.confirm('Удалить объявление?')) return;
    setDeleting(true);
    try {
      await removeListing(id);
      navigate('/');
    } catch (err) {
      setDeleting(false);
      setError('Не удалось удалить объявление.');
    }
  }

  if (loading) {
    return (
      <section className="page" data-easytag="id1-react/src/components/Listings/Detail.jsx-loading">
        <h1 className="page-title">Объявление</h1>
        <p>Загрузка…</p>
      </section>
    );
  }

  if (error || !listing) {
    return (
      <section className="page" data-easytag="id2-react/src/components/Listings/Detail.jsx-error">
        <h1 className="page-title">Объявление</h1>
        <p>{error || 'Ошибка загрузки.'}</p>
      </section>
    );
  }

  const createdAt = listing?.created_at ? new Date(listing.created_at).toLocaleString('ru-RU') : '';
  const categoryLabel = categoryMap[listing.category] || listing.category;
  const conditionLabel = conditionMap[listing.condition] || listing.condition;

  return (
    <section className="page" data-easytag="id3-react/src/components/Listings/Detail.jsx-root">
      <div className="card" data-easytag="id4-react/src/components/Listings/Detail.jsx-card">
        <div className="card-header">
          <h1 className="page-title">{listing.title}</h1>
          <div className="muted">Опубликовано: {createdAt}</div>
        </div>
        <div className="card-body">
          <div className="price" data-easytag="id5-react/src/components/Listings/Detail.jsx-price">Цена: {listing.price}</div>
          <div className="meta" data-easytag="id6-react/src/components/Listings/Detail.jsx-meta">
            <span>Категория: {categoryLabel}</span>
            {' '}•{' '}
            <span>Состояние: {conditionLabel}</span>
          </div>
          <div className="description" data-easytag="id7-react/src/components/Listings/Detail.jsx-description">
            <h3>Описание</h3>
            <p>{listing.description}</p>
          </div>

          <div className="author" data-easytag="id8-react/src/components/Listings/Detail.jsx-author">
            <h3>Автор</h3>
            <div>Имя пользователя: {listing?.author?.username}</div>
            <div>Телефон: {listing.contact_phone}</div>
            {listing.contact_email ? <div>Email: {listing.contact_email}</div> : null}
          </div>

          {isOwner ? (
            <div className="owner-actions" data-easytag="id9-react/src/components/Listings/Detail.jsx-owner-actions">
              <Link to={`/ads/${listing.id}/edit`} className="btn btn-secondary">Редактировать</Link>
              <button type="button" className="btn btn-danger" onClick={onDelete} disabled={deleting}>
                {deleting ? 'Удаление…' : 'Удалить'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Detail;
