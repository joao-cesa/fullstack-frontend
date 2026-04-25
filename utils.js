const usersBaseUrl = 'https://fullstack-backend-0lup.onrender.com/api/users';
const propertiesBaseUrl = 'https://fullstack-backend-0lup.onrender.com/api/properties';

window.app = {
  getToken,
  setToken,
  clearToken,
  showOutput,
  request,
  usersBaseUrl,
  propertiesBaseUrl
};

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function showOutput(element, data) {
  if (element) {
    element.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  } else {
    console.log('');
  }
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição.');
  }

  return data;
}
