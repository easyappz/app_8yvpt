import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';

import { Home } from './components/Home';

function ProtectedRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Header({ authed }) {
  return (
    <header className="app-header" data-easytag="id1-react/src/App.jsx-header">
      <nav className="app-nav container" data-easytag="id2-react/src/App.jsx-nav">
        <div className="brand">
          <Link to="/" className="brand-link">EasyBoard</Link>
        </div>
        <ul className="nav-list">
          <li><Link to="/" className="nav-link">Главная</Link></li>
          <li><Link to="/about" className="nav-link">О проекте</Link></li>
          <li>
            {authed ? (
              <Link to="/profile" className="nav-link">Профиль</Link>
            ) : (
              <Link to="/login" className="nav-link">Войти</Link>
            )}
          </li>
          <li>
            <Link to="/ads/new" className="btn btn-primary">Создать объявление</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

// Simple placeholder pages (RU labels)
function RegisterPage() {
  return (
    <section className="page" data-easytag="id4-react/src/App.jsx-register">
      <h1>Регистрация</h1>
      <p>Зарегистрируйтесь, чтобы публиковать объявления.</p>
    </section>
  );
}

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const handleDemoLogin = () => {
    localStorage.setItem('token', 'demo-token');
    if (typeof onLoginSuccess === 'function') onLoginSuccess();
    navigate('/profile', { replace: true });
  };
  return (
    <section className="page" data-easytag="id5-react/src/App.jsx-login">
      <h1>Вход</h1>
      <p>Авторизуйтесь, чтобы управлять своими объявлениями.</p>
      <button className="btn btn-primary" onClick={handleDemoLogin}>Войти (демо)</button>
    </section>
  );
}

function ProfilePage() {
  return (
    <section className="page" data-easytag="id6-react/src/App.jsx-profile">
      <h1>Профиль</h1>
      <p>Здесь будут настройки профиля и список ваших объявлений.</p>
    </section>
  );
}

function NewAdPage() {
  return (
    <section className="page" data-easytag="id7-react/src/App.jsx-ads-new">
      <h1>Создание объявления</h1>
      <p>Форма создания нового объявления.</p>
    </section>
  );
}

function EditAdPage() {
  const { id } = useParams();
  return (
    <section className="page" data-easytag="id8-react/src/App.jsx-ads-edit">
      <h1>Редактирование объявления</h1>
      <p>ID объявления: {id}</p>
    </section>
  );
}

function AdViewPage() {
  const { id } = useParams();
  return (
    <section className="page" data-easytag="id9-react/src/App.jsx-ads-view">
      <h1>Просмотр объявления</h1>
      <p>ID объявления: {id}</p>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="page" data-easytag="id10-react/src/App.jsx-about">
      <h1>О проекте</h1>
      <p>Платформа для размещения объявлений: автомобили и недвижимость.</p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="page" data-easytag="id11-react/src/App.jsx-404">
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь на главную.</p>
      <Link to="/" className="btn btn-secondary">На главную</Link>
    </section>
  );
}

function App() {
  const [authed, setAuthed] = useState(Boolean(typeof window !== 'undefined' && localStorage.getItem('token')));

  useEffect(() => {
    const onStorage = () => setAuthed(Boolean(localStorage.getItem('token')));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const appRoutes = useMemo(
    () => [
      '/',
      '/register',
      '/login',
      '/profile',
      '/ads/new',
      '/ads/:id/edit',
      '/ads/:id',
      '/about',
    ],
    []
  );

  /** Никогда не удаляй этот код */
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      /** Нужно передавать список существующих роутов */
      window.handleRoutes(appRoutes);
    }
  }, [appRoutes]);

  return (
    <ErrorBoundary>
      <div className="app-root" data-easytag="id0-react/src/App.jsx-root">
        <Header authed={authed} />
        <main className="main-content container" data-easytag="id3-react/src/App.jsx-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={() => setAuthed(true)} />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/ads/new" element={<ProtectedRoute><NewAdPage /></ProtectedRoute>} />
            <Route path="/ads/:id/edit" element={<ProtectedRoute><EditAdPage /></ProtectedRoute>} />
            <Route path="/ads/:id" element={<AdViewPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
