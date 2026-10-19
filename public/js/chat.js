const status = document.getElementById("status");
const messages = document.getElementById("messages");
const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");

const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(
  `${protocol}//${location.host}/api/chat`
);

function addMessage(item) {
  const line = document.createElement("p");
  line.className = "message";

  const number = document.createElement("span");
  number.className = "number";
  number.textContent = `#${String(item.id).padStart(3, "0")} `;

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = `${item.name}: `;

  const text = document.createElement("span");
  text.textContent = item.message;

  line.append(number, name, text);
  messages.appendChild(line);
  messages.scrollTop = messages.scrollHeight;
}

socket.addEventListener("open", () => {
  status.textContent = "Подключено!";
});

socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.type === "history") {
      messages.replaceChildren();
      data.messages.forEach(addMessage);
    }

    if (data.type === "message") {
      addMessage(data.item);
    }
  } catch (error) {
    console.error("Ошибка чтения сообщения:", error);
  }
});

socket.addEventListener("error", () => {
  status.textContent = "Ошибка соединения";
});

socket.addEventListener("close", () => {
  status.textContent = "Соединение закрыто";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim() || "anon";
  const message = messageInput.value.trim();

  if (!message) return;

  if (socket.readyState !== WebSocket.OPEN) {
    status.textContent = "Нет соединения с чатом";
    return;
  }

  socket.send(JSON.stringify({
    type: "message",
    name,
    message
  }));

  messageInput.value = "";
  messageInput.focus();
});
