document.addEventListener("DOMContentLoaded", () => {
  initializeWebSocket();
  setupThemeToggle();
  setupDropdownMenu();
});

function initializeWebSocket() {
  let username;

  fetchUserInfo()
    .then((data) => {
      username = data.username;
      const ws = new WebSocket(`wss://${window.location.host}`);
      setupWebSocket(ws, username);
    })
    .catch((error) =>
      console.error("Erro ao obter informações do usuário:", error),
    );
}

async function fetchUserInfo() {
  const response = await fetch("/api/get-user-info");
  return response.json();
}

function setupWebSocket(ws, username) {
  ws.onopen = () => console.log("Conexão WebSocket estabelecida");

  ws.onmessage = (event) => {
    const { username: sender, text } = JSON.parse(event.data);
    appendMessage(sender, text);
  };

  ws.onerror = (error) => console.error("Erro WebSocket:", error);

  ws.onclose = () => console.log("Conexão WebSocket fechada");

  document.getElementById("sendMessage").addEventListener("click", () => {
    sendMessage(ws, username);
  });
}

function appendMessage(username, text) {
  const messageElement = document.createElement("div");
  messageElement.className = "message";
  messageElement.innerHTML = `<strong class="username">${username}</strong>: <span class="text">${text}</span>`;
  document.getElementById("messages").appendChild(messageElement);
}

function sendMessage(ws, username) {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (message) {
    const messageData = JSON.stringify({ username, text: message });
    ws.send(messageData);
    messageInput.value = "";
  }
}

function setupThemeToggle() {
  const themeToggleButton = document.querySelector(".btn-theme-toggle");
  const body = document.body;
  const chatContainer = document.querySelector(".chat-container");
  const container = document.querySelector(".input-container");

  themeToggleButton.addEventListener("click", function () {
    body.classList.toggle("dark-theme");
    chatContainer.classList.toggle("dark-theme");
    container.classList.toggle("dark-theme");
    const isDarkTheme = body.classList.contains("dark-theme");
    themeToggleButton.innerHTML = isDarkTheme
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun"></i>';
  });
}

function setupDropdownMenu() {
  const contactButton = document.querySelector(".btn-contact");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  contactButton.addEventListener("click", function (event) {
    event.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", function (event) {
    if (
      !contactButton.contains(event.target) &&
      !dropdownMenu.contains(event.target)
    ) {
      dropdownMenu.style.display = "none";
    }
  });

  const logoutButton = dropdownMenu.querySelector(".logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      fetch("/logout", { method: "POST" })
        .then((response) => {
          if (response.redirected) {
            window.location.href = response.url;
          }
        })
        .catch((error) => console.error("Erro ao fazer logout:", error));
    });
  }
}
