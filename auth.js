// ===== Botones y elementos =====
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const mainMenu = document.getElementById("mainMenu");
const topicContent = document.getElementById("topicContent");
const authMessage = document.getElementById("authMessage");

// ===== Auth0 Config =====
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "yxhjQEyDy0tTWITcCd0NU0lHeXW1T7rz";
const REDIRECT_URI = "https://veredis-math-app.netlify.app";

// Lista de usuarios revocados
const REVOKED_USERS = ["revokeduser1@example.com", "revokeduser2@example.com"];

// ===== Login =====
loginBtn.onclick = () => {
  const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
  window.location.href = authUrl;
};

// ===== Logout =====
logoutBtn.onclick = () => {
  localStorage.removeItem("access_token");
  showLoggedOut();
};

// ===== Parsear hash de Auth0 =====
function parseHash() {
  if (window.location.hash) {
    const hash = window.location.hash.substr(1).split("&").reduce((res, item) => {
      const parts = item.split("=");
      res[parts[0]] = decodeURIComponent(parts[1]);
      return res;
    }, {});
    if (hash.access_token) {
      localStorage.setItem("access_token", hash.access_token);
      window.location.hash = "";
      return true;
    }
  }
  return false;
}

// ===== Mostrar estado desconectado =====
function showLoggedOut() {
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";

  if (mainMenu) mainMenu.style.display = "none";
  if (topicContent) topicContent.innerHTML = "";
  if (authMessage) authMessage.innerHTML = "<p>Debes iniciar sesión para acceder a los temas.</p>";
}

// ===== Mostrar contenido para usuarios logueados =====
function showContent() {
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";

  if (mainMenu) mainMenu.style.display = "block";
  if (authMessage) authMessage.innerHTML = "";
}

// ===== Validar token y usuarios revocados =====
async function validateToken(token) {
  try {
    const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Token inválido");

    const userInfo = await res.json();

    if (REVOKED_USERS.includes(userInfo.email)) {
      throw new Error("Usuario bloqueado");
    }

    return true;
  } catch (e) {
    console.warn(e.message);
    localStorage.removeItem("access_token");
    return false;
  }
}

// ===== Inicializar app =====
async function initApp() {
  let tokenValid = false;

  if (parseHash()) {
    const token = localStorage.getItem("access_token");
    tokenValid = await validateToken(token);
  } else if (localStorage.getItem("access_token")) {
    const token = localStorage.getItem("access_token");
    tokenValid = await validateToken(token);
  }

  if (tokenValid) {
    showContent();
  } else {
    showLoggedOut();

    // 🔴 Fuerza login automático si no hay token válido
    window.location.href = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
  }
}


// ===== Arranca la app =====
initApp();

