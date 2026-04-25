(function() {
  const token = localStorage.getItem('token');
  if (!token) {
    location.href = '/frontend/index.html';
  }
})();
