document.addEventListener('DOMContentLoaded', () => {
  const topicContent = document.getElementById('topicContent');
  const mainMenu = document.getElementById('mainMenu');
  const authMessage = document.getElementById('authMessage');

  document.getElementById('loadTopic').addEventListener('click', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      authMessage.innerHTML = "<p>Debes iniciar sesión para ver este contenido.</p>";
      return;
    }

    const topic = document.getElementById('topicSelect').value;
    if (!topic) {
      topicContent.innerHTML = "<p>Por favor, selecciona un tema.</p>";
      return;
    }

    fetch(`topics/${topic}.html`)
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el tema');
        return response.text();
      })
      .then(html => {
        topicContent.innerHTML = html;
        const scripts = topicContent.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          newScript.text = oldScript.text;
          document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });
      })
      .catch(err => topicContent.innerHTML = `<p>Error: ${err.message}</p>`);
  });

  // Mostrar menú si ya hay token válido
  if (localStorage.getItem('access_token')) {
    mainMenu.style.display = 'block';
    authMessage.innerHTML = '';
  }
});

