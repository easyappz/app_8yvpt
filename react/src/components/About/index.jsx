import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <section className="page about-page" data-easytag="id1-react/src/components/About/index.jsx-root">
      <div className="about-hero" data-easytag="id2-react/src/components/About/index.jsx-hero">
        <span className="hero-badge">О платформе</span>
        <h1 className="hero-title">EasyBoard — современная доска объявлений</h1>
        <p className="hero-subtitle">Размещайте и находите выгодные предложения по автомобилям и недвижимости. Простой интерфейс, удобные фильтры и прозрачная коммуникация между продавцом и покупателем.</p>
        <div className="hero-actions">
          <Link to="/" className="btn btn-secondary" data-easytag="id3-react/src/components/About/index.jsx-go-home">На главную</Link>
          <Link to="/ads/new" className="btn btn-primary" data-easytag="id4-react/src/components/About/index.jsx-create">Создать объявление</Link>
        </div>
      </div>

      <div className="features-grid" data-easytag="id5-react/src/components/About/index.jsx-features">
        <div className="feature-card" data-easytag="id6-react/src/components/About/index.jsx-feature-1">
          <div className="img-placeholder" role="img" aria-label="Заглушка изображения — поиск" data-easytag="id7-react/src/components/About/index.jsx-img-1">Изображение</div>
          <h3>Удобный поиск</h3>
          <p>Фильтры по категории, цене, дате, состоянию и ключевым словам помогают быстрее находить нужные объявления.</p>
        </div>
        <div className="feature-card" data-easytag="id8-react/src/components/About/index.jsx-feature-2">
          <div className="img-placeholder" role="img" aria-label="Заглушка изображения — профиль" data-easytag="id9-react/src/components/About/index.jsx-img-2">Изображение</div>
          <h3>Профиль и управление</h3>
          <p>Авторизованные пользователи редактируют профиль и управляют своими объявлениями: создавать, менять и удалять.</p>
        </div>
        <div className="feature-card" data-easytag="id10-react/src/components/About/index.jsx-feature-3">
          <div className="img-placeholder" role="img" aria-label="Заглушка изображения — контакты" data-easytag="id11-react/src/components/About/index.jsx-img-3">Изображение</div>
          <h3>Прямые контакты</h3>
          <p>На странице объявления отображаются контактные данные автора: телефон и email для оперативной связи.</p>
        </div>
      </div>

      <div className="about-block" data-easytag="id12-react/src/components/About/index.jsx-text-1">
        <h2>Почему EasyBoard?</h2>
        <ul>
          <li>Простой интерфейс и насыщенный современный дизайн.</li>
          <li>Фокус на двух ключевых категориях: автомобили и недвижимость.</li>
          <li>Прозрачность — важные детали видны сразу: цена, состояние, контакты.</li>
        </ul>
      </div>

      <div className="about-gallery" data-easytag="id13-react/src/components/About/index.jsx-gallery">
        <div className="img-placeholder large" role="img" aria-label="Заглушка изображения — галерея 1" data-easytag="id14-react/src/components/About/index.jsx-gal-1">Изображение</div>
        <div className="img-placeholder large" role="img" aria-label="Заглушка изображения — галерея 2" data-easytag="id15-react/src/components/About/index.jsx-gal-2">Изображение</div>
      </div>

      <div className="about-cta" data-easytag="id16-react/src/components/About/index.jsx-cta">
        <h2>Готовы начать?</h2>
        <p>Зарегистрируйтесь, чтобы создать профиль, и разместите ваше первое объявление за пару минут.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-secondary" data-easytag="id17-react/src/components/About/index.jsx-register">Зарегистрироваться</Link>
          <Link to="/ads/new" className="btn btn-primary" data-easytag="id18-react/src/components/About/index.jsx-cta-new">Создать объявление</Link>
        </div>
      </div>
    </section>
  );
}

export default About;
