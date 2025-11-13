import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../../api/auth';

function extractErrors(error) {
  const data = error?.response?.data;
  if (!data) return 'Не удалось выполнить запрос. Проверьте подключение к сети.';
  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);
  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : String(data.non_field_errors);
  }
  try {
    return JSON.stringify(data);
  } catch (e) {
    return 'Ошибка авторизации.';
  }
}

export default function Login({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginApi({ username: form.username.trim(), password: form.password });
      const token = data?.access;
      const member = data?.member || null;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (member) {
        try { localStorage.setItem('member', JSON.stringify(member)); } catch (e) { /* ignore JSON errors */ }
      }
      if (typeof onSuccess === 'function') {
        try { onSuccess(); } catch (e) { /* ignore */ }
      }
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page" data-easytag="id1-react/src/components/Auth/Login.jsx-root">
      <div className="auth-card" data-easytag="id2-react/src/components/Auth/Login.jsx-card">
        <h1 className="auth-title">Вход</h1>
        {error ? (
          <div className="alert alert-error" data-easytag="id3-react/src/components/Auth/Login.jsx-error">{error}</div>
        ) : null}
        <form onSubmit={onSubmit} className="form" data-easytag="id4-react/src/components/Auth/Login.jsx-form">
          <div className="form-group" data-easytag="id5-react/src/components/Auth/Login.jsx-field-username">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={onChange}
              required
              placeholder="Введите имя пользователя"
              className="input"
              data-easytag="id6-react/src/components/Auth/Login.jsx-input-username"
            />
          </div>
          <div className="form-group" data-easytag="id7-react/src/components/Auth/Login.jsx-field-password">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="Введите пароль"
              className="input"
              data-easytag="id8-react/src/components/Auth/Login.jsx-input-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            data-easytag="id9-react/src/components/Auth/Login.jsx-submit"
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        <p className="auth-alt" data-easytag="id10-react/src/components/Auth/Login.jsx-alt">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </section>
  );
}
