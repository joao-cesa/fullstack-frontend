document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const emailErrorDiv = document.getElementById('emailError'); 

  if (!window.app) {
    console.error('window.app não carregado.');
    return;
  }

  const { request, setToken, getToken, usersBaseUrl, showOutput } = window.app;

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (emailErrorDiv) emailErrorDiv.textContent = ''; 

      try {
        const payload = {
          name: document.getElementById('registerName').value,
          email: document.getElementById('registerEmail').value,
          password: document.getElementById('registerPassword').value
        };

        await request(`${usersBaseUrl}/register`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        registerForm.reset();
        location.href = 'index.html';
      } catch (error) {
        if (emailErrorDiv) {
          showOutput(emailErrorDiv, error.message);
        } else {
          console.error("Could not find emailError div to display message:", error.message);
        }
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (emailErrorDiv) emailErrorDiv.textContent = ''; 

      try {
        const payload = {
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginPassword').value
        };

        const data = await request(`${usersBaseUrl}/login`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        setToken(data.token);
        location.href = 'properties.html';
      } catch (error) {
        if (emailErrorDiv) {
          showOutput(emailErrorDiv, error.message);
        } else {
          console.error("Could not find emailError div for login:", error.message);
        }
      }
    });
  }

  if (getToken() && location.pathname !== '/properties.html') {
    location.href = 'properties.html';
  }
});
