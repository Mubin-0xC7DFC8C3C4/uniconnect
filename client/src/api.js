export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const API_BASE_URL = 'https://uniconnect-ur0m.onrender.com/api';

export async function api(path, { method = 'GET', body, formData, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: payload });
  } catch (err) {
    throw new Error('Cannot reach the server. Check your internet connection.');
  }

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }

  return data;
}