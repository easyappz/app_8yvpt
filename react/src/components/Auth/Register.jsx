import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../../api/auth';

function extractErrors(error) {
  const data = error?.response?.data;
  const result = { detail: '', fields: {} };
  if (!data) {
    result.detail = 'Не удалось выполнить запрос. Повторите попытку позже.';
    return result;
  }
  if (typeof data === 'string') {
    result.detail = data;
    return result;
  }
  if (data.detail) {
    result.detail = String(data.detail);
  }
  // Collect field errors if present
  ['username', 'email', 'phone', 'password', 'non_field_errors'].forEach((key) => {
    if (data[key]) {
      const val = Array.isArray(data[key]) ? data[key].join(' ') : String(data[key]);
      result.fields[key] = val;
      if (!result.detail && key === 'non_field_errors') {
        result.detail = val;
      }
    }
  });
  if (!result.detail && Object.keys(data).length > 0) {
    try {
      result.detail = JSON.stringify(data);
    } catch (e) {
      result.detail = 'Ошибка валидации.';
    }
  }
  return result;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      await registerApi({
        username: form.username.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        password: form.password,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      const parsed = extractErrors(err);
      setError(parsed.detail);
      setFieldErrors(parsed.fields || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page" data-easytag="id1-react/src/components/Auth/Register.jsx-root">
      <div className="auth-card" data-easytag="id2-react/src/components/Auth/Register.jsx-card">
        <h1 className="auth-title">Регистрация</h1>
        {error ? (
          <div className="alert alert-error" data-easytag="id3-react/src/components/Auth/Register.jsx-error">
            {error}
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="form" data-easytag="id4-react/src/components/Auth/Register.jsx-form">
          <div className="form-group" data-easytag="id5-react/src/components/Auth/Register.jsx-field-username">
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
              data-easytag="id6-react/src/components/Auth/Register.jsx-input-username"
            />
            {fieldErrors.username ? (
              <div className="field-error" data-easytag="id7-react/src/components/Auth/Register.jsx-err-username">{fieldErrors.username}</div>
            ) : null}
          </div>

          <div className="form-group" data-easytag="id8-react/src/components/Auth/Register.jsx-field-email">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              placeholder="Введите email (необязательно)"
              className="input"
              data-easytag="id9-react/src/components/Auth/Register.jsx-input-email"
            />
            {fieldErrors.email ? (
              <div className="field-error" data-easytag="id10-react/src/components/Auth/Register.jsx-err-email">{fieldErrors.email}</div>
            ) : null}
          </div>

          <div className="form-group" data-easytag="id11-react/src/components/Auth/Register.jsx-field-phone">
            <label htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={onChange}
              placeholder="Введите телефон (необязательно)"
              className="input"
              data-easytag="id12-react/src/components/Auth/Register.jsx-input-phone"
            />
            {fieldErrors.phone ? (
              <div className="field-error" data-easytag="id13-react/src/components/Auth/Register.jsx-err-phone">{fieldErrors.phone}</div>
            ) : null}
          </div>

          <div className="form-group" data-easytag="id14-react/src/components/Auth/Register.jsx-field-password">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="Придумайте пароль"
              className="input"
              data-easytag="id15-react/src/components/Auth/Register.jsx-input-password"
            />
            {fieldErrors.password ? (
              <div className="field-error" data-easytag="id16-react/src/components/Auth/Register.jsx-err-password">{fieldErrors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            data-easytag="id17-react/src/components/Auth/Register.jsx-submit"
          >
            {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-alt" data-easytag="id18-react/src/components/Auth/Register.jsx-alt">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </section>
  );
}
