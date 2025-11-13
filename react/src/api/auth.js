import instance from './axios';

export async function register({ username, email, phone, password }) {
  const response = await instance.post('/api/auth/register/', {
    username,
    email,
    phone,
    password,
  });
  return response.data;
}

export async function login({ username, password }) {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });
  return response.data;
}
