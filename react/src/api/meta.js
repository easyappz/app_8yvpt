import instance from './axios';

export async function getCategories() {
  const response = await instance.get('/api/meta/categories/');
  return response.data;
}

export async function getConditions() {
  const response = await instance.get('/api/meta/conditions/');
  return response.data;
}
