export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(path, { method = 'GET', body, formData, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData; 
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`/api${path}`, { method, headers, body: payload });
  } catch (err) {
    throw new ApiError('Cannot reach the server. Check your internet connection.', 0);
  }

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
  }

  if (!response.ok) {
    throw new ApiError(data.message || 'Something went wrong', response.status, data.errors || []);
  }

  return data;
}