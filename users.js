document.addEventListener('DOMContentLoaded', () => {
  if (!window.app) return;
  const { request, usersBaseUrl, clearToken } = window.app;
  const tbody = document.getElementById('usersList');
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const searchBox = document.getElementById('searchBox');
  const filterRole = document.getElementById('filterRole');
  const pagination = document.getElementById('pagination');
  const emailErrorDiv = document.getElementById('emailError');

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  document.getElementById('openModalBtn').addEventListener('click', () => {
    document.getElementById('formTitle').textContent = 'Cadastrar Novo Usuário';
    modal.style.display = 'flex';
  });
  document.getElementById('closeModalBtn').addEventListener('click', () => { modal.style.display = 'none'; form.reset(); document.getElementById('userId').value = ''; });

  async function loadUsers() {
    try {
      allData = await request(usersBaseUrl);
      renderTable();
    } catch (err) { 
      console.error(err);
      showOutput(emailErrorDiv, 'Erro ao carregar usuários: ' + err.message);
    }
  }

  function renderTable(filter = '', roleFilter = '') {
    const filtered = allData.filter(u => 
      (u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase())) &&
      (roleFilter === '' || u.role === roleFilter)
    );
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filtered.slice(start, start + rowsPerPage);
    
    tbody.innerHTML = pageData.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn-icon" onclick="editUser('${u._id}')">✏️</button>
          <button class="btn-icon text-danger" onclick="deleteUser('${u._id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
    renderPagination(filtered.length);
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / rowsPerPage);
    pagination.innerHTML = Array.from({length: pages}, (_, i) => 
      `<button class="page-btn ${currentPage === i+1 ? 'active' : ''}" onclick="goToPage(${i+1})">${i+1}</button>`
    ).join('');
  }

  window.goToPage = (p) => { currentPage = p; renderTable(searchBox.value, filterRole.value); };
  searchBox.addEventListener('input', (e) => { currentPage = 1; renderTable(e.target.value, filterRole.value); });
  filterRole.addEventListener('change', (e) => { currentPage = 1; renderTable(searchBox.value, e.target.value); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const payload = { 
      name: document.getElementById('userName').value,
      email: document.getElementById('userEmail').value,
      role: document.getElementById('userRole').value
    };
    if (document.getElementById('userPassword').value) payload.password = document.getElementById('userPassword').value;

    try {
      await request(id ? `${usersBaseUrl}/${id}` : `${usersBaseUrl}/register`, { 
        method: id ? 'PUT' : 'POST', 
        body: JSON.stringify(payload) 
      });
      modal.style.display = 'none';
      form.reset();
      loadUsers();
    } catch (error) {
      if (error.message.includes('Já existe')) {
        showOutput(emailErrorDiv, error.message);
      } else {
        showOutput(emailErrorDiv, error.message);
      }
    }
  });

  window.deleteUser = async (id) => {
    if (confirm('Excluir?')) {
      await request(`${usersBaseUrl}/${id}`, { method: 'DELETE' });
      loadUsers();
    }
  };

  window.editUser = (id) => {
    const u = allData.find(x => x._id === id);
    document.getElementById('userId').value = u._id;
    document.getElementById('userName').value = u.name;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userRole').value = u.role;
    document.getElementById('formTitle').textContent = 'Editar Usuário';
    modal.style.display = 'flex';
  };

  document.getElementById('logoutBtn').addEventListener('click', () => { clearToken(); location.href = 'index.html'; });
  loadUsers();
});
