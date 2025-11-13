import instance from './axios';

export async function list(params) {
  const response = await instance.get('/api/listings/', { params });
  return response.data;
}

export async function get(id) {
  const response = await instance.get(`/api/listings/${id}/`);
  return response.data;
}

export async function create(data) {
  const response = await instance.post('/api/listings/', data);
  return response.data;
}

export async function update(id, data) {
  const response = await instance.patch(`/api/listings/${id}/`, data);
  return response.data;
}

export async function remove(id) {
  const response = await instance.delete(`/api/listings/${id}/`);
  return response.data;
}
