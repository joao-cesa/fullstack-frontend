document.addEventListener('DOMContentLoaded', () => {
  if (!window.app) return;
  
  const { showOutput, request, clearToken, getToken, propertiesBaseUrl } = window.app;
  const propertiesList = document.getElementById('propertiesList');
  const propertyForm = document.getElementById('propertyForm');
  const propertyIdInput = document.getElementById('propertyId');
  const propertyTitleInput = document.getElementById('propertyTitle');
  const propertyAddressInput = document.getElementById('propertyAddress');
  const propertyPurchasePriceInput = document.getElementById('propertyPurchasePrice');
  const propertyStatusInput = document.getElementById('propertyStatus');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBox = document.getElementById('searchBox');
  const filterStatus = document.getElementById('filterStatus');
  const pagination = document.getElementById('pagination');

  const modal = document.getElementById('propertyModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  if (!getToken()) { location.href = 'index.html'; return; }

  openModalBtn.addEventListener('click', () => {
    document.getElementById('formTitle').textContent = 'Cadastrar Novo Imóvel';
    modal.style.display = 'flex';
  });
  closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; propertyForm.reset(); propertyIdInput.value = ''; });
  window.addEventListener('click', (e) => { if (e.target === modal) closeModalBtn.click(); });

  async function loadProperties() {
    try {
      allData = await request(propertiesBaseUrl);
      renderTable();
    } catch (error) { showOutput(document.getElementById('apiOutput') || document.createElement('pre'), error.message); }
  }

  function renderTable(filter = '', statusFilter = '') {
    const filtered = allData.filter(p => 
      (p.title.toLowerCase().includes(filter.toLowerCase()) || p.address.toLowerCase().includes(filter.toLowerCase())) &&
      (statusFilter === '' || p.status === statusFilter)
    );
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filtered.slice(start, start + rowsPerPage);
    
    propertiesList.innerHTML = pageData.length ? pageData.map(p => `
      <tr>
        <td>${p.title}</td>
        <td>${p.address}</td>
        <td>R$ ${p.purchasePrice}</td>
        <td>${p.status}</td>
        <td>
          <button class="edit-property btn-icon" data-id="${p._id}">✏️</button>
          <button class="delete-property btn-icon text-danger" data-id="${p._id}">🗑️</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="5">Nenhum imóvel encontrado.</td></tr>';
    renderPagination(filtered.length);
  }

  function renderPagination(total) {
    const pages = Math.ceil(total / rowsPerPage);
    pagination.innerHTML = Array.from({length: pages}, (_, i) => 
      `<button class="page-btn ${currentPage === i+1 ? 'active' : ''}" onclick="goToPage(${i+1})">${i+1}</button>`
    ).join('');
  }

  window.goToPage = (p) => { currentPage = p; renderTable(searchBox.value, filterStatus.value); };
  searchBox.addEventListener('input', (e) => { currentPage = 1; renderTable(e.target.value, filterStatus.value); });
  filterStatus.addEventListener('change', (e) => { currentPage = 1; renderTable(searchBox.value, e.target.value); });

  propertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { title: propertyTitleInput.value, address: propertyAddressInput.value, purchasePrice: parseFloat(propertyPurchasePriceInput.value), status: propertyStatusInput.value };
    const id = propertyIdInput.value;
    await request(id ? `${propertiesBaseUrl}/${id}` : propertiesBaseUrl, { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    modal.style.display = 'none';
    propertyForm.reset();
    loadProperties();
  });

  propertiesList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-property')) {
      const p = allData.find(x => x._id === e.target.dataset.id);
      propertyIdInput.value = p._id;
      propertyTitleInput.value = p.title;
      propertyAddressInput.value = p.address;
      propertyPurchasePriceInput.value = p.purchasePrice;
      propertyStatusInput.value = p.status;
      document.getElementById('formTitle').textContent = 'Editar Imóvel';
      modal.style.display = 'flex';
    } else if (e.target.classList.contains('delete-property')) {
      if (confirm('Excluir imóvel?')) {
        await request(`${propertiesBaseUrl}/${e.target.dataset.id}`, { method: 'DELETE' });
        loadProperties();
      }
    }
  });

  logoutBtn.addEventListener('click', () => { clearToken(); location.href = 'index.html'; });
  loadProperties();
});