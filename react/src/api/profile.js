import instance from './axios';

export async function me() {
  const response = await instance.get('/api/profile/');
  return response.data;
}

export async function updateProfile(data) {
  const response = await instance.patch('/api/profile/', data);
  return response.data;
}
