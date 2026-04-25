document.addEventListener('DOMContentLoaded', async () => {
  if (!window.app) return;
  const { request, usersBaseUrl, clearToken } = window.app;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      location.href = 'index.html';
    });
  }

  window.openTab = (evt, tabName) => {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
  };

  try {
    const profile = await request(`${usersBaseUrl}/me`); 
    document.getElementById('newName').value = profile.name;
    document.getElementById('newEmail').value = profile.email;
    document.getElementById('userRoleDisplay').value = profile.role;
  } catch (err) { console.error('Erro ao carregar perfil:', err); }
});
